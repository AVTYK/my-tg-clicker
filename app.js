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
    window.gameState.balance += clickPower;
    
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
        // ВСТАВЛЕНО: Сохраняем текущую плавающую цену Биткоина
        cryptoPrice: window.gameState.cryptoPrice,
        upgrades: savedUpgrades,
        clanState: window.clanState
    };
    localStorage.setItem('cryptoTycoonGame', JSON.stringify(saveObject));
};



window.loadGame = function() {
    const savedGame = localStorage.getItem('cryptoTycoonGame');
    if (savedGame) {
        const parsedData = JSON.parse(savedGame);
        
        if (parsedData.balance !== undefined) window.gameState.balance = parsedData.balance;
        if (parsedData.cryptoBalance !== undefined) window.gameState.cryptoBalance = parsedData.cryptoBalance;
        
        // ВСТАВЛЕНО: Восстанавливаем сохраненную цену Биткоина из памяти
        if (parsedData.cryptoPrice !== undefined) {
            window.gameState.cryptoPrice = parsedData.cryptoPrice;
        } else {
            window.gameState.cryptoPrice = 50000; // Безопасная цена по умолчанию
        }
        
        if (parsedData.upgrades) {
            for (let id in window.upgrades) {
                if (parsedData.upgrades[id] !== undefined) {
                    window.upgrades[id].level = parsedData.upgrades[id];
                }
            }
        }

        if (parsedData.clanState) {
            window.clanState = parsedData.clanState;
        }
    }
};



// ==========================================
// 6. ЕДИНАЯ ТОЧКА ИНИЦИАЛИЗАЦИИ И ЦИКЛЫ
// ==========================================
window.onload = function() {
    window.loadGame();
    window.updateUI();

    // ОБНОВЛЕННЫЙ ЦИКЛ НАЧИСЛЕНИЯ ПАССИВНОГО ДОХОДА С УЧЕТОМ КЛАНОВОГО БУСТА
setInterval(function() {
    let passiveIncome = window.calculatePassiveIncome();
    if (passiveIncome > 0) {
        // Умножаем базовый доход на скромный процент за лояльность клану
        const clanBonus = (typeof window.getClanBonusMultiplier === 'function') 
            ? window.getClanBonusMultiplier() 
            : 1.0;
            
        passiveIncome = passiveIncome * clanBonus;
        
        window.gameState.balance += passiveIncome;
        
        // Сразу обновляем интерфейс, чтобы прирост баланса был виден на экране
        if (typeof window.updateUI === 'function') window.updateUI();
    }
}, 1000);


    setInterval(window.saveGame, 10000);
};

window.topPlayersMock = [
    { name: "🏆 Алмазная лига (Лидеры)", balance: 500000000 },
    { name: "🥇 Золотая лига", balance: 250000000 },
    { name: "🥈 Серебряная лига", balance: 120000000 },
    { name: "🥉 Бронзовая лига", balance: 50000000 },
    { name: "🌱 Новички", balance: 10000000 }
];

window.renderTopPlayers = function() {
    const listEl = document.getElementById('top-players-list');
    if (!listEl) return;
    
    // Очищаем старый список перед новой отрисовкой
    listEl.innerHTML = '';
    
    // Пытаемся автоматически найти, где в коде лежит ваш текущий баланс
        let currentBalance = (window.gameState && typeof window.gameState.balance !== 'undefined') ? window.gameState.balance : 0;

    
    // Создаем копию списка лиг
    const allPlayers = [...window.topPlayersMock];
const currentPlayerName = "⭐ " + window.getTelegramUserName();

    
    // Добавляем игрока в этот список для сравнения
    allPlayers.push({ name: currentPlayerName, balance: currentBalance });
    
    // Сортируем лиги и игрока: у кого больше баланс, тот выше
    allPlayers.sort((a, b) => b.balance - a.balance);
    
    // Функция для красивого отображения чисел (если вашей функции window.formatCurrency нет)
    const formatMoney = (typeof window.formatCurrency === 'function') 
        ? window.formatCurrency 
        : (num) => '$' + num.toLocaleString();

    // Выводим строки на экран
    allPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        
        // Настройка внешнего вида строки таблицы
        li.style.padding = '12px 15px';
        li.style.margin = '8px 0';
        li.style.borderRadius = '8px';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        li.style.color = '#fff';
        
        // Если это строка самого игрока — ярко выделяем её в списке
        if (player.name === currentPlayerName) {
            li.style.fontWeight = 'bold';
            li.style.border = '2px solid #0088cc';
            li.style.backgroundColor = 'rgba(0, 136, 204, 0.25)';
        }
        
        li.innerHTML = `
            <span>${index + 1}. ${player.name}</span>
            <span>${formatMoney(player.balance)}</span>
        `;
        listEl.appendChild(li);
    });
};

