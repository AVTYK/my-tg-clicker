// ==========================================
// 1. ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ (window.gameState)
// ==========================================
window.gameState = {
    balanceUSD: 0,
    balanceBTC: 0,
    currentCurrency: 'USD',
    totalEarned: 0, // База для расчета лиг и рейтинга
    clickPower: 1,
    
    // Уровни бизнесов (от 0 до 10)
    businesses: {
        b1: 0, b2: 0, b3: 0, b4: 0, b5: 0,
        b6: 0, b7: 0, b8: 0, b9: 0, b10: 0
    }
};

// Курсы валют и BTC к USD (базовая валюта)
const CURRENCY_RATES = { USD: 1, EUR: 0.92, RUB: 90 };
const BTC_PRICE_USD = 65000;

// Массив лиг для динамического расчета
const LEAGUES = [
    { name: 'Бронза', minEarned: 0 },
    { name: 'Серебро', minEarned: 5000 },
    { name: 'Золото', minEarned: 25000 },
    { name: 'Платина', minEarned: 100000 },
    { name: 'Иллюминаты', minEarned: 1000000 }
];

// Сбалансированная математика бизнесов (целые числа)
const BUSINESS_CONFIG = {
    b1: { name: "Уличный ларек", baseCost: 100, costMultiplier: 1.15, baseIncome: 1 },
    b2: { name: "Подпольный бар", baseCost: 500, costMultiplier: 1.15, baseIncome: 5 },
    b3: { name: "Контрабанда сигар", baseCost: 2500, costMultiplier: 1.15, baseIncome: 25 },
    b4: { name: "Наркопритон", baseCost: 12000, costMultiplier: 1.15, baseIncome: 120 },
    b5: { name: "Казино 'Эльдорадо'", baseCost: 60000, costMultiplier: 1.15, baseIncome: 650 },
    b6: { name: "Рэкет профсоюзов", baseCost: 300000, costMultiplier: 1.15, baseIncome: 3500 },
    b7: { name: "Теневой банк", baseCost: 1500000, costMultiplier: 1.15, baseIncome: 18000 },
    b8: { name: "Оружейный завод", baseCost: 8000000, costMultiplier: 1.15, baseIncome: 95000 },
    b9: { name: "Нефтяной синдикат", baseCost: 45000000, costMultiplier: 1.15, baseIncome: 500000 },
    b10: { name: "Капитолийский лоббизм", baseCost: 250000000, costMultiplier: 1.15, baseIncome: 3000000 }
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
    // Динамическая симуляция места в мире на основе заработка
    if (window.gameState.totalEarned <= 0) return 999999;
    const rank = Math.floor(1000000 / (Math.log10(window.gameState.totalEarned + 1) + 1));
    return Math.max(1, rank);
};

// ==========================================
// 3. ФУНКЦИЯ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА (UI)
// ==========================================
window.updateUI = function() {
    const rate = CURRENCY_RATES[window.gameState.currentCurrency];
    const symbol = window.gameState.currentCurrency === 'USD' ? '$' : window.gameState.currentCurrency === 'EUR' ? '€' : '₽';
    
    // Обновление балансов
    const convertedBalance = Math.floor(window.gameState.balanceUSD * rate);
    const balanceText = `${convertedBalance.toLocaleString()} ${symbol}`;
    
    const elBalance = document.getElementById('balance-usd');
    if (elBalance) elBalance.innerText = balanceText;
    
    const elBalanceBTC = document.getElementById('balance-btc');
    if (elBalanceBTC) elBalanceBTC.innerText = window.gameState.balanceBTC.toFixed(4) + ' BTC';

    // Обновление вкладки ТОП (Leaderboard)
    const elLeague = document.getElementById('leaderboard-user-league');
    if (elLeague) elLeague.innerText = window.getCurrentLeague();
    
    const elRank = document.getElementById('leaderboard-user-rank');
    if (elRank) elRank.innerText = '#' + window.getWorldRank().toLocaleString();

    // Обновление кнопок покупки бизнесов
    for (let key in BUSINESS_CONFIG) {
        const currentLevel = window.gameState.businesses[key];
        const config = BUSINESS_CONFIG[key];
        const currentCost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
        
        const elCost = document.getElementById(`${key}-cost`);
        if (elCost) elCost.innerText = Math.floor(currentCost * rate).toLocaleString() + ' ' + symbol;
        
        const elLevel = document.getElementById(`${key}-level`);
        if (elLevel) elLevel.innerText = `Ур. ${currentLevel}/10`;
        
        const elBtn = document.getElementById(`btn-buy-${key}`);
        if (elBtn) {
            elBtn.disabled = (window.gameState.balanceUSD < currentCost || currentLevel >= 10);
            if (currentLevel >= 10) elBtn.innerText = "МАКС.";
        }
    }
};

