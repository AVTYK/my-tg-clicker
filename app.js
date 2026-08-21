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
    cryptoPrice: 50000,
    mockLeaderboard: []
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
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (UTILS)
// ==========================================
window.updateUI = function() {
    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency];
    const convertedBalance = (window.gameState.balance * rate).toFixed(2);
    
    const balanceUsdEl = document.getElementById('balance-usd');
    if (balanceUsdEl) {
        balanceUsdEl.innerText = `${convertedBalance} ${window.gameState.selectedCurrency}`;
    }

    const balanceBtcEl = document.getElementById('balance-btc');
    if (balanceBtcEl) {
        balanceBtcEl.innerText = `${window.gameState.cryptoBalance.toFixed(4)} BTC`;
    }

    const liveRateEl = document.getElementById('live-rate');
    if (liveRateEl) {
        const convertedCryptoPrice = (window.gameState.cryptoPrice * rate).toFixed(2);
        liveRateEl.innerText = `${convertedCryptoPrice} ${window.gameState.selectedCurrency}`;
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
        const upgrade = window.upgrades[id];
        const currentPrice = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));
        
        const levelEl = document.getElementById(`upgrade-level-${id}`);
        const priceEl = document.getElementById(`upgrade-price-${id}`);
        
        if (levelEl) {
            levelEl.innerText = `Lvl ${upgrade.level}`;
        }
        if (priceEl) {
            priceEl.innerText = `${(currentPrice * rate).toFixed(0)} ${window.gameState.selectedCurrency}`;
        }
    }window.calculateClickPower = function() {
    return 1 + (window.upgrades[1].level * window.upgrades[1].power);
};

window.calculatePassiveIncome = function() {
    const incomeFromMining = window.upgrades[2].level * window.upgrades[2].power;
    const incomeFromBusiness = window.upgrades[3].level * window.upgrades[3].power;
    return incomeFromMining + incomeFromBusiness;
};


    window.updateLeaderboard();
};

window.calculateClickPower = function() {
    // ПОЛНОСТЬЮ ИСПРАВЛЕНО: Прямое обращение по числовому ID [1] вместо .level
    return 1 + (window.upgrades[1].level * window.upgrades[1].power);
};

window.calculatePassiveIncome = function() {
    // ПОЛНОСТЬЮ ИСПРАВЛЕНО: Прямое обращение по числовым ID [2] и [3] вместо .level
    const incomeFromMining = window.upgrades[2].level * window.upgrades[2].power;
    const incomeFromBusiness = window.upgrades[3].level * window.upgrades[3].power;
    return incomeFromMining + incomeFromBusiness;
};

window.createFloatingText = function(text) {
    const area = document.querySelector('.click-area');
    if (!area) return;

    const span = document.createElement('span');
    span.classList.add('floating-number');
    span.innerText = text;
    
    const x = 40 + Math.random() * 20;
    const y = 40 + Math.random() * 20;
    
    span.style.left = `${x}%`;
    span.style.top = `${y}%`;
    
    area.appendChild(span);
    
    setTimeout(function() {
        span.remove();
    }, 800);
};

window.initMockLeaderboard = function() {
    const names = ["CryptoKing", "Satoshi99", "ElonMusketeer", "BullRun", "WhaleWatcher", "DiamondHands", "MinerPro", "HodlGod", "DefiKnight", "BagHolder"];
    window.gameState.mockLeaderboard = [];
    
    for (let i = 0; i < 10; i++) {
        window.gameState.mockLeaderboard.push({
            name: names[i] || `User_${Math.floor(Math.random() * 9000 + 1000)}`,
            balanceUSD: 500000 - (i * 45000) - Math.floor(Math.random() * 5000)
        });
    }
};