// Перехват переключения вкладок для автоматического обновления топа
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId) {
    // Запускаем стандартное переключение вкладок, если оно было создано ранее
    if (typeof originalSwitchTab === 'function') {
        originalSwitchTab(tabId);
    } else {
        // Если старой функции не нашлось, переключаем вкладки базовым способом
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');
    }
    
    // Если игрок нажал на кнопку 'Топ', сразу же обновляем список лиг на экране
    if (tabId === 'tab-top') {
        window.renderTopPlayers();
    }
};

// Функция, которая достает данные пользователя напрямую из Telegram API
window.getTelegramUserData = function() {
    // Инициализируем WebApp и сообщаем Telegram, что приложение готово
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
    }

    const webApp = window.Telegram?.WebApp;
    const user = webApp?.initDataUnsafe?.user;

    // Если данные пользователя успешно получены из Telegram
    if (user) {
        // Формируем имя (Имя + Фамилия), если их нет — берем @username
        const displayName = user.first_name 
            ? user.first_name + (user.last_name ? " " + user.last_name : "")
            : (user.username ? "@" + user.username : "Игрок Telegram");

        return {
            id: user.id,
            name: displayName,
            username: user.username ? "@" + user.username : null,
            avatar: user.photo_url || "assets/default-avatar.png" // Настоящая аватарка или заглушка, если фото скрыто
        };
    }

    // Крайний случай: если Telegram не вернул пользователя (например, при сбое сети)
    return {
        id: null,
        name: "Загрузка...",
        username: null,
        avatar: "assets/default-avatar.png"
    };
};


// Автоматический вызов при полной загрузке скрипта, чтобы компьютерный ТГ успел передать данные
window.addEventListener('DOMContentLoaded', function() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        // Принудительно обновляем экраны Топа и Кланов, когда Telegram передал данные
        if (typeof window.renderTopPlayers === 'function') window.renderTopPlayers();
        if (typeof window.updateClansUI === 'function') window.updateClansUI();
    }
});


// НАДЕЖНАЯ ИСПРАВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ КЛАНА (БЕЗ ВНЕШНИХ ЗАВИСИМОСТЕЙ)
window.createClan = function(clanName) {
    if (!clanName || clanName.trim() === "") {
        alert("Пожалуйста, введите название клана!");
        return false;
    }
    
    // Прямо здесь жестко прописываем цену и базовую структуру, если ее забыл создать браузер
    const createPrice = 1000000000; // 1 миллиард USD
    
    // Проверяем и создаем clanState, если его нет
    if (!window.clanState) {
        window.clanState = {
            hasClan: false,
            name: "",
            level: 1,
            joinPrice: 100000000,
            totalInvested: 0
        };
    }
    
    // Проверяем и создаем clanConfig на будущее, чтобы другие функции тоже не ломались
    if (!window.clanConfig) {
        window.clanConfig = {
            createPrice: 1000000000,
            baseUpgradePrice: 2000000000,
            priceMultiplier: 1.7,
            bonusPerLevel: 0.05
        };
    }

    // Проверяем наличие денег на балансе gameState
    if (window.gameState && typeof window.gameState.balance !== 'undefined') {
        if (window.gameState.balance >= createPrice) {
            window.gameState.balance -= createPrice;
            
            // Записываем данные созданного клана
            window.clanState.hasClan = true;
            window.clanState.name = clanName.trim();
            window.clanState.level = 1;
            window.clanState.isOwner = true;
            
            // Обновляем всю игру
            if (typeof window.saveGame === 'function') window.saveGame();
            if (typeof window.updateUI === 'function') window.updateUI();
            if (typeof window.updateClansUI === 'function') window.updateClansUI();
            
            alert(`Клан "${clanName}" успешно создан!`);
            return true;
        } else {
            alert("Недостаточно денег для создания клана! Требуется 1 000 000 000 USD");
            return false;
        }
    } else {
        alert("Ошибка архитектуры: Не найден баланс игры window.gameState.balance");
        return false;
    }
};


