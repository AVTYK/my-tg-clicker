// ==========================================
// 1. ИГРОВОЕ СОСТОЯНИЕ И НАСТРОЙКИ
// ==========================================
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
    if (liveRateDisplay) liveRateDisplay.textContent = Math.floor(currentBTCRate).toLocaleString() + " $";
    
    // Обновление кнопок улучшений
    for (let id = 1; id <= 3; id++) {
        const costBtn = document.getElementById('upgrade-cost-' + id);
        const levelText = document.getElementById('upgrade-level-' + id);
        const cost = getUpgradeCost(id);
        if (costBtn) {
            costBtn.textContent = upgrades[id].currency === 'usd' ? cost + " $" : cost + " BTC";
        }
        if (levelText) {
            levelText.textContent = "Ур. " + upgrades[id].level;
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

    for (let i = 0; i < tabButtons.length; i++) {
        const btn = tabButtons[i];
        btn.addEventListener('click', function() {
            const targetTab = btn.getAttribute('data-tab') || btn.id.replace('tab-', '');
            if (!targetTab) return;

            for (let j = 0; j < tabButtons.length; j++) {
                tabButtons[j].classList.remove('active');
            }
            btn.classList.add('active');

            for (let k = 0; k < screens.length; k++) {
                const screen = screens[k];
                if (screen.id === 'screen-' + targetTab || screen.id === targetTab || screen.getAttribute('data-screen') === targetTab) {
                    screen.style.display = 'block';
                } else {
                    screen.style.display = 'none';
                }
            }

            if (targetTab === 'top' || targetTab === 'топ') renderLeaderboard();
            if (targetTab === 'friends' || targetTab === 'друзья') renderReferrals();
        });
    }
}

// ==========================================
// 5. ИГРОВЫЕ МЕХАНИКИ (КЛИКЕР, КАЗИНО, БИРЖА)
// ==========================================
function initGameMechanics() {
    const toggleUsdBtn = document.getElementById('toggle-currency-usd');
    const toggleBtcBtn = document.getElementById('toggle-currency-btc');
    const clickBtn = document.getElementById('click-btn');

    if (toggleUsdBtn) {
        toggleUsdBtn.addEventListener('click', function() {
            currentCurrency = 'usd';
            toggleUsdBtn.classList.add('active');
            if (toggleBtcBtn) toggleBtcBtn.classList.remove('active');
        });
    }

    if (toggleBtcBtn) {
        toggleBtcBtn.addEventListener('click', function() {
            currentCurrency = 'btc';
            toggleBtcBtn.classList.add('active');
            if (toggleUsdBtn) toggleUsdBtn.classList.remove('active');
        });
    }

    if (clickBtn) {
        clickBtn.addEventListener('click', function() {
            const businessClickLevel = upgrades[1].level;
            if (currentCurrency === 'usd') {
                let clickPower = isLaborActive ? 5 : 1;
                clickPower += businessClickLevel * 0.5;
                balanceUSD += clickPower;
            } else {
                let btcClickPower = 0.0001 + (businessClickLevel * 0.00001);
                balanceBTC += btcClickPower;
            }
            updateDisplay();
            saveGameData();
        });
    }

    // VIP Казино (Шанс 60%)
    const playCasinoBtn = document.getElementById('play-casino-btn');
    const casinoInput = document.getElementById('casino-bet-amount');
    const casinoResult = document.getElementById('casino-result');

    if (playCasinoBtn && casinoInput) {
        playCasinoBtn.addEventListener('click', function() {
            const bet = parseFloat(casinoInput.value);
            if (isNaN(bet) || bet <= 0 || balanceUSD < bet) {
                if (casinoResult) casinoResult.textContent = "Недостаточно средств или неверная ставка!";
                return;
            }
            balanceUSD -= bet;
            if (Math.random() < 0.60) {
                balanceUSD += bet * 2;
                if (casinoResult) casinoResult.textContent = "Вы выиграли! +" + (bet * 2).toFixed(2) + " $";
            } else {
                if (casinoResult) casinoResult.textContent = "Вы проиграли! -" + bet.toFixed(2) + " $";
            }
            updateDisplay();
            saveGameData();
        });
    }
}

// Запуск приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    initTabs();
    initGameMechanics();
    updateDisplay();
});
