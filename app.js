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
    window.saveGame();
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
    const dummyUrl = "https://t.me" + Math.floor(Math.random() * 899999 + 100000);
    navigator.clipboard.writeText(dummyUrl).then(function() {
        alert("Ссылка копирована: " + dummyUrl);
    }).catch(function() {
        alert("Ошибка копирования. Ссылка: " + dummyUrl);
    });
};

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
// 5. ЕДИНАЯ ТОЧКА ИНИЦИАЛИЗАЦИИ И ЦИКЛЫ
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