// ПОЛНОСТЬЮ АВТОНОМНАЯ ФУНКЦИЯ ИЗМЕНЕНИЯ ЦЕНЫ ВХОДА
window.changeClanJoinPrice = function() {
    // 1. Инициализируем clanState, если его почему-то нет
    if (!window.clanState) {
        window.clanState = {
            hasClan: false,
            name: "",
            level: 1,
            joinPrice: 100000000,
            totalInvested: 0
        };
    }

    // 2. Проверяем, есть ли у игрока вообще клан
    if (!window.clanState.hasClan) {
        alert("У вас еще нет клана, чтобы менять цену входа!");
        return false;
    }
    
    // 3. Сами находим поле ввода в HTML по его ID
    const inputEl = document.getElementById('clan-price-input');
    if (!inputEl) {
        alert("Ошибка: не найдено поле ввода цены в HTML!");
        return false;
    }

    const rawValue = inputEl.value;
    const parsedPrice = parseFloat(rawValue);
    
    // 4. Проверяем, что введено реальное число, а не пустота
    if (rawValue.trim() === "" || isNaN(parsedPrice) || parsedPrice < 0) {
        alert("Введите корректную сумму больше нуля!");
        return false;
    }
    
    // 5. Перезаписываем цену входа в память игры
    window.clanState.joinPrice = parsedPrice;
    
    // 6. Очищаем поле ввода для удобства игрока
    inputEl.value = "";
    
    // 7. Сохраняем в LocalStorage и мгновенно обновляем интерфейс на экране
    if (typeof window.saveGame === 'function') window.saveGame();
    if (typeof window.updateClansUI === 'function') window.updateClansUI();
    
    alert(`Цена вступления в ваш клан успешно изменена!`);
    return true;
};



// Функция выхода из клана или его роспуска
window.leaveClan = function() {
    if (!window.clanState.hasClan) return false;
    
    let confirmMessage = "Вы уверены, что хотите выйти из клана?";
    if (window.clanState.isOwner) {
        confirmMessage = "Вы являетесь создателем этого клана! Если вы выйдете, ваш клан будет полностью распущен, а его уровень сбросится. Продолжить?";
    }
    
    if (confirm(confirmMessage)) {
        // Полностью очищаем состояние клана у игрока
        window.clanState.hasClan = false;
        window.clanState.name = "";
        window.clanState.level = 1;
        window.clanState.isOwner = false;
        window.clanState.joinPrice = 100000000;
        
        if (typeof window.saveGame === 'function') window.saveGame();
        if (typeof window.updateUI === 'function') window.updateUI();
        alert("Вы покинули клан.");
        return true;
    }
    return false;
};


// Функция обновления интерфейса вкладки кланов
window.updateClansUI = function() {
    const createBlock = document.getElementById('clan-create-block');
    const infoBlock = document.getElementById('clan-info-block');
    
    if (!createBlock || !infoBlock) return;

    // Если у игрока есть клан, показываем панель управления, иначе — форму создания
    if (window.clanState && window.clanState.hasClan) {
        createBlock.style.display = 'none';
        infoBlock.style.display = 'block';

        // Обновляем текстовые данные на экране
        const nameEl = document.getElementById('my-clan-name');
        const lvlEl = document.getElementById('my-clan-level');
        const bonusEl = document.getElementById('my-clan-bonus');
        const priceEl = document.getElementById('my-clan-price');

        if (nameEl) nameEl.innerText = window.clanState.name;
        if (lvlEl) lvlEl.innerText = window.clanState.level;
        if (bonusEl) bonusEl.innerText = `x${window.getClanBonusMultiplier().toFixed(2)}`;
        
        const formatMoney = (typeof window.formatCurrency === 'function') 
            ? window.formatCurrency 
            : (num) => '$' + num.toLocaleString();
            
        if (priceEl) priceEl.innerText = formatMoney(window.clanState.joinPrice);
    } else {
        createBlock.style.display = 'block';
        infoBlock.style.display = 'none';
    }
};

