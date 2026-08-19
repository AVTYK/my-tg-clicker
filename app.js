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

// Конфигурация улучшений (Цены подгружаются из памяти, чтобы прогресс не терялся)
const upgrades = {
    1: { name: 'Бизнес-клик', cost: parseInt(localStorage.getItem('upg_cost_1')) || 100, currency: 'usd', incomeUSD: 0.1, incomeBTC: 0 },
    2: { name: 'Крипто-ферма', cost: parseInt(localStorage.getItem('upg_cost_2')) || 500, currency: 'usd', incomeUSD: 0, incomeBTC: 0.0005 },
    3: { name: 'Банковская сеть', cost: parseFloat(localStorage.getItem('upg_cost_3')) || 1.5, currency: 'btc', incomeUSD: 50.0, incomeBTC: 0 }
};

// Базовый список рефералов для демонстрации механики (сохраняется в памяти)
let defaultReferrals = [
    { id: 101, username: "Ivan_Crypto", clicksToday: 52, daysActive: 3, status: "Проверен", bonusPaid: true },
    { id: 102, username: "Masha_AMG", clicksToday: 15, daysActive: 1, status: "В процессе (1/3 дн)", bonusPaid: false },
    { id: 103, username: "Dmitry_Trader", clicksToday: 0, daysActive: 0, status: "В процессе (0/3 дн)", bonusPaid: false }
];

let referrals = JSON.parse(localStorage.getItem('clicker_referrals')) || defaultReferrals;

// Виртуальные лидеры для Топ-500
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

// Инициализация TG WebApp
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
    localStorage.setItem('upg_cost_1', upgrades[1].cost);
    localStorage.setItem('upg_cost_2', upgrades[2].cost);
    localStorage.setItem('upg_cost_3', upgrades[3].cost);
}

// Расчет пассивного дохода на основе купленных бизнесов
function calculatePassiveIncomeRate() {
    passiveUSD = 0;
    passiveBTC = 0;

    let level1 = Math.round(Math.log(upgrades[1].cost / 100) / Math.log(1.5));
    let level2 = Math.round(Math.log(upgrades[2].cost / 500) / Math.log(1.5));
    let level3 = Math.round(Math.log(upgrades[3].cost / 1.5) / Math.log(1.5));

    if (level1 > 0) passiveUSD += level1 * upgrades[1].incomeUSD;
    if (level2 > 0) passiveBTC += level2 * upgrades[2].incomeBTC;
    if (level3 > 0) passiveUSD += level3 * upgrades[3].incomeUSD;
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
    document.getElementById('select-btc').classList.remove('active');
    document.getElementById('select-usd').classList.remove('active');
    
    if (type === 'btc') {
        document.getElementById('select-btc').classList.add('active');
        clickBtn.textContent = '🪙';
    } else {
        document.getElementById('select-usd').classList.add('active');
        clickBtn.textContent = '💵';
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

// Обновление цифр
function updateUI() {
    if (displayBTC) displayBTC.textContent = balanceBTC.toFixed(4);
    if (displayUSD) displayUSD.textContent = balanceUSD.toFixed(1);
    if (displayPassiveBTC) displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    if (displayPassiveUSD) displayPassiveUSD.textContent = passiveUSD.toFixed(1);
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

// Покупка улучшений
function buyUpgrade(id) {
    const upgrade = upgrades[id];
    
    if (upgrade.currency === 'usd' && balanceUSD >= upgrade.cost) {
        balanceUSD -= upgrade.cost;
        upgrade.cost = Math.ceil(upgrade.cost * 1.5);
        document.getElementById(`upgrade-${id}`).querySelector('.cost').textContent = upgrade.cost;
    } else if (upgrade.currency === 'btc' && balanceBTC >= upgrade.cost) {
        balanceBTC -= upgrade.cost;
        upgrade.cost = (upgrade.cost * 1.5);
        document.getElementById(`upgrade-${id}`).querySelector('.cost').textContent = upgrade.cost.toFixed(2);
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
            exchangeStatus.textContent = "❌ Недостаточно BTC!";
            exchangeStatus.style.color = "#ff5555";
        }
    }
    exchangeAmountInput.value = "";
    updateUI();
    saveGameData();
}

// VIP СМЕНА НА БИРЖЕ ТРУДА
function startLaborShift() {
    const now = Date.now();
    if (now < nextLaborAvailableTime) {
        alert("Ваши сутки еще не прошли! Отдохните.");
        return;
    }

    isLaborActive = true;}