// ==========================================
// 4. МЕХАНИКА КЛИКА И ПАССИВНОГО ДОХОДА
// ==========================================
window.triggerClick = function() {
    window.gameState.balanceUSD += window.gameState.clickPower;
    window.gameState.totalEarned += window.gameState.clickPower;
    window.updateUI();
};

window.calculatePassiveIncome = function() {
    let income = 0;
    for (let key in BUSINESS_CONFIG) {
        const level = window.gameState.businesses[key];
        income += level * BUSINESS_CONFIG[key].baseIncome;
    }
    return income;
};

// Таймер пассивного дохода (1 раз в секунду)
setInterval(() => {
    const income = window.calculatePassiveIncome();
    if (income > 0) {
        window.gameState.balanceUSD += income;
        window.gameState.totalEarned += income;
        window.updateUI();
    }
}, 1000);

// ==========================================
// 5. ЭКОНОМИКА: КУПЛЯ/ПРОДАЖА, БИЗНЕС, КАЗИНО
// ==========================================
window.changeCurrency = function(newCurrency) {
    if (CURRENCY_RATES[newCurrency]) {
        window.gameState.currentCurrency = newCurrency;
        window.updateUI();
    }
};

window.buyBusiness = function(businessKey) {
    const currentLevel = window.gameState.businesses[businessKey];
    if (currentLevel >= 10) return;

    const config = BUSINESS_CONFIG[businessKey];
    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));

    if (window.gameState.balanceUSD >= cost) {
        window.gameState.balanceUSD -= cost;
        window.gameState.businesses[businessKey] += 1;
        window.updateUI();
    }
};

window.buyBTC = function(amount) {
    const cost = amount * BTC_PRICE_USD;
    if (window.gameState.balanceUSD >= cost) {
        window.gameState.balanceUSD -= cost;
        window.gameState.balanceBTC += amount;
        window.updateUI();
    }
};

window.sellBTC = function(amount) {
    if (window.gameState.balanceBTC >= amount) {
        window.gameState.balanceBTC -= amount;
        window.gameState.balanceUSD += amount * BTC_PRICE_USD;
        window.updateUI();
    }
};

window.playCasino = function(betUSD) {
    if (window.gameState.balanceUSD < betUSD) return;
    window.gameState.balanceUSD -= betUSD;
    
    const win = Math.random() < 0.48; // 48% шанс на победу
    if (win) {
        const prize = betUSD * 2;
        window.gameState.balanceUSD += prize;
        window.gameState.totalEarned += betUSD; // В зачет лиг идет только чистый выигрыш
        alert(`Победа! Вы выиграли ${prize} USD`);
    } else {
        alert("Проигрыш! Удача улыбнется в следующий раз.");
    }
    window.updateUI();
};

// ==========================================
// 6. НАВИГАЦИЯ, РЕФЕРАЛЫ И СОХРАНЕНИЯ
// ==========================================
window.switchTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.style.display = 'block';
    }
};

window.copyReferralLink = function() {
    const dummyUrl = `https://t.me{window.gameState.totalEarned}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
        alert("Реферальная ссылка скопирована!");
    }).catch(() => {
        alert("Не удалось скопировать ссылку автоматически.");
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
            // Защита от частичного сохранения структуры бизнесов
            if (parsed.businesses) {
                window.gameState.businesses = { ...window.gameState.businesses, ...parsed.businesses };
            }
        } catch (e) {
            console.error("Ошибка загрузки сохранения", e);
        }
    }
    window.switchTab('tab-main'); // Открываем главную вкладку при старте
    window.updateUI();
};

// Запуск игры после полной загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
    window.loadGame();
});