window.updateLeaderboard = function() {
    const currentScore = window.gameState.balance + (window.gameState.cryptoBalance * window.gameState.cryptoPrice);
    
    let rank = 2500; 
    let leagueName = "Бронзовая";
    let leagueClass = "league-bronze";

    if (currentScore >= 400000) {
        let tempRank = 11;
        for (let i = 0; i < window.gameState.mockLeaderboard.length; i++) {
            if (currentScore > window.gameState.mockLeaderboard[i].balanceUSD) {
                tempRank = i + 1;
                break;
            }
        }
        rank = tempRank > 10 ? 10 : tempRank;
        leagueName = "Бриллиантовая";
        leagueClass = "league-diamond";
    } else if (currentScore >= 100000) {
        rank = Math.max(11, 500 - Math.floor((currentScore - 100000) / 3000 * 489));
        leagueName = "Золотая";
        leagueClass = "league-gold";
    } else if (currentScore >= 25000) {
        rank = Math.max(501, 1000 - Math.floor((currentScore - 25000) / 75000 * 499));
        leagueName = "Серебряная";
        leagueClass = "league-silver";
    } else {
        rank = Math.max(1001, 2000 - Math.floor((currentScore) / 25000 * 999));
        leagueName = "Бронзовая";
        leagueClass = "league-bronze";
    }

    const leagueNameEl = document.getElementById('player-league-name');
    const rankValueEl = document.getElementById('player-rank-value');
    
    if (leagueNameEl) {
        leagueNameEl.innerText = leagueName;
        leagueNameEl.className = ""; 
        leagueNameEl.classList.add(leagueClass);
    }
    if (rankValueEl) {
        rankValueEl.innerText = rank;
    }

    const container = document.getElementById('leaderboard-list');
    const tabLeaderboard = document.getElementById('tab-leaderboard');
    if (!container || !tabLeaderboard || !tabLeaderboard.classList.contains('active')) return;

    let displayList = [];
    for (let i = 0; i < window.gameState.mockLeaderboard.length; i++) {
        displayList.push({
            rank: i + 1,
            name: window.gameState.mockLeaderboard[i].name,
            balance: window.gameState.mockLeaderboard[i].balanceUSD,
            isPlayer: false
        });
    }

    if (rank <= 10) {
        displayList.splice(rank - 1, 0, {
            rank: rank,
            name: "Вы (Выигрываете)",
            balance: currentScore,
            isPlayer: true
        });
        displayList.pop();
    }

    container.innerHTML = "";
    
    if (rank > 10) {
        const pRow = document.createElement('div');
        pRow.classList.add('leaderboard-item', 'player-row');
        pRow.innerHTML = `
            <span class="lb-rank">#${rank}</span>
            <span class="lb-name">Вы (Текущая позиция)</span>
            <span class="lb-balance">${currentScore.toFixed(0)} USD</span>
        `;
        container.appendChild(pRow);
    }

    displayList.forEach(function(item) {
        let itemLeagueClass = "league-bronze";
        if (item.rank <= 10) itemLeagueClass = "league-diamond";
        
        const row = document.createElement('div');
        row.classList.add('leaderboard-item');
        if (item.isPlayer) row.classList.add('player-row');
        
        row.innerHTML = `
            <span class="lb-rank ${itemLeagueClass}">#${item.rank}</span>
            <span class="lb-name">${item.name}</span>
            <span class="lb-balance">${item.balance.toFixed(0)} USD</span>
        `;
        container.appendChild(row);
    });
};

// ==========================================
// 4. ИНЛАЙН ОБРАБОТЧИКИ СОБЫТИЙ (WINDOW FUNCTIONS)
// ==========================================
window.switchTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });

    const currentBtnId = 'nav-btn-' + tabId.replace('tab-', '');
    const activeBtn = document.getElementById(currentBtnId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    window.updateUI();
};

window.changeCurrency = function(currencyCode) {
    if (window.gameState.currencyRates[currencyCode]) {
        window.gameState.selectedCurrency = currencyCode;
        
        const selectorButtons = document.querySelectorAll('.selector-btn');
        selectorButtons.forEach(function(btn) {
            btn.classList.remove('active');
        });
        
        const activeSelectorBtn = document.getElementById('curr-btn-' + currencyCode);
        if (activeSelectorBtn) {
            activeSelectorBtn.classList.add('active');
        }

        window.updateUI();
    }
};

