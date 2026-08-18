// Игровое состояние (Раздельные балансы)
let balanceUSD = 0;
let balanceBTC = 0;

let passiveUSD = 0;
let passiveBTC = 0;

let currentCurrency = 'btc'; 
let playerUsername = "Вы (Учитель)";

// Переменные биржи труда (Смены)
let isLaborActive = false;
let laborEndTime = 0;
let nextLaborAvailableTime = 0;

// Конфигурация улучшений
const upgrades = {
    1: { name: 'Бизнес-клик', cost: 100, currency: 'usd', incomeUSD: 0.1, incomeBTC: 0 },
    2: { name: 'Крипто-ферма', cost: 500, currency: 'usd', incomeUSD: 0, incomeBTC: 0.0005 },
    3: { name: 'Банковская сеть', cost: 1.5, currency: 'btc', incomeUSD: 50.0, incomeBTC: 0 }
};

// Виртуальные лидеры (для пересчета в USD: их BTC умножаются на текущий курс)
let leaders = [
    { username: "Pavel_Durov", btc: 2, usd: 500000 },
    { username: "Crypto_Sheikh", btc: 5, usd: 200000 },
    { username: "Satoshi_Nakamoto", btc: 10, usd: 100000 },
    { username: "Elon_Musk", btc: 1, usd: 80000 }
];

// Элементы UI
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

// Инициализация TG WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready(); tg.expand();
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        playerUsername = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
    }
}

// РАСЧЕТ МИРОВОГО КУРСА БИТКОИНА (50,000$ - 180,000$)
let currentBTCPrice = 50000;
function calculateLiveRate() {
    const date = new Date();
    const day = date.getDate(); // День месяца (1-31)
    
    // Плавная базовая волна синусоиды на основе дней месяца
    const baseWave = (Math.sin((day / 31) * Math.PI * 2) + 1) / 2; 
    const basePrice = 50000 + baseWave * 130000; // Диапазон от 50к до 180к
    
    // Секундный случайный шум торгов (+/- 450 долларов)
    const noise = (Math.random() - 0.5) * 900;
    
    currentBTCPrice = Math.max(50000, Math.min(180000, basePrice + noise));
    liveRateDisplay.textContent = `$${Math.floor(currentBTCPrice).toLocaleString()}`;
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

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`btn-nav-${tabName}`).classList.add('active');

    if (tabName === 'leaderboard') renderLeaderboard();
}

// Обновление цифр
function updateUI() {
    displayBTC.textContent = balanceBTC.toFixed(4);
    displayUSD.textContent = balanceUSD.toFixed(1);
    displayPassiveBTC.textContent = passiveBTC.toFixed(4);
    displayPassiveUSD.textContent = passiveUSD.toFixed(1);
}

// Обработка клика с учетом Биржи Труда
clickBtn.addEventListener('click', (e) => {
    let addValue = 1;
    let textContent = "";

    if (currentCurrency === 'btc') {
        balanceBTC += 0.0001; // Клик по BTC дает сатоши
        textContent = "+0.0001 BTC 🪙";
    } else {
        // Если запущена рабочая смена — платим по 5$ за клик вместо 1$
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
});

function createFloatingText(e, textContent) {
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
        passiveUSD += upgrade.incomeUSD;
        passiveBTC += upgrade.incomeBTC;
        upgrade.cost = Math.ceil(upgrade.cost * 1.5);
        document.getElementById(`upgrade-${id}`).querySelector('.cost').textContent = upgrade.cost;
    } else if (upgrade.currency === 'btc' && balanceBTC >= upgrade.cost) {
        balanceBTC -= upgrade.cost;
        passiveUSD += upgrade.incomeUSD;
        passiveBTC += upgrade.incomeBTC;
        upgrade.cost = (upgrade.cost * 1.5);
        document.getElementById(`upgrade-${id}`).querySelector('.cost').textContent = upgrade.cost.toFixed(2);
    } else {
        alert('Недостаточно средств для этой инвестиции!');
    }
    updateUI();
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
            exchangeStatus.textContent = `✅ Успешно куплено ${amount} BTC за $${Math.floor(totalCostUSD)}`;
            exchangeStatus.style.color = "#00ff88";
        } else {
            exchangeStatus.textContent = "❌ Недостаточно Долларов для покупки!";
            exchangeStatus.style.color = "#ff5555";
        }
    } else {
        if (balanceBTC >= amount) {
            balanceBTC -= amount;
            balanceUSD += totalCostUSD;
            exchangeStatus.textContent = `✅ Успешно продано ${amount} BTC за $${Math.floor(totalCostUSD)}`;
            exchangeStatus.style.color = "#00ff88";
        } else {
            exchangeStatus.textContent = "❌ Недостаточно BTC для продажи!";
            exchangeStatus.style.color = "#ff5555";
        }
    }
    exchangeAmountInput.value = "";
    updateUI();
}

