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
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (UTILS)
// ==========================================
window.updateUI = function() {
    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency];
    const convertedBalance = (window.gameState.balance * rate).toFixed(2);
    
    const balanceUsdEl = document.getElementById('balance-usd');
    if (balanceUsdEl) {
        balanceUsdEl.innerText = convertedBalance + " " + window.gameState.selectedCurrency;
    }

    const balanceBtcEl = document.getElementById('balance-btc');
    if (balanceBtcEl) {
        balanceBtcEl.innerText = window.gameState.cryptoBalance.toFixed(4) + " BTC";
    }

    const liveRateEl = document.getElementById('live-rate');
    if (liveRateEl) {
        const convertedCryptoPrice = (window.gameState.cryptoPrice * rate).toFixed(2);
        liveRateEl.innerText = convertedCryptoPrice + " " + window.gameState.selectedCurrency;
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
        
        const levelEl = document.getElementById("upgrade-level-" + id);
        const priceEl = document.getElementById("upgrade-price-" + id);
        
        if (levelEl) {
            levelEl.innerText = "Lvl " + upgrade.level;
        }
        if (priceEl) {
            priceEl.innerText = (currentPrice * rate).toFixed(0) + " " + window.gameState.selectedCurrency;
        }
    }
};

window.calculateClickPower = function() {
    // Базовая сила клика теперь всегда равна 1
    return 1;
};

window.calculatePassiveIncome = function() {
    let totalPassive = 0;
    
    // Цикл автоматически считает доход от всех 10 новых бизнесов
    for (let id in window.upgrades) {
        const upgrade = window.upgrades[id];
        totalPassive += upgrade.level * upgrade.passiveIncome;
    }
    
    return totalPassive;
};



window.createFloatingText = function(text) {
    const area = document.querySelector('.click-area');
    if (!area) return;

    const span = document.createElement('span');
    span.classList.add('floating-number');
    span.innerText = text;
    
    const x = 40 + Math.random() * 20;
    const y = 40 + Math.random() * 20;
    
    span.style.left = x + "%";
    span.style.top = y + "%";
    
    area.appendChild(span);
    
    setTimeout(function() {
        span.remove();
    }, 800);
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
            statusEl.innerText = "Победа! +" + winAmount + " USD";
            statusEl.style.color = "#00ff88";
        }
    } else {
        if (statusEl) {
            statusEl.innerText = "Проигрыш! -" + betAmount + " USD";
            statusEl.style.color = "#ff5500";
        }
    }
    window.updateUI();
    window.saveGame();
};

window.upgrades = {
    1: {
        name: "Накрутка ботов",
        basePrice: 60,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 0.2
    },
    2: {
        name: "Скам-канал",
        basePrice: 300,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 1.2
    },
    3: {
        name: "Слив инсайдов",
        basePrice: 1000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 5
    },
    4: {
        name: "Подпольное казино",
        basePrice: 4000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 24
    },
    5: {
        name: "Дубайская вилла",
        basePrice: 15000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 100
    },
    6: {
        name: "Золотая шахта",
        basePrice: 55000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 420
    },
    7: {
        name: "Оружейный завод",
        basePrice: 200000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 1800
    },
    8: {
        name: "Нефтяная вышка",
        basePrice: 750000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 7500
    },
    9: {
        name: "Собственная ЧВК",
        basePrice: 3500000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 38000
    },
    10: {
        name: "Ложа иллюминатов",
        basePrice: 15000000,
        priceMultiplier: 1.5,
        level: 0,
        passiveIncome: 200000
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
            if (statusEl) statusEl.innerText = "Куплено " + tradeVolume + " BTC";
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно USD!";
        }
    } else if (action === 'sell') {
        if (window.gameState.cryptoBalance >= tradeVolume) {
            window.gameState.cryptoBalance -= tradeVolume;
            window.gameState.balance += costInUSD;
            if (statusEl) statusEl.innerText = "Продано " + tradeVolume + " BTC";
        } else {
            if (statusEl) statusEl.innerText = "Недостаточно BTC на балансе!";
        }
    }
    window.updateUI();
    window.saveGame();
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
    // Вот ваши данные на отдельных строчках:
    const myBot = "AvtykClicker_bot";
    const myApp = "game";
    const myId  = "647232";
    
    // Программа сама соединит их через правильные слэши:
    const inviteUrl = "https://t.me/" + myBot + "/" + myApp + "?startapp=" + myId;
    
    navigator.clipboard.writeText(inviteUrl).then(function() {
        alert("Ссылка скопирована: " + inviteUrl);
    }).catch(function() {
        alert("Ошибка копирования. Ссылка: " + inviteUrl);
    });
};



// ==========================================
// 5. СОХРАНЕНИЕ И ЗАГРУЗКА (SAVE SYSTEM)
// ==========================================
window.saveGame = function() {
    const saveObject = {
        balance: window.gameState.balance,
        cryptoBalance: window.gameState.cryptoBalance,
        upgrades: {
            1: window.upgrades[1].level,
            2: window.upgrades[2].level,
            3: window.upgrades[3].level
        }
    };
    localStorage.setItem('cryptoTycoonGame', JSON.stringify(saveObject));
};

window.loadGame = function() {
    const savedGame = localStorage.getItem('cryptoTycoonGame');
    if (savedGame) {
        const parsedData = JSON.parse(savedGame);
        
        if (parsedData.balance !== undefined) window.gameState.balance = parsedData.balance;
        if (parsedData.cryptoBalance !== undefined) window.gameState.cryptoBalance = parsedData.cryptoBalance;
        
        if (parsedData.upgrades) {
            if (parsedData.upgrades[1] !== undefined) window.upgrades[1].level = parsedData.upgrades[1];
            if (parsedData.upgrades[2] !== undefined) window.upgrades[2].level = parsedData.upgrades[2];
            if (parsedData.upgrades[3] !== undefined) window.upgrades[3].level = parsedData.upgrades[3];
        }
    }
};

// ==========================================
// 6. ЕДИНАЯ ТОЧКА ИНИЦИАЛИЗАЦИИ И ЦИКЛЫ
// ==========================================
window.onload = function() {
    window.loadGame();
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

        window.updateUI();
    }, 1000);

    setInterval(window.saveGame, 10000);
};
