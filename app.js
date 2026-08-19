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
let defaultReferrals = [
    { id: 101, username: "Ivan_Crypto", clicksToday: 52, daysActive: 3, status: "Проверен", bonusPaid: true },
    { id: 102, username: "Masha_AMG", clicksToday: 15, daysActive: 1, status: "В процессе (1/3 дн)", bonusPaid: false },
    { id: 103, username: "Dmitry_Trader", clicksToday: 0, daysActive: 0, status: "В процессе (0/3 дн)", bonusPaid: false }
];
let referrals = JSON.parse(localStorage.getItem('clicker_referrals')) || defaultReferrals;

// Виртуальные лидеры Топ-500
let leaders = [
    { username: "Pavel_Durov", btc: 2.5, usd: 500000 },
    { username: "Crypto_Sheikh", btc: 5.1, usd: 200000 },
    { username: "Satoshi_Nakamoto", btc: 10.0, usd: 100000 },
    { username: "Elon_Musk", btc: 1.2, usd: 80000 }
];

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ И СВЯЗЬ С UI
// ==========================================
const displayBTC = document.getElementById('balance-btc');
const displayUSD = document.getElementById('balance-usd');
const displayPassiveBTC = document.getElementById('passive-btc');
const displayPassiveUSD = document.getElementById('passive-usd');
const clickBtn = document.getElementById('click-btn');
const casinoResult = document.getElementById('casino-result');
const liveRateDisplay = document.getElementById('live-rate');
const exchangeAmountInput = document.getElementById('exchange-amount');
const exchangeStatus = document.getElementById('exchange-status');
const laborTimerText = document.getElementById('labor-timer-text');
const startLaborBtn = document.getElementById('start-labor-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const referralsList = document.getElementById('referrals-list');

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
        console.error("Telegram WebApp Error:", e);
    }
}

// ==========================================
// 3. СИСТЕМНЫЕ ФУНКЦИИ И ДВИЖОК
// ==========================================
function saveGameData() {
    try {
        localStorage.setItem('clicker_balanceUSD', balanceUSD);
        localStorage.setItem('clicker_balanceBTC', balanceBTC);
        localStorage.setItem('clicker_isLaborActive', isLaborActive);
        localStorage.setItem('clicker_laborEndTime', laborEndTime);
        localStorage.setItem('clicker_nextLaborAvailableTime', nextLaborAvailableTime);
        localStorage.setItem('clicker_referrals', JSON.stringify(referrals));
        localStorage.setItem('clicker_currentBTCRate', currentBTCRate);
        for (const id in upgrades) {
            localStorage.setItem(`upg_level_${id}`, upgrades[id].level);
        }
    } catch (e) {
        console.error("Local Storage Save Error:", e);
    }
}

function calculatePassiveIncome() {
    passiveUSD = 0;
    passiveBTC = 0;
    for (const id in upgrades) {
        const upg = upgrades[id];
        passiveUSD += upg.level * upg.incomeUSD;
        passiveBTC += upg.level * upg.incomeBTC;
    }
}

function getUpgradeCost(id) {
    const upg = upgrades[id];
    if (!upg) return 0;
    if (upg.currency === 'usd') {
        return Math.ceil(upg.baseCost * Math.pow(1.5, upg.level));
    } else {
        return parseFloat((upg.baseCost * Math.pow(1.5, upg.level)).toFixed(4));
    }
}

function updateDisplay() {
    calculatePassiveIncome();
    if (displayBTC) displayBTC.textContent = balanceBTC.toFixed(4);
    if (displayUSD) displayUSD.textContent = balanceUSD.toFixed(2);
    if (displayPassiveBTC) displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    if (displayPassiveUSD) displayPassiveUSD.textContent = passiveUSD.toFixed(2);
    if (liveRateDisplay) liveRateDisplay.textContent = Math.floor(currentBTCRate).toLocaleString() + " $";
    
    for (const id in upgrades) {
        const costBtn = document.getElementById(`upgrade-cost-${id}`);
        const levelText = document.getElementById(`upgrade-level-${id}`);
        if (costBtn) {
            const cost = getUpgradeCost(id);
            costBtn.textContent = upgrades[id].currency === 'usd' ? `${cost} $` : `${cost} BTC`;
        }
        if (levelText) {
            levelText.textContent = `Ур. ${upgrades[id].level}`;
        }
    }
}

