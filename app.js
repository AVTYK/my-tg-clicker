// ==========================================
// 1. СОСТОЯНИЕ ИГРЫ (STATE)
// ==========================================
window.gameState = {
    balance: 0,
    cryptoBalance: 0,
    selectedCurrency: 'USD',
    currencyRates: {
        USD: 1,
        EUR: 0.92,
        RUB: 90
    },
    cryptoPrice: 50000 // Базовая цена BTC/Crypto
};

// ==========================================
// 2. БАЗА ДАННЫХ УЛУЧШЕНИЙ (UPGRADES)
// ==========================================
// КРИТИЧЕСКОЕ ПРАВИЛО: У объекта upgrades нет свойства .level!
// Обращение идет строго по ключам ID: upgrades[1].level, upgrades[2].level
window.upgrades = {
    1: { name: "Click Booster", basePrice: 10, priceMultiplier: 1.5, level: 0, power: 1 },
    2: { name: "Auto Mining", basePrice: 100, priceMultiplier: 1.8, level: 0, power: 5 },
    3: { name: "Business Investment", basePrice: 1000, priceMultiplier: 2.0, level: 0, power: 25 }
};

// ==========================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (UTILS)
// ==========================================
window.updateUI = function() {
    // Отображение баланса в выбранной валюте
    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency];
    const convertedBalance = (window.gameState.balance * rate).toFixed(2);
    
    const balanceEl = document.getElementById('balance');
    if (balanceEl) balanceEl.innerText = `${convertedBalance} ${window.gameState.selectedCurrency}`;

    // Отображение крипто-баланса
    const cryptoBalanceEl = document.getElementById('crypto-balance');
    if (cryptoBalanceEl) cryptoBalanceEl.innerText = `${window.gameState.cryptoBalance.toFixed(4)} BTC`;

    // Отображение цены криптовалюты
    const cryptoPriceEl = document.getElementById('crypto-price');
    if (cryptoPriceEl) cryptoPriceEl.innerText = `$${window.gameState.cryptoPrice.toLocaleString()}`;

    // Обновление интерфейса улучшений (уровни и цены)
    // Обращаемся строго по конкретным ключам ID, предотвращая NaN
    for (let id in window.upgrades) {
        const upgrade = window.upgrades[id];
        const currentPrice = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));
        
        const levelEl = document.getElementById(`upgrade-level-${id}`);
        const priceEl = document.getElementById(`upgrade-price-${id}`);
        
        if (levelEl) levelEl.innerText = `Lvl ${upgrade.level}`;
        if (priceEl) priceEl.innerText = `${(currentPrice * rate).toFixed(0)} ${window.gameState.selectedCurrency}`;
    }
};

window.calculateClickPower = function() {
    // Сила клика зависит строго от уровня апгрейда 1 (Click Booster)
    return 1 + (window.upgrades[1].level * window.upgrades[1].power);
};

window.calculatePassiveIncome = function() {
    // Пассивный доход зависит от апгрейдов 2 и 3
    const incomeFromMining = window.upgrades[2].level * window.upgrades[2].power;
    const incomeFromBusiness = window.upgrades[3].level * window.upgrades[3].power;
    return incomeFromMining + incomeFromBusiness;
};

// ==========================================
// 4. ИНЛАЙН ОБРАБОТЧИКИ СОБЫТИЙ (WINDOW FUNCTIONS)
// ==========================================
window.switchTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');
};

window.changeCurrency = function(currencyCode) {
    if (window.gameState.currencyRates[currencyCode]) {
        window.gameState.selectedCurrency = currencyCode;
        window.updateUI();
    }
};

window.playCasino = function(betAmount) {
    if (window.gameState.balance < betAmount) {
        alert("Недостаточно средств на балансе!");
        return;
    }
    
    window.gameState.balance -= betAmount;
    const isWin = Math.random() > 0.5;
    
    if (isWin) {
        const winAmount = betAmount * 2;
        window.gameState.balance += winAmount;
        alert(`Вы выиграли! +${winAmount} USD`);
    } else {
        alert("Вы проиграли! Попробуйте снова.");
    }
    window.updateUI();
};

window.buyUpgrade = function(upgradeId) {
    const upgrade = window.upgrades[upgradeId];
    if (!upgrade) return;

    const currentPrice = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));

    if (window.gameState.balance >= currentPrice) {
        window.gameState.balance -= currentPrice;
        upgrade.level += 1; // Увеличиваем уровень конкретного ID
        window.updateUI();
    } else {
        alert("Недостаточно денег для покупки улучшения!");
    }
};

window.tradeCrypto = function(action) {
    if (action === 'buy') {
        if (window.gameState.balance >= window.gameState.cryptoPrice * 0.01) {
            window.gameState.balance -= window.gameState.cryptoPrice * 0.01;
            window.gameState.cryptoBalance += 0.01;
        } else {
            alert("Недостаточно USD для покупки 0.01 BTC!");
        }
    } else if (action === 'sell') {
        if (window.gameState.cryptoBalance >= 0.01) {
            window.gameState.cryptoBalance -= 0.01;
            window.gameState.balance += window.gameState.cryptoPrice * 0.01;
        } else {
            alert("Недостаточно BTC для продажи!");
        }
    }
    window.updateUI();
};

window.startLaborShift = function() {
    // Основное действие кликера — работа на рынке труда
    const clickPower = window.calculateClickPower();
    window.gameState.balance += clickPower;
    window.updateUI();
};

window.copyInviteLink = function() {
    const dummyUrl = "https://t.me";
    navigator.clipboard.writeText(dummyUrl).then(() => {
        alert("Реферальная ссылка скопирована в буфер обмена!");
    }).catch(() => {
        alert("Не удалось скопировать ссылку автоматически.");
    });
};

// ==========================================
// 5. ИНИЦИАЛИЗАЦИЯ И ИГРОВЫЕ ЦИКЛЫ (GAME TIMERS)
// ==========================================
// Строго линейное выполнение без вложенных анонимных функций внутри window.onload
window.onload = function() {
    // Первичный рендер интерфейса
    window.updateUI();

    // Запуск таймера пассивного дохода (раз в секунду)
    setInterval(function() {
        const passiveIncome = window.calculatePassiveIncome();
        if (passiveIncome > 0) {
            window.gameState.balance += passiveIncome;
        }
        
        // Симуляция колебания цен на крипту (±2% каждую секунду)
        const priceChangePercent = (Math.random() * 4 - 2) / 100;
        window.gameState.cryptoPrice += window.gameState.cryptoPrice * priceChangePercent;
        if (window.gameState.cryptoPrice < 1000) window.gameState.cryptoPrice = 1000;

        window.updateUI();
    }, 1000);
};
