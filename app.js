// Игровое состояние
let balance = 0;
let passiveIncome = 0;
let currentCurrency = 'btc'; // Текущая выбранная валюта
let playerUsername = "Вы (Учитель)";

// Улучшения
const upgrades = {
    1: { name: 'Бизнес-клик', cost: 100, income: 0.1 },
    2: { name: 'Крипто-ферма', cost: 500, income: 0.5 },
    3: { name: 'Торговый бот', cost: 2000, income: 2.0 },
    4: { name: 'IT-Компания', cost: 12000, income: 10.0 },
    5: { name: 'Банковская сеть', cost: 75000, income: 50.0 }
};

// Конкуренты в топе
let leaders = [
    { username: "Pavel_Durov", balance: 650000 },
    { username: "Crypto_Sheikh", balance: 320000 },
    { username: "Satoshi_Nakamoto", balance: 150000 },
    { username: "WallStreet_Wolf", balance: 95000 },
    { username: "Elon_Musk", balance: 50000 },
    { username: "Tapper_Whale", balance: 18000 },
    { username: "Bitcoin_Fan", balance: 6000 }
];

// Элементы UI
const balanceDisplay = document.getElementById('balance');
const balanceTitle = document.getElementById('balance-title');
const passiveIncomeDisplay = document.getElementById('passive-income');
const clickBtn = document.getElementById('click-btn');
const clickAreaContainer = document.getElementById('click-area-container');
const casinoResult = document.getElementById('casino-result');
const leaderboardList = document.getElementById('leaderboard-list');

// Инициализация TG WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        playerUsername = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name;
    }
}

// Изменение типа валюты по клику на селектор
function changeCurrency(type) {
    currentCurrency = type;
    document.getElementById('select-btc').classList.remove('active');
    document.getElementById('select-usd').classList.remove('active');
    
    if (type === 'btc') {
        document.getElementById('select-btc').classList.add('active');
        clickBtn.textContent = '🪙';
        balanceTitle.textContent = 'Намайнено Bitcoin';
    } else {
        document.getElementById('select-usd').classList.add('active');
        clickBtn.textContent = '💵';
        balanceTitle.textContent = 'Капитал в Долларах';
    }
    updateUI();
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if (tabName === 'game') {
        document.getElementById('tab-game').classList.add('active');
        document.getElementById('btn-nav-game').classList.add('active');
    } else if (tabName === 'leaderboard') {
        document.getElementById('tab-leaderboard').classList.add('active');
        document.getElementById('btn-nav-leaderboard').classList.add('active');
        renderLeaderboard();
    }
}

// Обновление интерфейса
function updateUI() {
    const sign = currentCurrency === 'btc' ? ' BTC' : ' $';
    balanceDisplay.textContent = (balance === 0 ? "0.0" : balance.toFixed(1)) + sign;
    passiveIncomeDisplay.textContent = `+${passiveIncome.toFixed(1)}${sign}`;
}

// Эффект взлетающего текста (+1) при клике
function createFloatingText(e) {
    const text = document.createElement('div');
    text.classList.add('floating-number');
    text.textContent = currentCurrency === 'btc' ? '+1 BTC 🪙' : '+1 $ 💵';
    
    // Позиционируем элемент в месте клика
    const rect = clickBtn.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
    
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
    
    clickAreaContainer.appendChild(text);
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        text.remove();
    }, 800);
}

// Обработчик клика
clickBtn.addEventListener('click', (e) => {
    balance += 1;
    createFloatingText(e);
    updateUI();
});

// Покупка улучшений
function buyUpgrade(id) {
    const upgrade = upgrades[id];
    if (balance >= upgrade.cost) {
        balance -= upgrade.cost;
        passiveIncome += upgrade.income;
        upgrade.cost = Math.ceil(upgrade.cost * 1.5);
        
        const card = document.getElementById(`upgrade-${id}`);
        if (card) {
            card.querySelector('.cost').textContent = upgrade.cost;
        }
        updateUI();
    } else {
        alert('Недостаточно капитала для инвестиции!');
    }
}

// Логика казино (60/40)
function playCasino(bet) {
    if (balance < bet) {
        casinoResult.textContent = "❌ Недостаточно средств для VIP ставки!";
        casinoResult.style.color = "#ff5555";
        return;
    }

    balance -= bet;
    const roll = Math.floor(Math.random() * 100);
    const sign = currentCurrency === 'btc' ? ' BTC' : ' $';

    if (roll < 60) {
        const winAmount = bet * 2;
        balance += winAmount;
        casinoResult.textContent = `👑 Триумф! Вы забираете +${winAmount}${sign}!`;
        casinoResult.style.color = "#00ff88";
    } else {
        casinoResult.textContent = `📉 Потери на бирже! Минус ${bet}${sign}.`;
        casinoResult.style.color = "#ff5555";
    }
    updateUI();
}

// Генерация топа лидеров
function renderLeaderboard() {
    leaderboardList.innerHTML = "";
    let allPlayers = [...leaders, { username: playerUsername, balance: balance }];
    allPlayers.sort((a, b) => b.balance - a.balance);

    allPlayers.forEach((player, index) => {
        const item = document.createElement('div');
        item.classList.add('leader-item');
        if (player.username === playerUsername) {
            item.classList.add('current-player');
        }

        let medal = index + 1;
        if (index === 0) medal = "🥇";
        if (index === 1) medal = "🥈";
        if (index === 2) medal = "🥉";

        item.innerHTML = `
            <div class="leader-rank">${medal}</div>
            <div class="leader-name">@${player.username}</div>
            <div class="leader-score">${Math.floor(player.balance).toLocaleString()}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

// Таймер пассивного дохода
setInterval(() => {
    if (passiveIncome > 0) {
        balance += passiveIncome;
        updateUI();
    }
}, 1000);

// Старт
updateUI();
