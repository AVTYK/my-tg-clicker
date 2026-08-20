// ==========================================
// 1. СОСТОЯНИЕ ИГРЫ (STATE)
// ==========================================
window.gameState = {
    balance: 0,
    cryptoBalance: 0,
    selectedCurrency: 'USD',
    currencyRates: {
        USD: 1,
        EUR: 0.92,
        RUB: 90
    },
    cryptoPrice: 50000
};

// ==========================================
// 2. БАЗА ДАННЫХ УЛУЧШЕНИЙ (UPGRADES)
// ==========================================
window.upgrades = {
    1: { name: "Business Click", basePrice: 10, priceMultiplier: 1.5, level: 0, power: 1 },
    2: { name: "Crypto Farm", basePrice: 100, priceMultiplier: 1.8, level: 0, power: 5 },
    3: { name: "Bank Network", basePrice: 1000, priceMultiplier: 2.0, level: 0, power: 25 }
};

// ==========================================
// 3. МЕХАНИКА РАСЧЕТОВ (MATH ENGINE)
// ==========================================
window.calculateClickPower = function() {
    if (!window.upgrades || !window.upgrades[1]) return 1;
    return 1 + (window.upgrades[1].level * window.upgrades[1].power);
};

window.calculatePassiveIncome = function() {
    if (!window.upgrades || !window.upgrades[2] || !window.upgrades[3]) return 0;
    
    const farmIncome = window.upgrades[2].level * window.upgrades[2].power;
    const bankIncome = window.upgrades[3].level * window.upgrades[3].power;
    
    return farmIncome + bankIncome;
};

// ==========================================
// 4. СИСТЕМА LOCALSTORAGE (STORAGE ENGINE)
// ==========================================
window.saveGame = function() {
    try {
        if (!window.upgrades || !window.upgrades[1] || !window.upgrades[2] || !window.upgrades[3]) return;
        
        const rawData = {
            balance: window.gameState.balance,
            cryptoBalance: window.gameState.cryptoBalance,
            selectedCurrency: window.gameState.selectedCurrency,
            upgradeLevels: {
                1: window.upgrades[1].level,
                2: window.upgrades[2].level,
                3: window.upgrades[3].level
            }
        };
        localStorage.setItem('clicker_game_save_final', JSON.stringify(rawData));
    } catch (error) {
        console.error("Критическая ошибка сохранения:", error);
    }
};

window.loadGame = function() {
    try {
        const serialized = localStorage.getItem('clicker_game_save_final');
        if (!serialized) return;

        const payload = JSON.parse(serialized);
        if (!payload) return;

        if (typeof payload.balance === 'number') window.gameState.balance = payload.balance;
        if (typeof payload.cryptoBalance === 'number') window.gameState.cryptoBalance = payload.cryptoBalance;
        if (payload.selectedCurrency) window.gameState.selectedCurrency = payload.selectedCurrency;

        if (payload.upgradeLevels) {
            for (let id in payload.upgradeLevels) {
                if (window.upgrades && window.upgrades[id]) {
                    window.upgrades[id].level = Number(payload.upgradeLevels[id]) || 0;
                }
            }
        }
    } catch (error) {
        console.error("Архив сохранений поврежден, сброс кэша:", error);
        localStorage.removeItem('clicker_game_save_final');
    }
};

// ==========================================
// 5. ИНТЕРФЕЙС И РЕНДЕРИНГ (UI ENGINE)
// ==========================================
window.updateUI = function() {
    const currentCurrency = window.gameState.selectedCurrency;
    const rate = window.gameState.currencyRates[currentCurrency] || 1;

    const balanceUsdEl = document.getElementById('balance-usd');
    if (balanceUsdEl) {
        balanceUsdEl.innerText = `${(window.gameState.balance * rate).toFixed(2)} ${currentCurrency}`;
    }

    const balanceBtcEl = document.getElementById('balance-btc');
    if (balanceBtcEl) {
        balanceBtcEl.innerText = `${window.gameState.cryptoBalance.toFixed(4)} BTC`;
    }

    const liveRateEl = document.getElementById('live-rate');
    if (liveRateEl) {
        liveRateEl.innerText = `${(window.gameState.cryptoPrice * rate).toFixed(2)} ${currentCurrency}`;
    }

    const uiPincomeEl = document.getElementById('ui-pincome');
    if (uiPincomeEl) {
        uiPincomeEl.innerText = (window.calculatePassiveIncome() * rate).toFixed(2);
    }

    const uiCpowerEl = document.getElementById('ui-cpower');
    if (uiCpowerEl) {
        uiCpowerEl.innerText = (window.calculateClickPower() * rate).toFixed(2);
    }

    for (let id in window.upgrades) {
        const item = window.upgrades[id];
        if (!item) continue;

        const currentPrice = Math.floor(item.basePrice * Math.pow(item.priceMultiplier, item.level));
        const levelEl = document.getElementById(`upgrade-level-${id}`);
        const priceEl = document.getElementById(`upgrade-price-${id}`);

        if (levelEl) levelEl.innerText = `Lvl ${item.level}`;
        if (priceEl) priceEl.innerText = `${(currentPrice * rate).toFixed(0)} ${currentCurrency}`;
    }
};