// VIP СМЕНА НА БИРЖЕ ТРУДА
function startLaborShift() {
    const now = Date.now();
    if (now < nextLaborAvailableTime) {
        alert("Ваши сутки еще не прошли! Отдохните перед новой смена.");
        return;
    }

    isLaborActive = true;
    // Смена длится 1 час (В кодовой миллисекундной логике: 1 час = 3600000 мс)
    laborEndTime = now + 3600000;
    // Следующая смена доступна через 24 часа (86400000 мс)
    nextLaborAvailableTime = now + 86400000;

    startLaborBtn.disabled = true;
    startLaborBtn.style.background = "#444";
    startLaborBtn.textContent = "Смена запущена";
}

// Таймер для контроля смен
function updateLaborTimer() {
    const now = Date.now();

    if (isLaborActive) {
        const timeLeft = laborEndTime - now;
        if (timeLeft <= 0) {
            isLaborActive = false;
            laborTimerText.textContent = "Смена завершена! Кулдаун.";
            laborTimerText.style.color = "#ff5555";
        } else {
            const mins = Math.floor((timeLeft % 3600000) / 60000);
            const secs = Math.floor((timeLeft % 60000) / 1000);
            laborTimerText.textContent = `💼 Смена активна! Осталось: ${mins}м ${secs}с (Доход x5)`;
            laborTimerText.style.color = "#00ff88";
        }
    } else if (now < nextLaborAvailableTime) {
        const timeLeft = nextLaborAvailableTime - now;
        const hrs = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);
        laborTimerText.textContent = `⏳ Новая смена через: ${hrs}ч ${mins}м`;
        laborTimerText.style.color = "#ffaa00";
        startLaborBtn.disabled = true;
        startLaborBtn.textContent = "Доступ заблокирован";
    } else {
        laborTimerText.textContent = "Статус: Свободен к набору (1 час)";
        laborTimerText.style.color = "#00ff88";
        startLaborBtn.disabled = false;
        startLaborBtn.style.background = "linear-gradient(135deg, #ffaa00 0%, #ff5500 100%)";
        startLaborBtn.textContent = "Начать рабочую смену";
    }
}

// Казино VIP
function playCasino(bet) {
    if (balanceUSD < bet) {
        casinoResult.textContent = "❌ Недостаточно Долларов для ставки!";
        casinoResult.style.color = "#ff5555";
        return;
    }
    balanceUSD -= bet;
    if (Math.floor(Math.random() * 100) < 60) {
        balanceUSD += bet * 2;
        casinoResult.textContent = `👑 Выиграно +$${bet * 2}!`;
        casinoResult.style.color = "#00ff88";
    } else {
        casinoResult.textContent = `📉 Потери на ставках: -$${bet}`;
        casinoResult.style.color = "#ff5555";
    }
    updateUI();
}

// Таблица лидеров в общем эквиваленте USD
