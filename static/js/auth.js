// JavaScript для страниц авторизации

document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    initPasswordStrength();
    initPasswordToggle();
    initFormValidation();
});

// Инициализация форм авторизации
function initAuthForms() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

// Обработка отправки формы регистрации
async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('#submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Показываем загрузку
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch('/register', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const result = await response.text();
            // Обновляем страницу для показа сообщений об ошибках
            document.documentElement.innerHTML = result;
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showNotification('Произошла ошибка при регистрации. Попробуйте позже.', 'error');
    } finally {
        // Скрываем загрузку
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Обработка отправки формы входа
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('#submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Показываем загрузку
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const result = await response.text();
            // Обновляем страницу для показа сообщений об ошибках
            document.documentElement.innerHTML = result;
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        showNotification('Произошла ошибка при входе. Попробуйте позже.', 'error');
    } finally {
        // Скрываем загрузку
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Инициализация проверки силы пароля
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
    }
}

// Проверка силы пароля
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let feedback = [];
    
    // Проверяем длину
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedback.push('Минимум 8 символов');
    }
    
    // Проверяем наличие заглавных букв
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Заглавные буквы');
    }
    
    // Проверяем наличие строчных букв
    if (/[a-z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Строчные буквы');
    }
    
    // Проверяем наличие цифр
    if (/\d/.test(password)) {
        strength += 25;
    } else {
        feedback.push('Цифры');
    }
    
    // Обновляем индикатор
    strengthFill.style.width = strength + '%';
    
    // Определяем текст силы
    let strengthLabel = 'Слабый';
    let strengthColor = '#ff4444';
    
    if (strength >= 100) {
        strengthLabel = 'Отличный';
        strengthColor = '#00ff88';
    } else if (strength >= 75) {
        strengthLabel = 'Хороший';
        strengthColor = '#00d4ff';
    } else if (strength >= 50) {
        strengthLabel = 'Средний';
        strengthColor = '#ffaa00';
    } else if (strength >= 25) {
        strengthLabel = 'Слабый';
        strengthColor = '#ff4444';
    }
    
    strengthFill.style.background = strengthColor;
    strengthText.textContent = strengthLabel;
    strengthText.style.color = strengthColor;
    
    // Обновляем валидацию
    updatePasswordValidation(feedback);
}

// Проверка совпадения паролей
function checkPasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const passwordMatch = document.getElementById('passwordMatch');
    
    if (!passwordInput || !confirmPasswordInput || !passwordMatch) return;
    
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword === '') {
        passwordMatch.style.display = 'none';
        return;
    }
    
    if (password === confirmPassword) {
        passwordMatch.style.display = 'none';
        confirmPasswordInput.style.borderColor = '#00ff88';
    } else {
        passwordMatch.style.display = 'block';
        passwordMatch.querySelector('.match-text').textContent = 'Пароли не совпадают';
        confirmPasswordInput.style.borderColor = '#ff4444';
    }
}

// Обновление валидации пароля
function updatePasswordValidation(feedback) {
    const validationInfo = document.querySelector('.validation-info .validation-text');
    if (validationInfo) {
        if (feedback.length > 0) {
            validationInfo.textContent = 'Необходимо: ' + feedback.join(', ');
            validationInfo.style.color = '#ff4444';
        } else {
            validationInfo.textContent = 'Пароль соответствует требованиям';
            validationInfo.style.color = '#00ff88';
        }
    }
}

// Инициализация переключения видимости пароля
function initPasswordToggle() {
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const toggleBtn = input.parentElement.querySelector('.password-toggle');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            input.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    };
}

// Инициализация валидации форм
function initFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Валидация в реальном времени
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Валидация поля
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Очищаем предыдущие ошибки
    clearFieldError(field);
    
    // Проверяем обязательные поля
    if (field.hasAttribute('required') && value === '') {
        showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    // Специфичные проверки
    switch (fieldName) {
        case 'username':
            if (value.length < 3) {
                showFieldError(field, 'Имя пользователя должно содержать минимум 3 символа');
                return false;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(field, 'Имя пользователя может содержать только буквы, цифры и подчеркивания');
                return false;
            }
            break;
            
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showFieldError(field, 'Введите корректный email адрес');
                return false;
            }
            break;
            
        case 'password':
            if (value.length < 8) {
                showFieldError(field, 'Пароль должен содержать минимум 8 символов');
                return false;
            }
            if (!/[A-Z]/.test(value)) {
                showFieldError(field, 'Пароль должен содержать заглавные буквы');
                return false;
            }
            if (!/[a-z]/.test(value)) {
                showFieldError(field, 'Пароль должен содержать строчные буквы');
                return false;
            }
            if (!/\d/.test(value)) {
                showFieldError(field, 'Пароль должен содержать цифры');
                return false;
            }
            break;
            
        case 'confirm_password':
            const password = document.getElementById('password');
            if (password && value !== password.value) {
                showFieldError(field, 'Пароли не совпадают');
                return false;
            }
            break;
    }
    
    return true;
}

// Показать ошибку поля
function showFieldError(field, message) {
    field.style.borderColor = '#ff4444';
    
    // Создаем элемент ошибки
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ff4444;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        animation: slideIn 0.3s ease;
    `;
    
    // Добавляем после поля
    field.parentElement.appendChild(errorElement);
}

// Очистить ошибку поля
function clearFieldError(field) {
    field.style.borderColor = '';
    
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 10px;
        padding: 1rem;
        backdrop-filter: blur(10px);
        box-shadow: var(--glow-primary);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Анимация появления ошибок
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Функция для предотвращения множественных отправок
function preventMultipleSubmissions() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        let isSubmitting = false;
        
        form.addEventListener('submit', function(e) {
            if (isSubmitting) {
                e.preventDefault();
                return false;
            }
            
            isSubmitting = true;
            
            // Сброс флага через 5 секунд
            setTimeout(() => {
                isSubmitting = false;
            }, 5000);
        });
    });
}

// Инициализация предотвращения множественных отправок
preventMultipleSubmissions();

// Функция для очистки форм при загрузке страницы
function clearFormsOnLoad() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.reset();
        
        // Очищаем все ошибки
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        // Сбрасываем стили полей
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    });
}

// Очистка форм при загрузке
clearFormsOnLoad();

// Функция для обработки ошибок
window.addEventListener('error', function(e) {
    console.error('JavaScript ошибка:', e.error);
});

// Функция для обработки необработанных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанная ошибка промиса:', e.reason);
});