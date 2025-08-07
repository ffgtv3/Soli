// JavaScript для панели управления

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initServerStatus();
    initCopyFunctions();
    initAnimations();
});

// Инициализация панели управления
function initDashboard() {
    // Обновляем время последнего входа
    updateLastLoginTime();
    
    // Инициализируем анимации карточек
    animateCards();
    
    // Инициализируем интерактивные элементы
    initInteractiveElements();
}

// Обновление времени последнего входа
function updateLastLoginTime() {
    const lastLoginElement = document.querySelector('.info-value');
    if (lastLoginElement && lastLoginElement.textContent.includes(':')) {
        // Форматируем время в относительном формате
        const loginTime = new Date(lastLoginElement.textContent);
        const now = new Date();
        const diff = now - loginTime;
        
        let timeAgo = '';
        if (diff < 60000) { // меньше минуты
            timeAgo = 'Только что';
        } else if (diff < 3600000) { // меньше часа
            const minutes = Math.floor(diff / 60000);
            timeAgo = `${minutes} мин. назад`;
        } else if (diff < 86400000) { // меньше дня
            const hours = Math.floor(diff / 3600000);
            timeAgo = `${hours} ч. назад`;
        } else {
            const days = Math.floor(diff / 86400000);
            timeAgo = `${days} дн. назад`;
        }
        
        lastLoginElement.textContent = timeAgo;
    }
}

// Анимация карточек
function animateCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Инициализация интерактивных элементов
function initInteractiveElements() {
    // Добавляем hover эффекты для карточек
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Анимация для кнопок действий
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Инициализация статуса сервера
function initServerStatus() {
    updateServerStatus();
    
    // Обновляем статус каждые 30 секунд
    setInterval(updateServerStatus, 30000);
}

// Обновление статуса сервера
async function updateServerStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const playerCount = document.getElementById('playerCount');
    const uptime = document.getElementById('uptime');
    
    try {
        const response = await fetch('/api/server-status');
        const data = await response.json();
        
        if (data.status === 'online') {
            // Обновляем статус
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator online';
            }
            if (statusText) {
                statusText.textContent = 'Онлайн';
            }
            
            // Обновляем количество игроков
            if (playerCount) {
                animateCounter(playerCount, parseInt(playerCount.textContent) || 0, data.players, 1000);
            }
            
            // Обновляем аптайм
            if (uptime) {
                uptime.textContent = data.uptime;
            }
            
            // Анимация пульсации для индикатора
            if (statusIndicator) {
                statusIndicator.style.animation = 'pulse 2s ease-in-out infinite';
            }
        } else {
            // Сервер оффлайн
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator offline';
                statusIndicator.style.animation = 'none';
            }
            if (statusText) {
                statusText.textContent = 'Оффлайн';
            }
            if (playerCount) {
                playerCount.textContent = '0';
            }
            if (uptime) {
                uptime.textContent = 'Недоступно';
            }
        }
    } catch (error) {
        console.error('Ошибка при получении статуса сервера:', error);
        
        // Показываем ошибку
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator error';
            statusIndicator.style.animation = 'none';
        }
        if (statusText) {
            statusText.textContent = 'Ошибка';
        }
    }
}

// Анимация счетчика
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (difference * progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Инициализация функций копирования
function initCopyFunctions() {
    // Копирование адреса сервера
    window.copyServerAddress = function() {
        const serverAddress = '8b4t.duckdns.org:55555';
        copyToClipboard(serverAddress);
        showNotification('Адрес сервера скопирован в буфер обмена!', 'success');
    };
    
    // Копирование текста
    window.copyText = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            copyToClipboard(element.textContent);
            showNotification('Текст скопирован в буфер обмена!', 'success');
        }
    };
    
    // Запуск Minecraft
    window.openMinecraft = function() {
        const serverAddress = '8b4t.duckdns.org:55555';
        const minecraftUrl = `minecraft://?addExternalServer=8B4T|${serverAddress}`;
        
        try {
            window.location.href = minecraftUrl;
            showNotification('Попытка запуска Minecraft...', 'info');
        } catch (error) {
            showNotification('Не удалось запустить Minecraft. Убедитесь, что игра установлена.', 'error');
        }
    };
}

// Функция для копирования в буфер обмена
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    } catch (error) {
        console.error('Ошибка при копировании:', error);
        showNotification('Ошибка при копировании', 'error');
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

// Инициализация анимаций
function initAnimations() {
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдаем за уведомлениями
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Функция для обновления времени в реальном времени
function updateRealTime() {
    const now = new Date();
    const timeElement = document.querySelector('.current-time');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('ru-RU');
    }
}

// Обновляем время каждую секунду
setInterval(updateRealTime, 1000);

// Функция для проверки активности пользователя
function initUserActivity() {
    let lastActivity = Date.now();
    
    // Обновляем время активности при любом действии пользователя
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        });
    });
    
    // Проверяем активность каждые 5 минут
    setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        const inactiveMinutes = Math.floor(inactiveTime / 60000);
        
        if (inactiveMinutes >= 30) { // 30 минут неактивности
            showNotification('Вы неактивны уже 30 минут. Сессия может быть завершена.', 'warning');
        }
    }, 300000); // 5 минут
}

// Инициализация отслеживания активности
initUserActivity();

// Функция для экспорта данных пользователя
function exportUserData() {
    const userData = {
        username: document.querySelector('.info-value')?.textContent || '',
        email: document.querySelectorAll('.info-value')[1]?.textContent || '',
        registrationDate: document.querySelectorAll('.info-value')[2]?.textContent || '',
        lastLogin: document.querySelectorAll('.info-value')[3]?.textContent || ''
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'user-data.json';
    link.click();
    
    showNotification('Данные экспортированы!', 'success');
}

// Добавляем функцию экспорта в глобальную область
window.exportUserData = exportUserData;

// Функция для очистки кэша
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    showNotification('Кэш очищен!', 'success');
}

// Добавляем функцию очистки кэша в глобальную область
window.clearCache = clearCache;

// Функция для обработки ошибок
window.addEventListener('error', function(e) {
    console.error('JavaScript ошибка:', e.error);
});

// Функция для обработки необработанных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанная ошибка промиса:', e.reason);
});

// Функция для оптимизации производительности
function optimizePerformance() {
    // Отключаем анимации для пользователей с предпочтением reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer не поддерживается');
        // Показываем все элементы сразу
        document.querySelectorAll('.dashboard-card, .notification-item').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

// Инициализация оптимизации
optimizePerformance();