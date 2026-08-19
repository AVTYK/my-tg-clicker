// ==========================================
// 1. ИГРОВОЕ СОСТОЯНИЕ И НАСТРОЙКИ
// ==========================================
let balanceUSD = parseFloat(localStorage.getItem('clicker_balanceUSD')) || 0;
let balanceBTC = parseFloat(localStorage.getItem('clicker_balanceBTC')) || 0;

let passiveUSD = 0;
let passiveBTC = 0;
let currentCurrency = 'btc'; // 'btc' или 'usd'
let playerUsername = "Вы (Учитель)";

// Переменные биржи труда (Смены)
let isLaborActive = localStorage.getItem('clicker_isLaborActive') === 'true';
let laborEndTime = parseInt(localStorage.getItem('clicker_laborEndTime')) || 0;
let nextLaborAvailableTime = parseInt(localStorage.getItem('clicker_nextLaborAvailableTime')) || 0;

// Живая крипто-биржа
let currentBTCRate = parseFloat(localStorage.getItem('clicker_currentBTCRate')) || 92500;
const MIN_RATE = 50000;
const MAX_RATE = 180000;

// Конфигурация улучшений по уровням
const upgrades = {
    1: { name: 'Бизнес-клик', level: parseInt(localStorage.getItem('upg_level_1')) || 0, baseCost: 100, currency: 'usd', incomeUSD: 0.1, incomeBTC: 0 },
    2: { name: 'Крипто-ферма', level: parseInt(localStorage.getItem('upg_level_2')) || 0, baseCost: 500, currency: 'usd', incomeUSD: 0, incomeBTC: 0.0005 },
    3: { name: 'Банковская сеть', level: parseInt(localStorage.getItem('upg_level_3')) || 0, baseCost: 1.5, currency: 'btc', incomeUSD: 50.0, incomeBTC: 0 }
};

// Реферальная программа
const defaultReferrals = [
    { id: 101, username: "Ivan_Crypto", clicksToday: 52, daysActive: 3, status: "Проверен", bonusPaid: true },
    { id: 102, username: "Masha_AMG", clicksToday: 15, daysActive: 1, status: "В процессе (1/3 дн)", bonusPaid: false },
    { id: 103, username: "Dmitry_Trader", clicksToday: 0, daysActive: 0, status: "В процессе (0/3 дн)", bonusPaid: false }
];
let referrals = JSON.parse(localStorage.getItem('clicker_referrals')) || defaultReferrals;

// Виртуальные лидеры Топ-500
const leaders = [
    { username: "Pavel_Durov", btc: 2.5, usd: 500000 },
    { username: "Crypto_Sheikh", btc: 5.1, usd: 200000 },
    { username: "Satoshi_Nakamoto", btc: 10.0, usd: 100000 },
    { username: "Elon_Musk", btc: 1.2, usd: 80000 }
];

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP
// ==========================================
if (window.Telegram && window.Telegram.WebApp) {
    try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            playerUsername = window.Telegram.WebApp.initDataUnsafe.user.username || window.Telegram.WebApp.initDataUnsafe.user.first_name;
        }
    } catch (tgError) {
        console.log("Telegram API offline");
    }
}

// ==========================================
// 3. СИСТЕМНЫЕ ФУНКЦИИ И ДВИЖОК
// ==========================================
function saveGameData() {
    localStorage.setItem('clicker_balanceUSD', balanceUSD);
    localStorage.setItem('clicker_balanceBTC', balanceBTC);
    localStorage.setItem('clicker_isLaborActive', isLaborActive);
    localStorage.setItem('clicker_laborEndTime', laborEndTime);
    localStorage.setItem('clicker_nextLaborAvailableTime', nextLaborAvailableTime);
    localStorage.setItem('clicker_referrals', JSON.stringify(referrals));
    localStorage.setItem('clicker_currentBTCRate', currentBTCRate);
    localStorage.setItem('upg_level_1', upgrades[1].level);
    localStorage.setItem('upg_level_2', upgrades[2].level);
    localStorage.setItem('upg_level_3', upgrades[3].level);
}

function calculatePassiveIncome() {
    passiveUSD = (upgrades[1].level * upgrades[1].incomeUSD) + (upgrades[2].level * upgrades[2].incomeUSD) + (upgrades[3].level * upgrades[3].incomeUSD);
    passiveBTC = (upgrades[1].level * upgrades[1].incomeBTC) + (upgrades[2].level * upgrades[2].incomeBTC) + (upgrades[3].level * upgrades[3].incomeBTC);
}

function getUpgradeCost(id) {
    const upg = upgrades[id];
    if (upg.currency === 'usd') {
        return Math.ceil(upg.baseCost * Math.pow(1.5, upg.level));
    }
    return parseFloat((upg.baseCost * Math.pow(1.5, upg.level)).toFixed(4));
}

