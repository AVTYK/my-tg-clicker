// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ (STATE)
// ==========================================
window.fiat = 100; // Баланс в USD
window.btc = 0;    // Баланс в BTC
window.btcRate = 60000; // Стартовый курс BTC/USD

// Объект апгрейдов СТРОГО без общего свойства .level
window.upgrades = {
    1: { name: "Бизнес-клик", cost: 50, level: 0, income: 1, type: "click" },
    2: { name: "Крипто-ферма", cost: 150, level: 0, income: 2, type: "passive" },
    3: { name: "Банковская сеть", cost: 1000, level: 0, income: 15, type: "passive" }
};

// Переменная для активной вкладки
window.currentTab = "main";

// ==========================================
// 2. СИСТЕМА АВТОСОХРАНЕНИЯ (LOCALSTORAGE)
// ==========================================

// Функция сохранения игры
window.saveGame = function() {
    const gameState = {
        fiat: window.fiat,
        btc: window.btc,
        btcRate: window.btcRate,
        upgrades: window.upgrades
    };
    localStorage.setItem('cryptoTycoon_save_v2.5', JSON.stringify(gameState));
};

// Функция загрузки игры
window.loadGame = function() {
    const savedData = localStorage.getItem('cryptoTycoon_save_v2.5');
    if (!savedData) return;

    try {
        const gameState = JSON.parse(savedData);
        
        if (gameState.fiat !== undefined) window.fiat = gameState.fiat;
        if (gameState.btc !== undefined) window.btc = gameState.btc;
        if (gameState.btcRate !== undefined) window.btcRate = gameState.btcRate;
        
        // Восстановление уровней строго по ID ключам
        if (gameState.upgrades) {
            for (let id in gameState.upgrades) {
                if (window.upgrades[id] && gameState.upgrades[id].level !== undefined) {
                    window.upgrades[id].level = gameState.upgrades[id].level;
                }
            }
        }
    } catch (e) {
        console.error("Ошибка при чтении сохранения LocalStorage:", e);
    }
};

// ==========================================
// 3. ФУНКЦИЯ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА (DOM)
// ==========================================
window.updateUI = function() {
    // Безопасные селекторы с проверками
    const fiatEl = document.getElementById("balance-fiat");
    const btcEl = document.getElementById("balance-btc");
    const rateEl = document.getElementById("btc-rate");

    if (fiatEl) fiatEl.innerText = window.fiat.toFixed(2);
    if (btcEl) btcEl.innerText = window.btc.toFixed(6);
    if (rateEl) rateEl.innerText = window.btcRate.toFixed(2);

    // Обновление кнопок и текстов апгрейдов по ID ключам
    for (let id in window.upgrades) {
        const upgrade = window.upgrades[id];
        const costEl = document.getElementById(`upgrade-cost-${id}`);
        const lvlEl = document.getElementById(`upgrade-lvl-${id}`);
        
        if (costEl) costEl.innerText = upgrade.cost * (upgrade.level + 1);
        if (lvlEl) lvlEl.innerText = upgrade.level; // Обращение по ID-ключу, свойство upgrades.level отсутствует
    }
};

// ==========================================
// 4. ИНЛАЙН ОБРАБОТЧИКИ (ОБЪЯВЛЕНЫ ЧЕРЕЗ WINDOW)
// ==========================================

// Переключение вкладок
window.switchTab = function(tabId) {
    window.currentTab = tabId;
    
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => {
        tab.style.display = "none";
    });
    
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) {
        activeTab.style.display = "block";
    }
};

// Клик для заработка (Главная кнопка)
window.mainClick = function() {
    // Сила клика увеличивается строго от уровня апгрейда ID 1
    const clickPower = 1 + (window.upgrades[1].level * window.upgrades[1].income);
    window.fiat += clickPower;
    
    window.updateUI();
    window.saveGame();
};

