// ==========================================
// 🕹️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ (STATE)
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
    cryptoPrice: 50000,
    leaderboard: {
        currentLeague: 'Бронза',
        userRank: 5000
    },
    // КРИТИЧЕСКАЯ АРХИТЕКТУРА: Уровни вынесены в стейт под числовые ID-ключи
    upgradeLevels: {
        1: 0,
        2: 0,
        3: 0
    }
};

// БАЗА ДАННЫХ УЛУЧШЕНИЙ (СВОЙСТВО .level ИСКЛЮЧЕНО ПО ТЗ)
window.upgrades = {
    1: { name: "Business Click", basePrice: 10, priceMultiplier: 1.5, power: 1 },
    2: { name: "Crypto Farm", basePrice: 100, priceMultiplier: 1.8, power: 5 },
    3: { name: "Bank Network", basePrice: 1000, priceMultiplier: 2.0, power: 25 }
};

const playerNames = ["CryptoKing", "Satoshi_99", "MemeLord", "Elon_Fan", "ClickMaster", "DiamondHands", "Pavel_D", "Whale_🐋", "BullRunner", "BearHunter", "HODLer", "ToniK", "CyberPank", "Alpha_Z"];

// ==========================================
// 🧮 ИСПРАВЛЕННЫЕ МАТЕМАТИЧЕСКИЕ РАСЧЕТЫ
// ==========================================
window.calculateClickPower = function() {
    if (!window.upgrades || !window.gameState || !window.gameState.upgradeLevels) return 1;
    
    const currentLvl = window.gameState.upgradeLevels[1] || 0;
    const upgradePower = window.upgrades[1] ? (window.upgrades[1].power || 1) : 1;
    
    return 1 + (currentLvl * upgradePower);
};

window.calculatePassiveIncome = function() {
    if (!window.upgrades || !window.gameState || !window.gameState.upgradeLevels) return 0;
    
    const farmLvl = window.gameState.upgradeLevels[2] || 0;
    const farmPower = window.upgrades[2] ? (window.upgrades[2].power || 0) : 0;
    const farmIncome = farmLvl * farmPower;
    
    const bankLvl = window.gameState.upgradeLevels[3] || 0;
    const bankPower = window.upgrades[3] ? (window.upgrades[3].power || 0) : 0;
    const bankIncome = bankLvl * bankPower;
    
    return farmIncome + bankIncome;
};

// ==========================================
// 🏆 СИСТЕМА ЛИГ И ДИНАМИЧЕСКИХ БОТОВ
// ==========================================
window.generateLeaderboard = function() {
    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; 

    const balance = window.gameState.balance;
    let leagueName = 'Бронзовая лига';
    let startRank = 5000;
    const displayCount = 7; 

    if (balance >= 500000) {
        leagueName = 'Платиновая лига (Топ 10)';
        startRank = Math.max(2, Math.floor(10 - (balance - 500000) / 100000));
    } else if (balance >= 50000) {
        leagueName = 'Золотая лига (Топ 1000)';
        startRank = Math.max(11, Math.floor(1000 - (balance - 50000) / 500));
    } else if (balance >= 5000) {
        leagueName = 'Серебряная лига (Топ 3000)';
        startRank = Math.max(1001, Math.floor(3000 - (balance - 5000) / 20));
    } else {
        leagueName = 'Бронзовая лига (Топ 5000)';
        startRank = Math.max(3001, Math.floor(5000 - balance / 2));
    }

    window.gameState.leaderboard.currentLeague = leagueName;
    window.gameState.leaderboard.userRank = startRank;

    const leagueTitleEl = document.getElementById('league-title');
    if (leagueTitleEl) {
        leagueTitleEl.innerText = leagueName;
    }

    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency] || 1;
    const currentCurrency = window.gameState.selectedCurrency;

    for (let i = 0; i < displayCount; i++) {
        const itemRank = startRank - 3 + i;
        if (itemRank <= 0) continue; 

        const row = document.createElement('div');
        row.classList.add('leaderboard-item');
        
        if (itemRank === startRank) {
            row.classList.add('user-row');
            row.style.background = 'rgba(0, 255, 136, 0.15)';
            row.style.fontWeight = 'bold';
        }

        let displayValue = "";
        if (itemRank === startRank) {
            displayValue = `${(window.gameState.balance * rate).toFixed(2)} ${currentCurrency}`;
        } else {
            const fakeBalance = window.gameState.balance + (startRank - itemRank) * (balance * 0.1 + 50);
            displayValue = `${(Math.max(0, fakeBalance) * rate).toFixed(2)} ${currentCurrency}`;
        }

        const name = (itemRank === startRank) ? "Вы" : (playerNames[(itemRank % playerNames.length)] + "_" + itemRank);

        row.innerHTML = `
            <span class="rank">#${itemRank}</span>
            <span class="name">${name}</span>
            <span class="score">${displayValue}</span>
        `;
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '8px 12px';
        row.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

        listContainer.appendChild(row);
    }
};

// ==========================================
// 💾 СИСТЕМА LOCALSTORAGE И СОХРАНЕНИЯ
// ==========================================
window.saveGame = function() {
    try {
        if (!window.gameState || !window.gameState.upgradeLevels) return;
        
        const rawData = {
            balance: window.gameState.balance,
            cryptoBalance: window.gameState.cryptoBalance,
            selectedCurrency: window.gameState.selectedCurrency,
            upgradeLevels: window.gameState.upgradeLevels
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
                if (window.gameState.upgradeLevels.hasOwnProperty(id)) {
                    window.gameState.upgradeLevels[id] = Number(payload.upgradeLevels[id]) || 0;
                }
            }
        }
    } catch (error) {
        console.error("Архив сохранений поврежден:", error);
        localStorage.removeItem('clicker_game_save_final');
    }
};

// ==========================================
// 🔄 ОБНОВЛЕНИЕ UI И НАВИГАЦИЯ
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

        const currentLvl = window.gameState.upgradeLevels[id] || 0;
        const currentPrice = Math.floor(item.basePrice * Math.pow(item.priceMultiplier, currentLvl));
        const levelEl = document.getElementById(`upgrade-level-${id}`);
        const priceEl = document.getElementById(`upgrade-price-${id}`);

        if (levelEl) levelEl.innerText = `Lvl ${currentLvl}`;
        if (priceEl) priceEl.innerText = `${(currentPrice * rate).toFixed(0)} ${currentCurrency}`;
    }

    window.generateLeaderboard();
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
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    const cleanId = tabId.replace('tab-', '');
   const targetBtn = document.getElementById(`nav-btn-${cleanId}`);
    if (targetBtn) targetBtn.classList.add('active');
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
    
    // Элемент плавно удалится через 1 секунду (1000 миллисекунд)
    setTimeout(function() {
        badge.remove();
    }, 1000);
};
