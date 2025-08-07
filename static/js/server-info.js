// JavaScript для страницы информации о сервере

document.addEventListener('DOMContentLoaded', function() {
    initServerInfo();
    initServerStatus();
    initCopyFunctions();
    initAnimations();
    initPingTest();
});

// Инициализация страницы информации о сервере
function initServerInfo() {
    // Обновляем информацию о сервере
    updateServerInfo();
    
    // Инициализируем анимации
    animateServerInfo();
    
    // Инициализируем интерактивные элементы
    initInteractiveElements();
}

// Обновление информации о сервере
async function updateServerInfo() {
    const currentPlayersElement = document.getElementById('current-players');
    const serverStatusIndicator = document.getElementById('serverStatusIndicator');
    const serverStatusText = document.getElementById('serverStatusText');
    const serverUptime = document.getElementById('serverUptime');
    const serverTPS = document.getElementById('serverTPS');
    const serverPing = document.getElementById('serverPing');
    
    try {
        const response = await fetch('/api/server-status');
        const data = await response.json();
        
        if (data.status === 'online') {
            // Обновляем статус
            if (serverStatusIndicator) {
                serverStatusIndicator.className = 'status-indicator online';
            }
            if (serverStatusText) {
                serverStatusText.textContent = 'Онлайн';
            }
            
            // Обновляем количество игроков
            if (currentPlayersElement) {
                animateCounter(currentPlayersElement, parseInt(currentPlayersElement.textContent) || 0, data.players, 1000);
            }
            
            // Обновляем аптайм
            if (serverUptime) {
                serverUptime.textContent = data.uptime;
            }
            
            // Обновляем TPS
            if (serverTPS) {
                serverTPS.textContent = data.tps || '20.0';
            }
            
            // Анимация пульсации для индикатора
            if (serverStatusIndicator) {
                serverStatusIndicator.style.animation = 'pulse 2s ease-in-out infinite';
            }
        } else {
            // Сервер оффлайн
            if (serverStatusIndicator) {
                serverStatusIndicator.className = 'status-indicator offline';
                serverStatusIndicator.style.animation = 'none';
            }
            if (serverStatusText) {
                serverStatusText.textContent = 'Оффлайн';
            }
            if (currentPlayersElement) {
                currentPlayersElement.textContent = '0';
            }
            if (serverUptime) {
                serverUptime.textContent = 'Недоступно';
            }
            if (serverTPS) {
                serverTPS.textContent = '0.0';
            }
        }
    } catch (error) {
        console.error('Ошибка при получении информации о сервере:', error);
        
        // Показываем ошибку
        if (serverStatusIndicator) {
            serverStatusIndicator.className = 'status-indicator error';
            serverStatusIndicator.style.animation = 'none';
        }
        if (serverStatusText) {
            serverStatusText.textContent = 'Ошибка';
        }
    }
}

// Инициализация статуса сервера
function initServerStatus() {
    // Обновляем статус каждые 30 секунд
    setInterval(updateServerInfo, 30000);
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

// Анимация информации о сервере
function animateServerInfo() {
    const infoCards = document.querySelectorAll('.info-card');
    const featureCards = document.querySelectorAll('.feature-card');
    const ruleCards = document.querySelectorAll('.rule-card');
    const guideSteps = document.querySelectorAll('.guide-step');
    
    // Анимация карточек информации
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Анимация карточек возможностей
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, (index * 100) + 500);
    });
    
    // Анимация карточек правил
    ruleCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, (index * 100) + 1000);
    });
    
    // Анимация шагов подключения
    guideSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateX(-30px)';
        step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateX(0)';
        }, (index * 200) + 1500);
    });
}

// Инициализация интерактивных элементов
function initInteractiveElements() {
    // Добавляем hover эффекты для карточек
    const cards = document.querySelectorAll('.info-card, .feature-card, .rule-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Анимация для кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Анимация для шагов подключения
    const guideSteps = document.querySelectorAll('.guide-step');
    guideSteps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
}

// Инициализация функций копирования
function initCopyFunctions() {
    // Копирование адреса сервера
    window.copyServerAddress = function() {
        const serverAddress = '8b4t.duckdns.org:55555';
        copyToClipboard(serverAddress);
        showNotification('Адрес сервера скопирован в буфер обмена!', 'success');
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
    
    // Наблюдаем за всеми анимируемыми элементами
    const animatedElements = document.querySelectorAll('.info-card, .feature-card, .rule-card, .guide-step');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Инициализация теста пинга
function initPingTest() {
    const serverPingElement = document.getElementById('serverPing');
    
    if (serverPingElement) {
        // Тестируем пинг к серверу
        testPing('8b4t.duckdns.org', 55555).then(ping => {
            if (ping !== null) {
                serverPingElement.textContent = `${ping}ms`;
            } else {
                serverPingElement.textContent = 'Недоступно';
            }
        });
    }
}

// Функция для тестирования пинга
async function testPing(host, port) {
    const startTime = performance.now();
    
    try {
        // Создаем WebSocket соединение для тестирования
        const ws = new WebSocket(`ws://${host}:${port}`);
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                ws.close();
                resolve(null);
            }, 5000);
            
            ws.onopen = () => {
                const endTime = performance.now();
                const ping = Math.round(endTime - startTime);
                ws.close();
                clearTimeout(timeout);
                resolve(ping);
            };
            
            ws.onerror = () => {
                clearTimeout(timeout);
                resolve(null);
            };
        });
    } catch (error) {
        console.error('Ошибка при тестировании пинга:', error);
        return null;
    }
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

// Функция для проверки доступности сервера
function checkServerAvailability() {
    const serverAddress = '8b4t.duckdns.org:55555';
    const [host, port] = serverAddress.split(':');
    
    // Создаем изображение для проверки доступности
    const img = new Image();
    img.onload = function() {
        showNotification('Сервер доступен!', 'success');
    };
    img.onerror = function() {
        showNotification('Сервер недоступен', 'error');
    };
    
    // Пытаемся загрузить изображение с сервера (это может не работать для Minecraft серверов)
    img.src = `http://${host}:${port}/favicon.ico?t=${Date.now()}`;
}

// Функция для экспорта информации о сервере
function exportServerInfo() {
    const serverInfo = {
        address: '8b4t.duckdns.org',
        port: 55555,
        version: '1.20.1',
        features: [
            'Киберпанк города',
            'ИИ системы',
            'Энергетические сети',
            'Космические станции',
            'Научные лаборатории',
            'Порталы и измерения'
        ],
        rules: [
            'Безопасность',
            'Строительство',
            'Общение',
            'Игровой процесс'
        ]
    };
    
    const dataStr = JSON.stringify(serverInfo, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'server-info.json';
    link.click();
    
    showNotification('Информация о сервере экспортирована!', 'success');
}

// Добавляем функции в глобальную область
window.checkServerAvailability = checkServerAvailability;
window.exportServerInfo = exportServerInfo;

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
        document.querySelectorAll('.info-card, .feature-card, .rule-card, .guide-step').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
}

// Инициализация оптимизации
optimizePerformance();