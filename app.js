// ==========================================
// 1. ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ (window.gameState)
// ==========================================
window.gameState = {
    balanceUSD: 0,
    balanceBTC: 0,
    currentCurrency: 'USD',
    totalEarned: 0,
    clickPower: 1,
    
    // Уровни бизнесов/улучшений (1-10)
    upgrades: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0, 10: 0
    }
};

// Константы экономики
const CURRENCY_RATES = { USD: 1, EUR: 0.92, RUB: 90 };
const BTC_PRICE_USD = 50000; // Базовый курс из верстки

// Массив лиг для расчета
const LEAGUES = [
    { name: 'Бронзовая лига 🥉', minEarned: 0 },
    { name: 'Серебряная лига 🥈', minEarned: 5000 },
    { name: 'Золотая лига 🥇', minEarned: 25000 },
    { name: 'Платиновая лига 💎', minEarned: 100000 },
    { name: 'Иллюминаты 👁️', minEarned: 1000000 }
];

// Конфигурация апгрейдов по ID (соответствует кнопкам buyUpgrade(id))
const UPGRADE_CONFIG = {
    1: { baseCost: 60, costMultiplier: 1.15, baseIncome: 1 },
    2: { baseCost: 300, costMultiplier: 1.15, baseIncome: 5 },
    3: { baseCost: 1000, costMultiplier: 1.15, baseIncome: 25 },
    4: { baseCost: 4000, costMultiplier: 1.15, baseIncome: 120 },
    5: { baseCost: 15000, costMultiplier: 1.15, baseIncome: 650 },
    6: { baseCost: 55000, costMultiplier: 1.15, baseIncome: 3500 },
    7: { baseCost: 200000, costMultiplier: 1.15, baseIncome: 18000 },
    8: { baseCost: 750000, costMultiplier: 1.15, baseIncome: 95000 },
    9: { baseCost: 3500000, costMultiplier: 1.15, baseIncome: 500000 },
    10: { baseCost: 15000000, costMultiplier: 1.15, baseIncome: 3000000 }
};

// ==========================================
// 2. СИСТЕМА ЛИГ И РЕЙТИНГА
// ==========================================
window.getCurrentLeague = function() {
    let currentLeague = LEAGUES[0].name;
    for (let i = LEAGUES.length - 1; i >= 0; i--) {
        if (window.gameState.totalEarned >= LEAGUES[i].minEarned) {
            currentLeague = LEAGUES[i].name;
            break;
        }
    }
    return currentLeague;
};

window.getWorldRank = function() {
    if (window.gameState.totalEarned <= 0) return 999999;
    const rank = Math.floor(1000000 / (Math.log10(window.gameState.totalEarned + 1) + 1));
    return Math.max(1, rank);
};