window.playCasino = function(betAmount) {
    const statusEl = document.getElementById('casino-result');
    
    if (window.gameState.balance < betAmount) {
        if (statusEl) statusEl.innerText = "Недостаточно средств!";
        return;
    }
    
    window.gameState.balance -= betAmount;
    const isWin = Math.random() > 0.5;
    
    if (isWin) {
        const winAmount = betAmount * 2;
        window.gameState.balance += winAmount;
        if (statusEl) {
            statusEl.innerText = `Победа! +${winAmount} USD`;
            statusEl.style.color = "#00ff88";
        }
    } else {
        if (statusEl) {
            statusEl.innerText = `Проигрыш! -${betAmount} USD`;
            statusEl.style.color = "#ff5500";
        }
    }
    window.updateUI();
};

window.buyUpgrade = function(upgradeId) {
    const upgrade = window.upgrades[upgradeId];
    if (!upgrade) return;

    const currentPrice = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));

    if (window.gameState.balance >= currentPrice) {
        window.gameState.balance -= currentPrice;
        upgrade.level += 1;
        window.updateUI();
    } else {
        alert("Недостаточно USD для покупки улучшения!");
    }
};

window.tradeCrypto = function(action) {
    const tradeVolume = 0.01;
    const costInUSD = window.gameState.cryptoPrice * tradeVolume;
    const statusEl = document.getElementById('exchange-status');

    if (action === 'buy') {
        if (window.gameState.balance >= costInUSD) {
            window.gameState.balance -= costInUSD;
            window.gameState.cryptoBalance += tradeVolume;
            if (statusEl) statusEl.innerText = `Куплено ${tradeVolume} BTC`;
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно USD!";
        }
    } else if (action === 'sell') {
        if (window.gameState.cryptoBalance >= tradeVolume) {
            window.gameState.cryptoBalance -= tradeVolume;
            window.gameState.balance += costInUSD;
            if (statusEl) statusEl.innerText = `Продано ${tradeVolume} BTC`;
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно BTC на балансе!";
        }
    }
    window.updateUI();
};

window.startLaborShift = function() {
    const clickPower = window.calculateClickPower();
    window.gameState.balance += clickPower;
    
    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency];
    const displayText = "+" + (clickPower * rate).toFixed(1) + " " + window.gameState.selectedCurrency;
    window.createFloatingText(displayText);
    
    window.updateUI();
};

window.copyInviteLink = function() {
    // Впишите сюда юзернейм вашего бота (без @) и короткое имя приложения из BotFather
    const botUsername = "CryptoTycoonBot"; // Пример: имя вашего бота
    const appShortName = "game";           // Пример: короткое имя Mini App
    
    // Генерация уникального ID игрока (в будущем здесь будет реальный ID из Telegram.WebApp)
    const userId = Math.floor(Math.random() * 899999 + 100000);
    
    // Официальный формат прямой ссылки на Telegram Mini App с реферальным параметром
    const dummyUrl = `https://t.me{botUsername}/${appShortName}?startapp=${userId}`;
    
    navigator.clipboard.writeText(dummyUrl).then(function() {
        alert("Реферальная ссылка скопирована: " + dummyUrl);
    }).catch(function() {
        alert("Ошибка копирования. Ссылка: " + dummyUrl);
    });
};


// ==========================================
// 5. ИНИЦИАЛИЗАЦИЯ И ИГРОВЫЕ ЦИКЛЫ (GAME TIMERS)
// ==========================================
window.onload = function() {
    window.initMockLeaderboard();
    window.updateUI();

    setInterval(function() {
        const passiveIncome = window.calculatePassiveIncome();
        if (passiveIncome > 0) {
            window.gameState.balance += passiveIncome;
        }
        
        const priceChangePercent = (Math.random() * 5 - 2.5) / 100;
        window.gameState.cryptoPrice += window.gameState.cryptoPrice * priceChangePercent;
        if (window.gameState.cryptoPrice < 5000) {
            window.gameState.cryptoPrice = 5000;
        }

        window.gameState.mockLeaderboard.forEach(function(bot) {
            bot.balanceUSD += Math.floor(Math.random() * 150 - 50);
        });

        window.gameState.mockLeaderboard.sort(function(a, b) {
            return b.balanceUSD - a.balanceUSD;
        });

        window.updateUI();
    }, 1000);
};
