// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНОГО СОСТОЯНИЯ
// ==========================================
window.fiat = 100;        // Стартовый баланс в USD
window.btc = 0;           // Стартовый баланс в BTC
window.btcRate = 60000;   // Базовый курс BTC/USD
window.currentTab = "main"; // Активная вкладка при старте

// Апгрейды: обращение к уровням идет СТРОГО по ID ключам (1, 2, 3)
window.upgrades = {
    1: { name: "Бизнес-клик", cost: 50, level: 0, income: 1, type: "click" },
    2: { name: "Крипто-ферма", cost: 150, level: 0, income: 2, type: "passive" },
    3: { name: "Банковская сеть", cost: 1000, level: 0, income: 15, type: "passive" }
};

// ==========================================
// 2. СИСТЕМА ДАННЫХ (LOCALSTORAGE)
// ==========================================

// Функция сохранения
window.saveGame = function() {
    const dataToSerialize = {
        fiat: window.fiat,
        btc: window.btc,
        btcRate: window.btcRate,
        upgrades: window.upgrades
    };
    localStorage.setItem('cryptoTycoon_save_v2.5', JSON.stringify(dataToSerialize));
};

// Функция загрузки
window.loadGame = function() {
    const rawData = localStorage.getItem('cryptoTycoon_save_v2.5');
    if (!rawData) return;

    try {
        const parsed = JSON.parse(rawData);
        
        if (parsed.fiat !== undefined) window.fiat = parsed.fiat;
        if (parsed.btc !== undefined) window.btc = parsed.btc;
        if (parsed.btcRate !== undefined) window.btcRate = parsed.btcRate;
        
        // Восстановление уровней строго по ID ключам объекта upgrades
        if (parsed.upgrades) {
            for (let id in parsed.upgrades) {
                if (window.upgrades[id] && parsed.upgrades[id].level !== undefined) {
                    window.upgrades[id].level = parsed.upgrades[id].level;
                }
            }
        }
    } catch (error) {
        console.error("Ошибка чтения данных сохранения:", error);
    }
};

// ==========================================
// 3. ОБНОВЛЕНИЕ РЕНДЕРА ИНТЕРФЕЙСА (DOM)
// ==========================================
window.updateUI = function() {
    const elFiat = document.getElementById("balance-fiat");
    const elBtc = document.getElementById("balance-btc");
    const elRate = document.getElementById("btc-rate");

    if (elFiat) elFiat.innerText = window.fiat.toFixed(2);
    if (elBtc) elBtc.innerText = window.btc.toFixed(6);
    if (elRate) elRate.innerText = window.btcRate.toFixed(2);

    // Цикл по ID ключам апгрейдов с безопасной проверкой наличия DOM элементов
    for (let id in window.upgrades) {
        const data = window.upgrades[id];
        const elCost = document.getElementById(`upgrade-cost-${id}`);
        const elLvl = document.getElementById(`upgrade-lvl-${id}`);
        
        if (elCost) elCost.innerText = (data.cost * (data.level + 1)).toFixed(0);
        if (elLvl) elLvl.innerText = data.level;
    }
};

// ==========================================
// 4. ИНЛАЙН ОБРАБОТЧИКИ НА WINDOW
// ==========================================

// Переключение разделов меню
window.switchTab = function(tabId) {
    window.currentTab = tabId;
    
    const allTabs = document.querySelectorAll(".tab-content");
    allTabs.forEach(function(tab) {
        tab.style.display = "none";
    });
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.style.display = "block";
    }
};

// Главный клик по монете
window.mainClick = function() {
    // Расчет силы клика строго по ID ключу 1 (Бизнес-клик)
    const currentLvl = window.upgrades[1].level;
    const incomePerLvl = window.upgrades[1].income;
    const finalClickPower = 1 + (currentLvl * incomePerLvl);
    
    window.fiat += finalClickPower;
    
    window.updateUI();
    window.saveGame();
};

// Покупка улучшений по ID
window.buyUpgrade = function(id) {
    const item = window.upgrades[id];
    if (!item) return;

    const price = item.cost * (item.level + 1);

    if (window.fiat >= price) {
        window.fiat -= price;
        item.level += 1; // Инкремент уровня конкретного ID
        
        window.updateUI();
        window.saveGame();
    } else {
        alert("Недостаточно средств на балансе USD!");
    }
};

// Обмен валюты (Биржа)
window.tradeCrypto = function(action) {
    if (action === 'buy') {
        if (window.fiat > 0) {
            const purchasedBtc = window.fiat / window.btcRate;
            window.btc += purchasedBtc;
            window.fiat = 0;
        }
    } else if (action === 'sell') {
        if (window.btc > 0) {
            const receivedFiat = window.btc * window.btcRate;
            window.fiat += receivedFiat;
            window.btc = 0;
        }
    }
    window.updateUI();
    window.saveGame();
};

// Зона Казино
window.playCasino = function() {
    if (window.fiat < 10) {
        alert("Ставка составляет 10 USD. У вас недостаточно средств.");
        return;
    }

    window.fiat -= 10;
    const winRoll = Math.random();

    if (winRoll > 0.5) {
        window.fiat += 25;
        alert("Победа! Вы получили 25 USD.");
    } else {
        alert("Проигрыш. Повезет в следующий раз.");
    }
    window.updateUI();
    window.saveGame();
};

// Биржа труда (Смена)
window.startLaborShift = function() {
    window.fiat += 15;
    alert("Смена завершена! Вы заработали 15 USD.");
    
    window.updateUI();
    window.saveGame();
};

// Копирование ссылки
window.copyInviteLink = function() {
    const link = "https://t.me";
    navigator.clipboard.writeText(link).then(function() {
        alert("Ваша инвайт-ссылка скопирована!");
    }).catch(function(err) {
        console.error("Ошибка копирования в буфер:", err);
    });
};

// Полный сброс прогресса
window.resetGame = function() {
    if (confirm("Вы действительно хотите обнулить свой аккаунт?")) {
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
// 5. ИНИЦИАЛИЗАЦИЯ И ЦИКЛ ЖИЗНИ ИГРЫ
// ==========================================

// Загружаем данные из локального хранилища до отрисовки
window.loadGame();

// Обновляем текстовые поля и переменные в DOM
window.updateUI();

// Принудительно открываем дефолтную вкладку
window.switchTab(window.currentTab);

// Секундный таймер симуляции рынка и генерации дохода
setInterval(function() {
    // Расчет пассивного дохода строго по ID ключам 2 (Крипто-ферма) и 3 (Банковская сеть)
    const incomeFromFarms = window.upgrades[2].level * window.upgrades[2].income;
    const incomeFromBanks = window.upgrades[3].level * window.upgrades[3].income;
    const currentPassiveSum = incomeFromFarms + incomeFromBanks;
    
    window.fiat += currentPassiveSum;

    // Генерация изменения цены BTC (в интервале ±2.5%)
    const shiftModifier = (Math.random() * 5 - 2.5) / 100; 
    window.btcRate = window.btcRate * (1 + shiftModifier);
    
    // Защита курса от падения ниже критической отметки
    if (window.btcRate < 1000) {
        window.btcRate = 1000;
    }

    // Сохранение и рендер текущих данных
    window.updateUI();
    window.saveGame();
}, 1000);