// Покупка улучшений (Строго по ID ключам)
window.buyUpgrade = function(id) {
    const upgrade = window.upgrades[id];
    if (!upgrade) return;

    const currentCost = upgrade.cost * (upgrade.level + 1);

    if (window.fiat >= currentCost) {
        window.fiat -= currentCost;
        upgrade.level += 1; // Увеличиваем уровень конкретного ID, общего upgrades.level нет
        
        window.updateUI();
        window.saveGame();
    } else {
        alert("Недостаточно фиатных средств (USD)!");
    }
};

// Торговля криптовалютой (Биржа)
window.tradeCrypto = function(action) {
    if (action === 'buy') {
        // Покупка BTC на все доступные USD
        if (window.fiat > 0) {
            const amountToBuy = window.fiat / window.btcRate;
            window.btc += amountToBuy;
            window.fiat = 0;
        }
    } else if (action === 'sell') {
        // Продажа всех BTC за USD
        if (window.btc > 0) {
            const moneyReceived = window.btc * window.btcRate;
            window.fiat += moneyReceived;
            window.btc = 0;
        }
    }
    window.updateUI();
    window.saveGame();
};

// Игра в казино (Азартные игры)
window.playCasino = function() {
    if (window.fiat < 10) {
        alert("Минимальная ставка в казино — 10 USD!");
        return;
    }

    window.fiat -= 10; // Снимаем ставку
    const chance = Math.random();

    if (chance > 0.5) {
        window.fiat += 25; // Выигрыш
        alert("Вы выиграли 25 USD!");
    } else {
        alert("Вы проиграли ставку.");
    }
    window.updateUI();
    window.saveGame();
};

// Рынок труда (Смены)
window.startLaborShift = function() {
    window.fiat += 15; // Фиксированный доход за смену
    alert("Вы отработали смену на бирже труда и получили 15 USD!");
    
    window.updateUI();
    window.saveGame();
};

// Реферальная система (Копирование ссылки)
window.copyInviteLink = function() {
    const dummyUrl = "https://t.me";
    navigator.clipboard.writeText(dummyUrl).then(() => {
        alert("Реферальная ссылка скопирована в буфер обмена!");
    }).catch(err => {
        console.error("Не удалось скопировать ссылку: ", err);
    });
};

// Сброс игрового прогресса (Полезно для тестов)
window.resetGame = function() {
    if (confirm("Вы уверены, что хотите полностью сбросить игровой прогресс?")) {
        localStorage.removeItem('cryptoTycoon_save_v2.5');
        window.fiat = 100;
        window.btc = 0;
        window.btcRate = 60000;
        
        for (let id in window.upgrades) {
            window.upgrades[id].level = 0;
        }
        
        window.updateUI();
    }
};

// ==========================================
// 5. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАПУСКЕ СТРАНИЦЫ
// ==========================================

// Запускаем загрузку данных до первой отрисовки UI
window.loadGame();

// Отрисовываем интерфейс с актуальными данными
window.updateUI();

// По умолчанию открываем главную вкладку
window.switchTab(window.currentTab);

// ==========================================
// 6. ЕДИНЫЙ СЕКУНДНЫЙ СЕТИНТЕРВАЛ (TICKER)
// ==========================================
setInterval(function() {
    // 1. Расчет пассивного дохода строго по ID ключам 2 и 3
    const passiveIncome2 = window.upgrades[2].level * window.upgrades[2].income;
    const passiveIncome3 = window.upgrades[3].level * window.upgrades[3].income;
    const totalPassiveIncome = passiveIncome2 + passiveIncome3;
    
    window.fiat += totalPassiveIncome;

    // 2. Симуляция курса криптовалюты BTC (колебания в пределах ±2.5%)
    const percentChange = (Math.random() * 5 - 2.5) / 100; // от -0.025 до +0.025
    window.btcRate = window.btcRate * (1 + percentChange);
    
    // Предотвращаем падение курса до нуля
    if (window.btcRate < 1000) {
        window.btcRate = 1000;
    }

    // 3. Синхронное обновление UI и запись в LocalStorage
    window.updateUI();
    window.saveGame();
}, 1000);