// ==========================================
// 4. ЛОГИКА ТАБ-БАРА И ЭКРАНОВ
// ==========================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn, .menu-item, [data-tab]');
    const screens = document.querySelectorAll('.screen, .tab-content, [id^="screen-"]');
    
    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab') || btn.id.replace('tab-', '');
            if (!targetTab) return;

            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            screens.forEach(screen => {
                if (screen.id === `screen-${targetTab}` || screen.id === targetTab || screen.getAttribute('data-screen') === targetTab) {
                    screen.style.display = 'block';
                } else {
                    screen.style.display = 'none';
                }
            });

            if (targetTab === 'top' || targetTab === 'топ') renderLeaderboard();
            if (targetTab === 'friends' || targetTab === 'друзья') renderReferrals();
        });
    });
}

// ==========================================
// 5. ИГРОВЫЕ МЕХАНИКИ (КЛИКЕР, КАЗИНО, БИРЖА)
// ==========================================
function initGameMechanics() {
    const toggleUsdBtn = document.getElementById('toggle-currency-usd');
    const toggleBtcBtn = document.getElementById('toggle-currency-btc');
    
    if (toggleUsdBtn && toggleBtcBtn) {
        toggleUsdBtn.addEventListener('click', () => { currentCurrency = 'usd'; toggleUsdBtn.classList.add('active'); toggleBtcBtn.classList.remove('active'); });
        toggleBtcBtn.addEventListener('click', () => { currentCurrency = 'btc'; toggleBtcBtn.classList.add('active'); toggleUsdBtn.classList.remove('active'); });
    }

    if (clickBtn) {
        clickBtn.addEventListener('click', () => {
            let clickPower = 1;
            const businessClickLevel = upgrades[1] ? upgrades[1].level : 0;
            
            if (currentCurrency === 'usd') {
                clickPower = isLaborActive ? 5 : 1;
                clickPower += businessClickLevel * 0.5;
                balanceUSD += clickPower;
                triggerHaptic();
            } else {
                let btcClickPower = 0.0001 + (businessClickLevel * 0.00001);
                balanceBTC += btcClickPower;
                triggerHaptic();
            }
            updateDisplay();
            saveGameData();
        });
    }

    for (const id in upgrades) {
        const buyBtn = document.getElementById(`buy-upgrade-${id}`);
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {
                const upg = upgrades[id];
                const cost = getUpgradeCost(id);
                
                if (upg.currency === 'usd' && balanceUSD >= cost) {
                    balanceUSD -= cost;
                    upg.level++;
                    triggerHaptic();
                } else if (upg.currency === 'btc' && balanceBTC >= cost) {
                    balanceBTC -= cost;
                    upg.level++;
                    triggerHaptic();
                }
                updateDisplay();
                saveGameData();
            });
        }
    }

    const playCasinoBtn = document.getElementById('play-casino-btn');
    const casinoInput = document.getElementById('casino-bet-amount');
    if (playCasinoBtn && casinoInput) {
        playCasinoBtn.addEventListener('click', () => {
            const bet = parseFloat(casinoInput.value);
            if (isNaN(bet) || bet <= 0 || balanceUSD < bet) {
                if (casinoResult) casinoResult.textContent = "Недостаточно средств или неверная ставка!";
                return;
            }
            balanceUSD -= bet;
            const win = Math.random() < 0.60;
window.addEventListener('load', function() {
    updateDisplay(); initTabs(); initGameMechanics(); initLaborMarket();
    setInterval(processTimers, 1000); setInterval(simulateExchange, 4000);
})})}}
