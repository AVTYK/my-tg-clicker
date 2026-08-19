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
    if (!upg) return 0;
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

// Получение элементов UI с защитой
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
    try {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            playerUsername = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
        }
    } catch (e) {
        console.error("Ошибка инициализации Telegram WebApp API:", e);
    }
}

// ФУНКЦИЯ СОХРАНЕНИЯ ДАННЫХ В ПАМЯТЬ
function saveGameData() {
    try {
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
    } catch (e) {
        console.error("Не удалось сохранить данные в LocalStorage:", e);
    }
}

// Функция для безопасного обновления текстового контента элементов UI
function updateDisplay() {
    if (displayBTC) displayBTC.textContent = balanceBTC.toFixed(4);
    if (displayUSD) displayUSD.textContent = balanceUSD.toFixed(2);
    if (displayPassiveBTC) displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    if (displayPassiveUSD) displayPassiveUSD.textContent = passiveUSD.toFixed(2);
}

// Инициализация переключения вкладок таб-бара (Безопасное навешивание событий)
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn'); // Убедитесь, что у кнопок меню класс .tab-btn
    const screens = document.querySelectorAll('.screen');    // Убедитесь, что у экранов класс .screen
    
    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (!targetTab) return;

            // Переключаем активный класс у кнопок меню
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Переключаем видимость экранов
            screens.forEach(screen => {
                if (screen.id === `screen-${targetTab}`) {
                    screen.style.display = 'block';
                } else {
                    screen.style.display = 'none';
                }
            });
        });
    });
}

// Инициализация базового клика по главной кнопке
function initClicker() {
    if (!clickBtn) return;
    
    clickBtn.addEventListener('click', () => {
        // Логика клика с учетом Биржи Труда
        let clickPower = 1;
        if (currentCurrency === 'usd') {
            if (isLaborActive) {
                clickPower = 5; // Контракт активен: 5$ за клик
            } else {
                clickPower = 1; // Обычный режим доллара: 1$ за клик
            }
            balanceUSD += clickPower;
        } else {
            // Режим BTC клика
            balanceBTC += 0.0001;
        }
        updateDisplay();
        saveGameData();
    });
}

// Запуск инициализации UI при полной загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    initTabs();
    initClicker();
});