// Модификация переключения вкладок для автоматического обновления интерфейса кланов
const originalSwitchTabWithClans = window.switchTab;
window.switchTab = function(tabId) {
    if (typeof originalSwitchTabWithClans === 'function') {
        originalSwitchTabWithClans(tabId);
    } else {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add('active');
    }
    
    // Если игрок нажал на кнопку 'Кланы', сразу же перерисовываем состояние клана
    if (tabId === 'tab-clans' && typeof window.updateClansUI === 'function') {
        window.updateClansUI();
    }
};

// ОБНОВЛЕННАЯ ФУНКЦИЯ РАСЧЕТА КЛАНОВОГО БУСТА С ЛИМИТОМ ВРЕМЕНИ (4% и 2%)
window.getClanBonusMultiplier = function() {
    // Если игрок без клана, доход обычный (x1.00)
    if (!window.clanState || !window.clanState.hasClan) return 1.0;
    
    // Если в памяти нет даты создания/вступления, записываем сегодняшнюю
    if (!window.clanState.joinDate) {
        window.clanState.joinDate = Date.now();
    }
    
    // Вычисляем, сколько миллисекунд игрок находится в клане
    const timeDiff = Date.now() - window.clanState.joinDate;
    
    // Переводим миллисекунды в реальные календарные дни
    // (Для тестов: можно временно заменить 86400000 на 60000, чтобы 1 день шел как 1 минута)
    const daysInClan = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    let totalBonus = 0;
    
    // Проверяем роль игрока: Создатель или обычный Участник
    if (window.clanState.isOwner) {
        // Настройки для Владельца: +1% старт, +0.1% в день, максимум +4%
        const baseBonus = 0.01;
        const dailyBonus = daysInClan * 0.001;
        totalBonus = baseBonus + dailyBonus;
        
        if (totalBonus > 0.04) totalBonus = 0.04; // Жесткий лимит 4%
    } else {
        // Настройки для Участника: +0.5% старт, +0.05% в день, максимум +2%
        const baseBonus = 0.005;
        const dailyBonus = daysInClan * 0.0005;
        totalBonus = baseBonus + dailyBonus;
        
        if (totalBonus > 0.02) totalBonus = 0.02; // Жесткий лимит 2%
    }
    
    // Возвращаем итоговый множитель (например, 1.04 при максимальном бусте владельца)
    return 1.0 + totalBonus;
};

// ЖИВОЙ ТАЙМЕР ДЛЯ КРИПТОБИРЖИ (ОБНОВЛЕНИЕ РАЗ В 3 СЕКУНДЫ)
setInterval(function() {
    // 1. Проверяем, задана ли стартовая цена в игре. Если нет — ставим $50,000
    if (!window.gameState) window.gameState = {};
    if (!window.gameState.cryptoPrice || window.gameState.cryptoPrice < 5000) {
        window.gameState.cryptoPrice = 50000;
    }

    // 2. Генерируем случайный скачок цены в диапазоне от -2.5% до +2.5%
    // Math.random() * 0.05 дает число от 0 до 0.05, вычитаем 0.025 -> получаем от -0.025 до +0.025
    const percentChange = (Math.random() * 0.05) - 0.025;
    let newPrice = window.gameState.cryptoPrice * (1 + percentChange);

    // 3. Жестко удерживаем цену в вашем диапазоне: от $5,000 до $500,000
    const minPrice = 5000;
    const maxPrice = 500000;

    if (newPrice < minPrice) {
        newPrice = minPrice + (Math.random() * 500); // Разворачиваем цену вверх
    } else if (newPrice > maxPrice) {
        newPrice = maxPrice - (Math.random() * 5000); // Разворачиваем цену вниз
    }

    // Округляем до целого числа, чтобы цена выглядела красиво
    window.gameState.cryptoPrice = Math.floor(newPrice);

    // 4. Мгновенно выводим обновленный курс на экран в HTML
    const rateEl = document.getElementById('live-rate');
    if (rateEl) {
        // Красиво форматируем число (например: $54,320)
        rateEl.innerText = (typeof window.formatCurrency === 'function')
            ? window.formatCurrency(window.gameState.cryptoPrice)
            : '$' + window.gameState.cryptoPrice.toLocaleString();
    }
}, 3000); // Интервал ровно 3000 миллисекунд (3 секунды)