function updateDisplay() {
    calculatePassiveIncome();
    
    const displayBTC = document.getElementById('balance-btc');
    const displayUSD = document.getElementById('balance-usd');
    const displayPassiveBTC = document.getElementById('passive-btc');
    const displayPassiveUSD = document.getElementById('passive-usd');
    const liveRateDisplay = document.getElementById('live-rate');

    if (displayBTC) displayBTC.textContent = balanceBTC.toFixed(4);
    if (displayUSD) displayUSD.textContent = balanceUSD.toFixed(2);
    if (displayPassiveBTC) displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    if (displayPassiveUSD) displayPassiveUSD.textContent = passiveUSD.toFixed(2);
    if (liveRateDisplay) liveRateDisplay.textContent = "$" + Math.floor(currentBTCRate).toLocaleString();
    
    // Динамическое обновление цен в карточках улучшений HTML
    for (let id = 1; id <= 3; id++) {
        const upgradeCard = document.getElementById('upgrade-' + id);
        if (upgradeCard) {
            const costSpan = upgradeCard.querySelector('.cost');
            const h3Text = upgradeCard.querySelector('h3');
            const cost = getUpgradeCost(id);
            
            if (costSpan) {
                costSpan.textContent = cost.toLocaleString();
            }
            if (h3Text) {
                h3Text.textContent = upgrades[id].name + " (Ур. " + upgrades[id].level + ")";
            }
        }
    }
}

// ==========================================
// 4. ГЛОБАЛЬНАЯ ЛОГИКА НАВИГАЦИИ (МЕНЮ)
// ==========================================
window.switchTab = function(tabName) {
    const screens = document.querySelectorAll('.tab-content');
    for (let i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    
    const targetScreen = document.getElementById('tab-' + tabName);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    for (let j = 0; j < navButtons.length; j++) {
        navButtons[j].classList.remove('active');
    }

    const activeNavBtn = document.getElementById('btn-nav-' + tabName);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }

    if (tabName === 'leaderboard') renderLeaderboard();
    if (tabName === 'referrals') renderReferrals();
};

// ==========================================
// 5. ГЛОБАЛЬНЫЕ ИГРОВЫЕ МЕХАНИКИ
// ==========================================
window.changeCurrency = function(currencyType) {
    currentCurrency = currencyType;
    const btnBtc = document.getElementById('select-btc');
    const btnUsd = document.getElementById('select-usd');
    
    if (currencyType === 'btc') {
        if (btnBtc) btnBtc.classList.add('active');
        if (btnUsd) btnUsd.classList.remove('active');
    } else {
        if (btnUsd) btnUsd.classList.add('active');
        if (btnBtc) btnBtc.classList.remove('active');
    }
};

window.playCasino = function(betAmount) {
    const casinoResult = document.getElementById('casino-result');
    const bet = parseFloat(betAmount);
    
    if (balanceUSD < bet) {
        if (casinoResult) casinoResult.textContent = "Недостаточно USD для этой VIP ставки!";
        return;
    }
    
    balanceUSD -= bet;
    if (Math.random() < 0.60) {
        const winAmount = bet * 2;
        balanceUSD += winAmount;
        if (casinoResult) casinoResult.textContent = "Вы выиграли элитную ставку! +" + winAmount.toFixed(2) + " $";
    } else {
        if (casinoResult) casinoResult.textContent = "Казино забрало ставку. Попробуйте еще раз!";
    }
    triggerHaptic();
    updateDisplay();
    saveGameData();
};

window.buyUpgrade = function(id) {
    const upg = upgrades[id];
    if (!upg) return;
    
    const cost = getUpgradeCost(id);
    if (upg.currency === 'usd' && balanceUSD >= cost) {
        balanceUSD -= cost;
        upg.level++;
        triggerHaptic();
    } else if (upg.currency === 'btc' && balanceBTC >= cost) {
        balanceBTC -= cost;
        upg.level++;
        triggerHaptic();
    } else {
        alert("Недостаточно средств для инвестирования!");
        return;
    }
    updateDisplay();
    saveGameData();
};

window.tradeCrypto = function(actionType) {
    const exchangeAmountInput = document.getElementById('exchange-amount');
    const exchangeStatus = document.getElementById('exchange-status');
    if (!exchangeAmountInput) return;

    const amount = parseFloat(exchangeAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        if (exchangeStatus) exchangeStatus.textContent = "Введите корректную сумму операции!";
        return;
    }

    if (actionType === 'buy') {
        const requiredUSD = amount * currentBTCRate;
        if (balanceUSD >= requiredUSD) {
            balanceUSD -= requiredUSD;
            balanceBTC += amount;
            if (exchangeStatus) exchangeStatus.textContent = "Успешно купили " + amount + " BTC!";
        } else {
            if (exchangeStatus) exchangeStatus.textContent = "Недостаточно долларов для покупки!";
        }
    } else if (actionType === 'sell') {
        if (balanceBTC >= amount) {
            balanceBTC -= amount;
            balanceUSD += amount * currentBTCRate;
            if (exchangeStatus) exchangeStatus.textContent = "Успешно продали " + amount + " BTC!";
        } else {
            if (exchangeStatus) exchangeStatus.textContent = "Недостаточно BTC на балансе!";
        }
    }
    updateDisplay();
    saveGameData();
};

// ==========================================
// 6. БИРЖА ТРУДА, РЕФЕРАЛЫ И ЛИДЕРБОРД
// ==========================================
window.startLaborShift = function() {
    const now = Date.now();
    if (now < nextLaborAvailableTime) return;
    
    isLaborActive = true;}
