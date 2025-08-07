// Основной JavaScript файл для главной страницы

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех функций
    initServerStatus();
    initAnimations();
    initSmoothScrolling();
    initCopyFunctions();
});

// Функция для получения статуса сервера
async function initServerStatus() {
    const playerCountElement = document.getElementById('player-count');
    const serverStatusElement = document.getElementById('server-status');
    const serverUptimeElement = document.getElementById('server-uptime');
    
    if (!playerCountElement) return;
    
    try {
        const response = await fetch('/api/server-status');
        const data = await response.json();
        
        if (data.status === 'online') {
            playerCountElement.textContent = data.players;
            if (serverStatusElement) {
                serverStatusElement.textContent = 'Онлайн';
                serverStatusElement.className = 'status online';
            }
            if (serverUptimeElement) {
                serverUptimeElement.textContent = data.uptime;
            }
        } else {
            playerCountElement.textContent = '0';
            if (serverStatusElement) {
                serverStatusElement.textContent = 'Оффлайн';
                serverStatusElement.className = 'status offline';
            }
        }
    } catch (error) {
        console.error('Ошибка при получении статуса сервера:', error);
        playerCountElement.textContent = '?';
    }
}

// Функция для инициализации анимаций
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
    
    // Наблюдаем за всеми карточками и секциями
    const animatedElements = document.querySelectorAll('.server-card, .feature-card, .stat-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Анимация счетчика игроков
    const playerCountElement = document.getElementById('player-count');
    if (playerCountElement) {
        animateCounter(playerCountElement, 0, parseInt(playerCountElement.textContent) || 0, 2000);
    }
}

// Функция для анимации счетчика
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

// Функция для плавной прокрутки
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Учитываем высоту навигации
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Функция для копирования адреса сервера
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

// Функция для обновления статуса сервера каждые 30 секунд
setInterval(initServerStatus, 30000);

// Функция для обработки ошибок
window.addEventListener('error', function(e) {
    console.error('JavaScript ошибка:', e.error);
});

// Функция для обработки необработанных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанная ошибка промиса:', e.reason);
});

// Функция для проверки поддержки WebGL
function checkWebGLSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
        console.warn('WebGL не поддерживается в этом браузере');
        // Можно добавить fallback для старых браузеров
    }
}

// Инициализация проверки WebGL
checkWebGLSupport();

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
        document.querySelectorAll('.server-card, .feature-card, .stat-item').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

// Инициализация оптимизации
optimizePerformance();