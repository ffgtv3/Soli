from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import os
import re
import secrets
from datetime import datetime, timedelta
import hashlib
import hmac

app = Flask(__name__)

# Конфигурация безопасности
app.config['SECRET_KEY'] = secrets.token_hex(32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///minecraft_server.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['WTF_CSRF_ENABLED'] = True
app.config['WTF_CSRF_TIME_LIMIT'] = 3600

# Инициализация расширений
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)

# Ограничение запросов для защиты от DDoS
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Модель пользователя
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    failed_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime)
    is_admin = db.Column(db.Boolean, default=False)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# Модель для логирования попыток входа
class LoginAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    username = db.Column(db.String(80), nullable=False)
    success = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Функции безопасности
def is_valid_username(username):
    """Проверка валидности имени пользователя"""
    if len(username) < 3 or len(username) > 20:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_]+$', username))

def is_valid_email(email):
    """Проверка валидности email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def is_strong_password(password):
    """Проверка сложности пароля"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

def sanitize_input(text):
    """Очистка пользовательского ввода"""
    if not text:
        return ""
    # Удаляем потенциально опасные символы
    text = re.sub(r'[<>"\']', '', text)
    return text.strip()

def check_rate_limit(ip_address, action, limit=5, window=300):
    """Проверка ограничений на действия"""
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=window)
    
    if action == 'login':
        attempts = LoginAttempt.query.filter_by(
            ip_address=ip_address,
            success=False,
            timestamp__gte=window_start
        ).count()
    else:
        attempts = 0
    
    return attempts < limit

# Middleware для безопасности
@app.before_request
def before_request():
    # Проверка CSRF токена для POST запросов
    if request.method == 'POST':
        if not request.is_xhr and not request.path.startswith('/static/'):
            pass  # CSRF проверка уже включена через CSRFProtect
    
    # Проверка User-Agent
    user_agent = request.headers.get('User-Agent', '')
    if not user_agent or len(user_agent) < 10:
        return jsonify({'error': 'Invalid request'}), 400
    
    # Проверка на подозрительные заголовки
    suspicious_headers = ['X-Forwarded-For', 'X-Real-IP', 'X-Client-IP']
    for header in suspicious_headers:
        if header in request.headers:
            return jsonify({'error': 'Invalid request'}), 400

# Маршруты
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def register():
    if request.method == 'POST':
        username = sanitize_input(request.form.get('username', ''))
        email = sanitize_input(request.form.get('email', ''))
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Валидация
        errors = []
        
        if not username:
            errors.append('Имя пользователя обязательно')
        elif not is_valid_username(username):
            errors.append('Имя пользователя должно содержать только буквы, цифры и подчеркивания (3-20 символов)')
        
        if not email:
            errors.append('Email обязателен')
        elif not is_valid_email(email):
            errors.append('Некорректный email')
        
        if not password:
            errors.append('Пароль обязателен')
        elif not is_strong_password(password):
            errors.append('Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры')
        
        if password != confirm_password:
            errors.append('Пароли не совпадают')
        
        # Проверка существования пользователя
        if User.query.filter_by(username=username).first():
            errors.append('Пользователь с таким именем уже существует')
        
        if User.query.filter_by(email=email).first():
            errors.append('Пользователь с таким email уже существует')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('register.html')
        
        # Создание пользователя
        try:
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            flash('Регистрация успешна! Теперь вы можете войти.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash('Ошибка при регистрации. Попробуйте позже.', 'error')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def login():
    if request.method == 'POST':
        username = sanitize_input(request.form.get('username', ''))
        password = request.form.get('password', '')
        
        # Проверка ограничений
        if not check_rate_limit(request.remote_addr, 'login'):
            flash('Слишком много попыток входа. Попробуйте позже.', 'error')
            return render_template('login.html')
        
        # Логирование попытки
        login_attempt = LoginAttempt(
            ip_address=request.remote_addr,
            username=username
        )
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            # Проверка блокировки
            if user.locked_until and user.locked_until > datetime.utcnow():
                remaining = user.locked_until - datetime.utcnow()
                flash(f'Аккаунт заблокирован. Попробуйте через {int(remaining.total_seconds())} секунд.', 'error')
                login_attempt.success = False
                db.session.add(login_attempt)
                db.session.commit()
                return render_template('login.html')
            
            # Успешный вход
            session['user_id'] = user.id
            session['username'] = user.username
            user.last_login = datetime.utcnow()
            user.failed_attempts = 0
            user.locked_until = None
            login_attempt.success = True
            
            db.session.add(login_attempt)
            db.session.commit()
            
            flash('Вход выполнен успешно!', 'success')
            return redirect(url_for('dashboard'))
        else:
            # Неудачная попытка
            if user:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            
            login_attempt.success = False
            db.session.add(login_attempt)
            db.session.commit()
            
            flash('Неверное имя пользователя или пароль.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Вы вышли из системы.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', user=user)

@app.route('/server-info')
def server_info():
    return render_template('server_info.html')

# API для проверки статуса сервера
@app.route('/api/server-status')
def server_status():
    # Здесь можно добавить реальную проверку статуса Minecraft сервера
    return jsonify({
        'status': 'online',
        'players': 12,
        'max_players': 50,
        'version': '1.20.1',
        'uptime': '2 days, 5 hours'
    })

# Обработка ошибок
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Создание базы данных
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=55555, debug=False)