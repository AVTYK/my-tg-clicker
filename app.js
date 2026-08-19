// Игровое состояние (Загрузка из памяти или значения по умолчанию)
let balanceUSD = parseFloat(localStorage.getItem('clicker_balanceUSD')) || 0;
let balanceBTC = parseFloat(localStorage.getItem('clicker_balanceBTC')) || 0;

let passiveUSD = 0;
let passiveBTC = 0;

let currentCurrency = 'btc'; 
let playerUsername = "Вы (Учитель)";

// Переменные биржи труда (Смены)
let isLaborActive = localStorage.getItem('clicker_isLaborActive') === 'true';
let laborEndTime = parseInt(localStorage.getItem('clicker_laborEndTime')) || 0;
let nextLaborAvailableTime = parseInt(localStorage.getItem('clicker_nextLaborAvailableTime')) || 0;

// Конфигурация улучшений по уровням
const upgrades = {
    1: { name: 'Бизнес-клик', level: parseInt(localStorage.getItem('upg_level_1')) || 0, baseCost: 100, currency: 'usd', incomeUSD: 0.1, incomeBTC: 0 },
    2: { name: 'Крипто-ферма', level: parseInt(localStorage.getItem('upg_level_2')) || 0, baseCost: 500, currency: 'usd', incomeUSD: 0, incomeBTC: 0.0005 },
    3: { name: 'Банковская сеть', level: parseInt(localStorage.getItem('upg_level_3')) || 0, baseCost: 1.5, currency: 'btc', incomeUSD: 50.0, incomeBTC: 0 }
};

// Расчет цены улучшения на основе его текущего уровня
function getUpgradeCost(id) {
    const upg = upgrades[id];
    if (upg.currency === 'usd') {
        return Math.ceil(upg.baseCost * Math.pow(1.5, upg.level));
    } else {
        return parseFloat((upg.baseCost * Math.pow(1.5, upg.level)).toFixed(4));
    }
}

// Базовый список рефералов
let defaultReferrals = [
    { id: 101, username: "Ivan_Crypto", clicksToday: 52, daysActive: 3, status: "Проверен", bonusPaid: true },
    { id: 102, username: "Masha_AMG", clicksToday: 15, daysActive: 1, status: "В процессе (1/3 дн)", bonusPaid: false },
    { id: 103, username: "Dmitry_Trader", clicksToday: 0, daysActive: 0, status: "В процессе (0/3 дн)", bonusPaid: false }
];

let referrals = JSON.parse(localStorage.getItem('clicker_referrals')) || defaultReferrals;

// Виртуальные лидеры Топ-500
let leaders = [
    { username: "Pavel_Durov", btc: 2, usd: 500000 },
    { username: "Crypto_Sheikh", btc: 5, usd: 200000 },
    { username: "Satoshi_Nakamoto", btc: 10, usd: 100000 },
    { username: "Elon_Musk", btc: 1, usd: 80000 }
];

// Получение элементов UI
const displayBTC = document.getElementById('balance-btc');
const displayUSD = document.getElementById('balance-usd');
const displayPassiveBTC = document.getElementById('passive-btc');
const displayPassiveUSD = document.getElementById('passive-usd');
const clickBtn = document.getElementById('click-btn');
const clickAreaContainer = document.getElementById('click-area-container');
const casinoResult = document.getElementById('casino-result');
const liveRateDisplay = document.getElementById('live-rate');
const exchangeAmountInput = document.getElementById('exchange-amount');
const exchangeStatus = document.getElementById('exchange-status');
const laborTimerText = document.getElementById('labor-timer-text');
const startLaborBtn = document.getElementById('start-labor-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const referralsList = document.getElementById('referrals-list');
const inviteCopyStatus = document.getElementById('invite-copy-status');

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready(); tg.expand();
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        playerUsername = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
    }
}

// ФУНКЦИЯ СОХРАНЕНИЯ ДАННЫХ В ПАМЯТЬ
function saveGameData() {
    localStorage.setItem('clicker_balanceUSD', balanceUSD);
    localStorage.setItem('clicker_balanceBTC', balanceBTC);
    localStorage.setItem('clicker_isLaborActive', isLaborActive);
    localStorage.setItem('clicker_laborEndTime', laborEndTime);
    localStorage.setItem('clicker_nextLaborAvailableTime', nextLaborAvailableTime);
    localStorage.setItem('clicker_referrals', JSON.stringify(referrals));
    
    // Сохраняем уровни улучшений
    for (const id in upgrades) {
        localStorage.setItem(`upg_level_${id}`, upgrades[id].level);
    }
}

// Пример функции для обновления баланса и отображения его на UI
function updateDisplay() {
    displayBTC.textContent = balanceBTC.toFixed(4);
    displayUSD.textContent = balanceUSD.toFixed(2);
    displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    displayPassiveUSD.textContent = passiveUSD.toFixed(2);
}

// Вызов функции для обновления отображения при загрузке
updateDisplay();

// Добавьте другие функции для обработки кликов, улучшений и т.д. по мере необходимости