window.createFloatingText = function(text) {
    const container = document.querySelector('.click-area');
    if (!container) return;

    const badge = document.createElement('span');
    badge.classList.add('floating-number');
    badge.innerText = text;

    badge.style.left = `${40 + Math.random() * 20}%`;
    badge.style.top = `${40 + Math.random() * 20}%`;

    container.appendChild(badge);
    setTimeout(() => badge.remove(), 800);
};

// ==========================================
// 6. ИГРОВЫЕ ДЕЙСТВИЯ (ACTION HANDLERS)
// ==========================================
window.startLaborShift = function() {
    const power = window.calculateClickPower();
    window.gameState.balance += power;

    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency] || 1;
    window.createFloatingText(`+${(power * rate).toFixed(1)} ${window.gameState.selectedCurrency}`);
    
    window.updateUI();
};

window.buyUpgrade = function(upgradeId) {
    const item = window.upgrades[upgradeId];
    if (!item) return;

    const price = Math.floor(item.basePrice * Math.pow(item.priceMultiplier, item.level));

    if (window.gameState.balance >= price) {
        window.gameState.balance -= price;
        item.level += 1;
        window.updateUI();
        window.saveGame();
    } else {
        alert("Недостаточно средств для покупки!");
    }
};

window.playCasino = function(betAmount) {
    const statusEl = document.getElementById('casino-result');
    if (window.gameState.balance < betAmount) {
        if (statusEl) statusEl.innerText = "Недостаточно средств!";
        return;
    }

    window.gameState.balance -= betAmount;
    const win = Math.random() > 0.5;

    if (win) {
        const prize = betAmount * 2;
        window.gameState.balance += prize;
        if (statusEl) {
            statusEl.innerText = `Победа! +${prize} USD`;
            statusEl.style.color = "#00ff88";
        }
    } else {
        if (statusEl) {
            statusEl.innerText = `Проигрыш! -${betAmount} USD`;
            statusEl.style.color = "#ff5500";
        }
    }
    window.updateUI();
    window.saveGame();
};

window.tradeCrypto = function(action) {
    const volume = 0.01;
    const cost = window.gameState.cryptoPrice * volume;
    const statusEl = document.getElementById('exchange-status');

    if (action === 'buy') {
        if (window.gameState.balance >= cost) {
            window.gameState.balance -= cost;
            window.gameState.cryptoBalance += volume;
            if (statusEl) statusEl.innerText = `Куплено ${volume} BTC`;
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно USD!";
        }
    } else if (action === 'sell') {
        if (window.gameState.cryptoBalance >= volume) {
            window.gameState.cryptoBalance -= volume;
            window.gameState.balance += cost;
            if (statusEl) statusEl.innerText = `Продано ${volume} BTC`;
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно BTC!";
        }
    }
    window.updateUI();
    window.saveGame();
};

window.changeCurrency = function(currencyCode) {
    if (window.gameState.currencyRates[currencyCode]) {
        window.gameState.selectedCurrency = currencyCode;

        document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`curr-btn-${currencyCode}`);
        if (activeBtn) activeBtn.classList.add('active');

        window.updateUI();
        window.saveGame();
    }
};

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-btn-${tabId.replace('tab-', '')}`);
    if (activeBtn) activeBtn.classList.add('active');
};

window.copyInviteLink = function() {
    const inviteUrl = `https://t.me{Math.floor(100000 + Math.random() * 899999)}`;
    navigator.clipboard.writeText(inviteUrl)
        .then(() => alert(`Ссылка скопирована: ${inviteUrl}`))
        .catch(() => alert(`Не удалось скопировать. Ссылка: ${inviteUrl}`));
};

// ==========================================
// 7. ОРКЕСТРАТОР И СЕРВИСНЫЕ ТАЙМЕРЫ (LOOPS)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    window.loadGame();
    window.updateUI();

    // Пассивный доход раз в секунду
    setInterval(function() {
        const incomePerSecond = window.calculatePassiveIncome();
        if (incomePerSecond > 0) {
            window.gameState.balance += incomePerSecond;
            window.updateUI();
        }
    }, 1000);

    // Автосохранение раз в 3 секунды
    setInterval(function() {
        window.saveGame();
    }, 3000);
});
