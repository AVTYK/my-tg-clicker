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
    localStorage.setItem('upg_level_1', upgrades[1].level);
    localStorage.setItem('upg_level_2', upgrades[2].level);
    localStorage.setItem('upg_level_3', upgrades[3].level);
}

// Расчет пассивного дохода на основе уровней улучшений
function calculatePassiveIncomeRate() {
    passiveUSD = 0;
    passiveBTC = 0;

    if (upgrades[1].level > 0) passiveUSD += upgrades[1].level * upgrades[1].incomeUSD;
    if (upgrades[2].level > 0) passiveBTC += upgrades[2].level * upgrades[2].incomeBTC;
    if (upgrades[3].level > 0) passiveUSD += upgrades[3].level * upgrades[3].incomeUSD;
}

// РАСЧЕТ МИРОВОГО КУРСА БИТКОИНА (50,000$ - 180,000$)
let currentBTCPrice = 50000;
function calculateLiveRate() {
    const date = new Date();
    const day = date.getDate(); 
    
    const baseWave = (Math.sin((day / 31) * Math.PI * 2) + 1) / 2; 
    const basePrice = 50000 + baseWave * 130000; 
    const noise = (Math.random() - 0.5) * 900;
    
    currentBTCPrice = Math.max(50000, Math.min(180000, basePrice + noise));
    if (liveRateDisplay) {
        liveRateDisplay.textContent = `$${Math.floor(currentBTCPrice).toLocaleString()}`;
    }
}

// Переключение валюты клика
function changeCurrency(type) {
    currentCurrency = type;
    const selectBtc = document.getElementById('select-btc');
    const selectUsd = document.getElementById('select-usd');
    if (selectBtc) selectBtc.classList.remove('active');
    if (selectUsd) selectUsd.classList.remove('active');
    
    if (type === 'btc') {
        if (selectBtc) selectBtc.classList.add('active');
        if (clickBtn) clickBtn.textContent = '🪙';
    } else {
        if (selectUsd) selectUsd.classList.add('active');
        if (clickBtn) clickBtn.textContent = '💵';
    }
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetBtn = document.getElementById(`btn-nav-${tabName}`);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabName === 'leaderboard') renderLeaderboard();
    if (tabName === 'referrals') renderReferrals();
}

// Обновление цифр на экране
function updateUI() {
    if (displayBTC) displayBTC.textContent = balanceBTC.toFixed(4);
    if (displayUSD) displayUSD.textContent = balanceUSD.toFixed(1);
    if (displayPassiveBTC) displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    if (displayPassiveUSD) displayPassiveUSD.textContent = passiveUSD.toFixed(1);

    // Динамическое обновление цен в UI карточек
    for (let id in upgrades) {
        const card = document.getElementById(`upgrade-${id}`);
        if (card) {
            const costEl = card.querySelector('.cost');
            if (costEl) {
                const currentCost = getUpgradeCost(id);
                costEl.textContent = upgrades[id].currency === 'usd' ? currentCost : currentCost.toFixed(2);
            }
        }
    }
}

// Обработка клика
if (clickBtn) {
    clickBtn.addEventListener('click', (e) => {
        let addValue = 1;
        let textContent = "";

        if (currentCurrency === 'btc') {
            balanceBTC += 0.0001;
            textContent = "+0.0001 BTC 🪙";
        } else {
            if (isLaborActive) {
                addValue = 5;
                textContent = "+5.0 $ 💼";
            } else {
                addValue = 1;
                textContent = "+1.0 $ 💵";
            }
            balanceUSD += addValue;
        }

        createFloatingText(e, textContent);
        updateUI();
        saveGameData();
    });
}

function createFloatingText(e, textContent) {
    if (!clickAreaContainer || !clickBtn) return;
    const text = document.createElement('div');
    text.classList.add('floating-number');
    text.textContent = textContent;
    const rect = clickBtn.getBoundingClientRect();
    text.style.left = `${e.clientX ? e.clientX - rect.left : rect.width / 2}px`;
    text.style.top = `${e.clientY ? e.clientY - rect.top : rect.height / 2}px`;
    clickAreaContainer.appendChild(text);
    setTimeout(() => text.remove(), 800);
}

// Покупка улучшений по уровням
function buyUpgrade(id) {
    const upgrade = upgrades[id];
    const currentCost = getUpgradeCost(id);
    
    if (upgrade.currency === 'usd' && balanceUSD >= currentCost) {
        balanceUSD -= currentCost;
        upgrade.level += 1;
    } else if (upgrade.currency === 'btc' && balanceBTC >= currentCost) {
        balanceBTC -= currentCost;
        upgrade.level += 1;
    } else {
        alert('Недостаточно средств для этой инвестиции!');
        return;
    }
    calculatePassiveIncomeRate();
    updateUI();
    saveGameData();
}

// ТРЕЙДИНГ (ОБМЕННИК)
function tradeCrypto(action) {
    const amount = parseFloat(exchangeAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        exchangeStatus.textContent = "❌ Введите корректное число!";
        exchangeStatus.style.color = "#ff5555";
        return;
    }

    const totalCostUSD = amount * currentBTCPrice;

    if (action === 'buy') {
        if (balanceUSD >= totalCostUSD) {
            balanceUSD -= totalCostUSD;
            balanceBTC += amount;
            exchangeStatus.textContent = `✅ Куплено ${amount} BTC за $${Math.floor(totalCostUSD)}`;
            exchangeStatus.style.color = "#00ff88";
        } else {
            exchangeStatus.textContent = "❌ Недостаточно Долларов!";
            exchangeStatus.style.color = "#ff5555";
        }
    } else {
        if (balanceBTC >= amount) {
            balanceBTC -= amount;
            balanceUSD += totalCostUSD;
            exchangeStatus.textContent = `✅ Продано ${amount} BTC за $${Math.floor(totalCostUSD)}`;
            exchangeStatus.style.color = "#00ff88";
        } else {