// ==========================================
// 3. ФУНКЦИЯ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА (UI)
// ==========================================
window.updateUI = function() {
    const rate = CURRENCY_RATES[window.gameState.currentCurrency];
    const symbol = window.gameState.currentCurrency === 'USD' ? 'USD' : window.gameState.currentCurrency === 'EUR' ? 'EUR' : 'RUB';
    
    // 1. Балансы и лиги в шапке
    const convertedBalance = Math.floor(window.gameState.balanceUSD * rate);
    const elBalanceUSD = document.getElementById('balance-usd');
    if (elBalanceUSD) elBalanceUSD.innerText = `${convertedBalance.toLocaleString()} ${symbol}`;
    
    const elBalanceBTC = document.getElementById('balance-btc');
    if (elBalanceBTC) elBalanceBTC.innerText = window.gameState.balanceBTC.toFixed(4) + ' BTC';

    const elUserLeague = document.getElementById('user-league');
    if (elUserLeague) elUserLeague.innerText = window.getCurrentLeague();

    // Статистика дохода и клика
    const elPassiveIncome = document.getElementById('ui-pincome');
    if (elPassiveIncome) elPassiveIncome.innerText = Math.floor(window.calculatePassiveIncome() * rate).toLocaleString();
    
    const elClickPower = document.getElementById('ui-cpower');
    if (elClickPower) elClickPower.innerText = Math.floor(window.gameState.clickPower * rate).toLocaleString();

    // 2. Селектор валют (активный класс)
    ['USD', 'EUR', 'RUB'].forEach(cur => {
        const btn = document.getElementById(`curr-btn-${cur}`);
        if (btn) {
            if (cur === window.gameState.currentCurrency) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // 3. Обновление вкладки ТОП (Leaderboard)
    const elLeaderLeague = document.getElementById('leaderboard-user-league');
    if (elLeaderLeague) elLeaderLeague.innerText = window.getCurrentLeague();
    
    const elLeaderRank = document.getElementById('leaderboard-user-rank');
    if (elLeaderRank) elLeaderRank.innerText = '#' + window.getWorldRank().toLocaleString();

    // 4. Карточки улучшений
    for (let id in UPGRADE_CONFIG) {
        const currentLevel = window.gameState.upgrades[id] || 0;
        const config = UPGRADE_CONFIG[id];
        const currentCost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
        
        const elLevel = document.getElementById(`upgrade-level-${id}`);
        if (elLevel) elLevel.innerText = `Lvl ${currentLevel}`;
        
        const elPrice = document.getElementById(`upgrade-price-${id}`);
        if (elPrice) elPrice.innerText = `${Math.floor(currentCost * rate).toLocaleString()} ${symbol}`;
    }
};

// ==========================================
// 4. МЕХАНИКА КЛИКА И ПАССИВНОГО ДОХОДА
// ==========================================
window.startLaborShift = function() {
    window.gameState.balanceUSD += window.gameState.clickPower;
    window.gameState.totalEarned += window.gameState.clickPower;
    window.updateUI();
};

window.calculatePassiveIncome = function() {
    let income = 0;
    for (let id in UPGRADE_CONFIG) {
        const level = window.gameState.upgrades[id] || 0;
        income += level * UPGRADE_CONFIG[id].baseIncome;
    }
    return income;
};

// Интервал пассивного заработка (1 секунда)
setInterval(() => {
    const income = window.calculatePassiveIncome();
    if (income > 0) {
        window.gameState.balanceUSD += income;
        window.gameState.totalEarned += income;
        window.updateUI();
    }
}, 1000);

// ==========================================
// 5. ИГРОВЫЕ ДЕЙСТВИЯ (УЛУЧШЕНИЯ, ТРЕЙДИНГ, КАЗИНО)
// ==========================================
window.changeCurrency = function(newCurrency) {
    if (CURRENCY_RATES[newCurrency]) {
        window.gameState.currentCurrency = newCurrency;
        window.updateUI();
    }
};

window.buyUpgrade = function(id) {
    const currentLevel = window.gameState.upgrades[id] || 0;
    const config = UPGRADE_CONFIG[id];
    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));

    if (window.gameState.balanceUSD >= cost) {
        window.gameState.balanceUSD -= cost;
        window.gameState.upgrades[id] = currentLevel + 1;
        window.updateUI();
    }
};

window.tradeCrypto = function(action) {
    const amount = 0.01;
    const costUSD = amount * BTC_PRICE_USD;
    const elStatus = document.getElementById('exchange-status');

    if (action === 'buy') {
        if (window.gameState.balanceUSD >= costUSD) {
            window.gameState.balanceUSD -= costUSD;
            window.gameState.balanceBTC += amount;
            if (elStatus) elStatus.innerText = "Успешно куплено 0.01 BTC";
        } else {
            if (elStatus) elStatus.innerText = "Недостаточно средств (USD)";
        }
    } else if (action === 'sell') {
        if (window.gameState.balanceBTC >= amount) {
            window.gameState.balanceBTC -= amount;
            window.gameState.balanceUSD += costUSD;
            window.gameState.totalEarned += costUSD;
            if (elStatus) elStatus.innerText = "Успешно продано 0.01 BTC";
        } else {
            if (elStatus) elStatus.innerText = "Недостаточно BTC для продажи";
        }
    }
    window.updateUI();
};

window.playCasino = function(betUSD) {
    const elResult = document.getElementById('casino-result');
    if (window.gameState.balanceUSD < betUSD) {
        if (elResult) elResult.innerText = "Недостаточно USD для ставки";
        return;
    }
    
    window.gameState.balanceUSD -= betUSD;
    const isWin = Math.random() < 0.48; // 48% шанс выигрыша

    if (isWin) {
        const prize = betUSD * 2;
        window.gameState.balanceUSD += prize;
        window.gameState.totalEarned += betUSD; 
        if (elResult) elResult.innerText = `Победа! +${prize} USD`;
    } else {
        if (elResult) elResult.innerText = "Проигрыш! Попробуйте еще раз";
    }
    window.updateUI();
};

// ==========================================
// 6. НАВИГАЦИЯ, РЕФЕРАЛЫ И СОХРАНЕНИЯ
// ==========================================
window.switchTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
};

window.copyInviteLink = function() {
    const link = `https://t.me{window.gameState.totalEarned}`;
    navigator.clipboard.writeText(link).then(() => {
        alert("Реферальная ссылка скопирована!");
    }).catch(() => {
        alert("Ошибка копирования ссылки.");
    });
};

// Автосохранение каждые 5 секунд
setInterval(() => {
    localStorage.setItem('mafia_clicker_save', JSON.stringify(window.gameState));
}, 5000);

window.loadGame = function() {
    const save = localStorage.getItem('mafia_clicker_save');
    if (save) {
        try {
            const parsed = JSON.parse(save);
            window.gameState = { ...window.gameState, ...parsed };
            if (parsed.upgrades) {
                window.gameState.upgrades = { ...window.gameState.upgrades, ...parsed.upgrades };
            }
        } catch (e) {
            console.error("Ошибка чтения сохранения", e);
        }
    }
    window.updateUI();
};

// Инициализация при загрузке документа
document.addEventListener("DOMContentLoaded", () => {
    window.loadGame();
});
