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


window.updateLeaderboard = function() {
    // 1. Рассчитываем общий капитал игрока (USD + BTC по текущему курсу)
    const currentScore = window.gameState.balance + (window.gameState.cryptoBalance * window.gameState.cryptoPrice);
    
    // 2. Рассчитываем лигу игрока на основе его капитала
    let leagueName = "Бронзовая";
    let leagueClass = "league-bronze";

    if (currentScore >= 400000) {
        leagueName = "Бриллиантовая";
        leagueClass = "league-diamond";
    } else if (currentScore >= 100000) {
        leagueName = "Золотая";
        leagueClass = "league-gold";
    } else if (currentScore >= 25000) {
        leagueName = "Серебряная";
        leagueClass = "league-silver";
    } else {
        leagueName = "Бронзовая";
        leagueClass = "league-bronze";
    }

    // 3. Соединяем ботов и игрока в один массив для честной сортировки позиций
    let fullList = [];
    
    // Добавляем всех ботов
    window.gameState.mockLeaderboard.forEach(function(bot) {
        fullList.push({
            name: bot.name,
            balance: bot.balanceUSD,
            isPlayer: false
        });
    });

    // Добавляем живого игрока
    fullList.push({
        name: "Вы (Капитал)",
        balance: currentScore,
        isPlayer: true
    });

    // Сортируем весь список по убыванию баланса
    fullList.sort(function(a, b) {
        return b.balance - a.balance;
    });

    // Находим реальное итоговое место игрока в отсортированном списке
    let playerRank = 1;
    for (let i = 0; i < fullList.length; i++) {
        if (fullList[i].isPlayer) {
            playerRank = i + 1;
            break;
        }
    }

    // 4. Корректируем отображение ранга под ваши правила лиг (если игрок не вошел в топ-10 ботов)
    let finalRankValue = playerRank;
    if (playerRank > 10) {
        if (leagueName === "Золотая") {
            finalRankValue = Math.max(11, 500 - Math.floor((currentScore - 100000) / 300000 * 489));
        } else if (leagueName === "Серебряная") {
            finalRankValue = Math.max(501, 1000 - Math.floor((currentScore - 25000) / 75000 * 499));
        } else if (leagueName === "Бронзовая") {
            finalRankValue = Math.max(1001, 2000 - Math.floor((currentScore) / 25000 * 999));
        }
    }

    // Обновляем текстовые элементы лиги на экране
    const leagueNameEl = document.getElementById('player-league-name');
    const rankValueEl = document.getElementById('player-rank-value');
    
    if (leagueNameEl) {
        leagueNameEl.innerText = leagueName;
        leagueNameEl.className = ""; 
        leagueNameEl.classList.add(leagueClass);
    }
    if (rankValueEl) {
        rankValueEl.innerText = finalRankValue;
    }

    // 5. Отрисовка таблицы лидеров на экране (только если вкладка "Топ" активна)
    const container = document.getElementById('leaderboard-list');
    const tabLeaderboard = document.getElementById('tab-leaderboard');
    if (!container || !tabLeaderboard || !tabLeaderboard.classList.contains('active')) return;

    container.innerHTML = "";
    
    // Если игрок плетется ниже 10-го места, выводим его текущую позицию отдельной плашкой в самый верх
    if (playerRank > 10) {
        const pRow = document.createElement('div');
        pRow.classList.add('leaderboard-item', 'player-row');
        pRow.innerHTML = `
            <span class="lb-rank">#${finalRankValue}</span>
            <span class="lb-name">Вы (Текущая позиция)</span>
            <span class="lb-balance">${currentScore.toFixed(0)} USD</span>
        `;
        container.appendChild(pRow);
    }

    // Вырезаем ровно первые 10 мест из общего отсортированного массива для показа в таблице
    const displayTop10 = fullList.slice(0, 10);

    displayTop10.forEach(function(item, index) {
        const currentItemRank = index + 1;
        let itemLeagueClass = "league-bronze";
        
        // Топ-10 — это всегда Бриллиантовая лига
        if (currentItemRank <= 10) itemLeagueClass = "league-diamond";
        
        const row = document.createElement('div');
        row.classList.add('leaderboard-item');
        if (item.isPlayer) row.classList.add('player-row');
        
        // Если это строка игрока — пишем его ранг, если бот — его порядковый номер
        const showRank = item.isPlayer ? finalRankValue : currentItemRank;

        row.innerHTML = `
            <span class="lb-rank ${itemLeagueClass}">#${showRank}</span>
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
    // Встроены ваши реальные данные из BotFather для запуска Mini App
    const botUsername = "AvtykClicker_bot"; 
    const appShortName = "game";           
    
    // Генерация уникального ID игрока для реферальной системы
    const userId = Math.floor(Math.random() * 899999 + 100000);
    
    // Сборка официальной ссылки, которая откроет ваше приложение прямо в Telegram
    const dummyUrl = "https://t.me/" + botUsername + "/" + appShortName + "?startapp=" + userId;
    
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
};}
