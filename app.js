// ==========================================
// 1. СОСТОЯНИЕ ИГРЫ (STATE)
// ==========================================
window.gameState = {
    balance: 0,
     totalEarned: 0,
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
    // Окупаемость ~2 минуты. Цена растет на 15% за уровень
    1: { name: "Накрутка ботов", basePrice: 120, priceMultiplier: 1.15, level: 0, passiveIncome: 1 },
    
    // Окупаемость ~4 минуты. Цена растет на 20%
    2: { name: "Скам-канал", basePrice: 1200, priceMultiplier: 1.20, level: 0, passiveIncome: 5 },
    
    // Окупаемость ~8 минут. Цена растет на 25%
    3: { name: "Слив инсайдов", basePrice: 9600, priceMultiplier: 1.25, level: 0, passiveIncome: 20 },
    
    // Окупаемость ~15 минут. Цена растет на 30%
    4: { name: "Подпольное казино", basePrice: 72000, priceMultiplier: 1.30, level: 0, passiveIncome: 80 },
    
    // Окупаемость ~25 минут. Цена растет на 35%
    5: { name: "Дубайская вилла", basePrice: 600000, priceMultiplier: 1.35, level: 0, passiveIncome: 400 },
    
    // Окупаемость ~40 минут. Цена растет на 40%
    6: { name: "Золотая шахта", basePrice: 4800000, priceMultiplier: 1.40, level: 0, passiveIncome: 2000 },
    
    // Окупаемость ~1 час. Цена растет на 45%
    7: { name: "Оружейный завод", basePrice: 36000000, priceMultiplier: 1.45, level: 0, passiveIncome: 10000 },
    
    // Окупаемость ~1.5 часа. Цена удваивается с каждым уровнем
    8: { name: "Нефтяная вышка", basePrice: 270000000, priceMultiplier: 1.50, level: 0, passiveIncome: 50000 },
    
    // Окупаемость ~2 часа. Элитный бизнес
    9: { name: "Собственная ЧВК", basePrice: 2160000000, priceMultiplier: 1.55, level: 0, passiveIncome: 300000 },
    
    // Финал. Окупаемость ~3 часа чистого времени на один уровень!
    10: { name: "Ложа иллюминатов", basePrice: 20000000000, priceMultiplier: 1.60, level: 0, passiveIncome: 2000000 }
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

window.buyUpgrade = function(upgradeId) {
    const upgrade = window.upgrades[upgradeId];
    if (!upgrade) return;

    const currentPrice = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));

    if (window.gameState.balance >= currentPrice) {
        window.gameState.balance -= currentPrice;
        upgrade.level += 1;
        window.updateUI();
        window.saveGame();
    } else {
        alert("Недостаточно USD для покупки улучшения!");
    }
};

window.calculateClickPower = function() {
    return 1;
};

window.calculatePassiveIncome = function() {
    let totalPassive = 0;
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
    
    // Плюс идет в обычный кошелек:
    window.gameState.balance += clickPower;
    
    // Плюс идет в общую историю богатства для лиги:
    window.gameState.totalEarned += clickPower; 
    
    const rate = window.gameState.currencyRates[window.gameState.selectedCurrency];
    const displayText = "+" + (clickPower * rate).toFixed(1) + " " + window.gameState.selectedCurrency;
    window.createFloatingText(displayText);
    
    window.updateUI();
};


window.copyInviteLink = function() {
    const myBot = "AvtykClicker_bot";
    const myApp = "game";
    const myId  = "647232";
    
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
    const savedUpgrades = {};
    for (let id in window.upgrades) {
        savedUpgrades[id] = window.upgrades[id].level;
    }

    const saveObject = {
        balance: window.gameState.balance,
        cryptoBalance: window.gameState.cryptoBalance,
        upgrades: savedUpgrades
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
            for (let id in window.upgrades) {
                if (parsedData.upgrades[id] !== undefined) {
                    window.upgrades[id].level = parsedData.upgrades[id];
                }
            }
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
