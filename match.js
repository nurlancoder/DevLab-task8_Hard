class EnhancedMemoryGame {
    constructor() {
        this.difficulties = {
            easy: { rows: 4, cols: 4 },
            medium: { rows: 4, cols: 6 },
            hard: { rows: 6, cols: 6 }
        };
        
        this.cardThemes = {
            emojis: ['🎯', '🎪', '🎭', '🎨', '🎸', '🎲', '🎳', '🎮', '🎺', '🎻', '🎬', '🎤', '🎵', '🎶', '🎼', '🎹', '🎧', '🎨'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
            flags: ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇧🇷', '🇮🇳', '🇨🇳', '🇷🇺', '🇰🇷', '🇲🇽', '🇿🇦', '🇳🇿', '🇸🇪'],
            numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']
        };
        
        this.currentDifficulty = 'easy';
        this.currentTheme = 'emojis';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.startTime = null;
        this.timerInterval = null;
        this.soundEnabled = true;
        this.darkTheme = false;
        this.hintsUsed = 0;
        this.hintsAvailable = 3;
        this.streak = 0;
        this.maxStreak = 0;
        this.hintTimeout = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeGame();
        this.loadPreferences();
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.attemptsDisplay = document.getElementById('attempts');
        this.matchesDisplay = document.getElementById('matches');
        this.timerDisplay = document.getElementById('timer');
        this.scoreDisplay = document.getElementById('score');
        this.victoryModal = document.getElementById('victoryModal');
        this.victoryStats = document.getElementById('victoryStats');
        this.performanceBadges = document.getElementById('performanceBadges');
        this.progressFill = document.getElementById('progressFill');
        this.soundToggle = document.getElementById('soundToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.hintCounter = document.getElementById('hintCounter');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }
    
    initializeEventListeners() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.initializeGame();
            });
        });
        
        document.querySelectorAll('.card-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.card-theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTheme = e.target.dataset.theme;
                this.initializeGame();
            });
        });
        
        this.soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });
        
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.playAgainBtn.addEventListener('click', () => {
            this.closeVictoryModal();
            this.newGame();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case 'n':
                    this.newGame();
                    break;
                case 'r':
                    this.reset();
                    break;
                case 'h':
                    this.showHint();
                    break;
                case 'escape':
                    this.closeVictoryModal();
                    break;
                case 't':
                    this.toggleTheme();
                    break;
                case 's':
                    this.toggleSound();
                    break;
            }
        });
        
        this.victoryModal.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) {
                this.closeVictoryModal();
            }
        });
    }
    
    loadPreferences() {
        const soundPref = localStorage.getItem('memoryMatchSound');
        const themePref = localStorage.getItem('memoryMatchTheme');
        
        if (soundPref !== null) {
            this.soundEnabled = soundPref === 'true';
            this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        if (themePref === 'dark') {
            this.toggleTheme(false);
        }
    }
    
    savePreferences() {
        localStorage.setItem('memoryMatchSound', this.soundEnabled);
        localStorage.setItem('memoryMatchTheme', this.darkTheme ? 'dark' : 'light');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.savePreferences();
        
        if (this.soundEnabled) {
            this.playSound('toggle');
        }
    }
    
    toggleTheme(playSound = true) {
        this.darkTheme = !this.darkTheme;
        document.body.classList.toggle('dark-theme', this.darkTheme);
        this.themeToggle.textContent = this.darkTheme ? '☀️' : '🌙';
        this.savePreferences();
        
        if (this.soundEnabled && playSound) {
            this.playSound('toggle');
        }
    }
    
    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderBoard();
        this.resetStats();
        this.updateBoardLayout();
    }
    
    createCards() {
        this.cards = [];
        const config = this.difficulties[this.currentDifficulty];
        const totalPairs = (config.rows * config.cols) / 2;
        const symbols = this.cardThemes[this.currentTheme].slice(0, totalPairs);
        
        symbols.forEach(symbol => {
            this.cards.push({ symbol, flipped: false, matched: false, id: Math.random() });
            this.cards.push({ symbol, flipped: false, matched: false, id: Math.random() });
        });
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    updateBoardLayout() {
        const config = this.difficulties[this.currentDifficulty];
        this.gameBoard.className = `game-board board-${config.cols}x${config.rows}`;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }
    
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.index = index;
        
        if (card.flipped || card.matched) {
            cardDiv.classList.add('flipped');
        }
        if (card.matched) {
            cardDiv.classList.add('matched');
        }
        
        cardDiv.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${card.symbol}</div>
        `;
        
        cardDiv.addEventListener('click', () => this.handleCardClick(index));
        
        return cardDiv;
    }
    
    handleCardClick(index) {
        if (this.cards[index].flipped || 
            this.cards[index].matched || 
            this.flippedCards.length === 2 ||
            this.gameEnded) {
            return;
        }
        
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }
        
        this.flipCard(index);
        this.playSound('flip');
    }
    
    flipCard(index) {
        const card = this.cards[index];
        card.flipped = true;
        this.flippedCards.push(index);
        
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('flipped');
        
        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.updateAttempts();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    checkForMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        
        if (firstCard.symbol === secondCard.symbol) {
            this.handleMatch(firstIndex, secondIndex);
        } else {
            this.handleMismatch(firstIndex, secondIndex);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(firstIndex, secondIndex) {
        this.cards[firstIndex].matched = true;
        this.cards[secondIndex].matched = true;
        this.matchedPairs++;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        
        const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
        firstElement.classList.add('matched');
        secondElement.classList.add('matched');
        
        this.calculateScore();
        this.updateStats();
        this.updateProgress();
        this.playSound('match');
        
        if (this.matchedPairs === this.cards.length / 2) {
            setTimeout(() => this.endGame(), 800);
        }
    }
    
    handleMismatch(firstIndex, secondIndex) {
        this.cards[firstIndex].flipped = false;
        this.cards[secondIndex].flipped = false;
        this.streak = 0;
        
        const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
        
        firstElement.classList.add('wrong');
        secondElement.classList.add('wrong');
        
        setTimeout(() => {
            firstElement.classList.remove('flipped', 'wrong');
            secondElement.classList.remove('flipped', 'wrong');
        }, 600);
        
        this.playSound('wrong');
    }
    
    calculateScore() {
        const baseScore = 100;
        const streakBonus = this.streak > 1 ? (this.streak - 1) * 25 : 0;
        const timeBonus = this.gameStarted ? Math.max(0, 50 - Math.floor((Date.now() - this.startTime) / 1000)) : 0;
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[this.currentDifficulty];
        
        this.score += Math.floor((baseScore + streakBonus + timeBonus) * difficultyMultiplier);
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            if (!this.gameEnded) {
                this.updateTimer();
            }
        }, 1000);
    }
    
    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateStats() {
        this.attemptsDisplay.textContent = this.attempts;
        this.matchesDisplay.textContent = this.matchedPairs;
        this.scoreDisplay.textContent = this.score.toLocaleString();
    }
    
    updateAttempts() {
        this.attemptsDisplay.textContent = this.attempts;
    }
    
    updateProgress() {
        const totalPairs = this.cards.length / 2;
        const progress = (this.matchedPairs / totalPairs) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    showHint() {
        if (this.gameEnded || this.hintsAvailable <= 0) return;
        
        const unmatched = this.cards
            .map((card, index) => ({ card, index }))
            .filter(({ card }) => !card.matched && !card.flipped);
        
        if (unmatched.length < 2) return;
        
        for (let i = 0; i < unmatched.length; i++) {
            for (let j = i + 1; j < unmatched.length; j++) {
                if (unmatched[i].card.symbol === unmatched[j].card.symbol) {
                    const firstElement = document.querySelector(`[data-index="${unmatched[i].index}"]`);
                    const secondElement = document.querySelector(`[data-index="${unmatched[j].index}"]`);
                    
                    firstElement.style.animation = 'pulse 1s ease-in-out 3';
                    secondElement.style.animation = 'pulse 1s ease-in-out 3';
                    
                    if (this.hintTimeout) {
                        clearTimeout(this.hintTimeout);
                    }
                    
                    this.hintTimeout = setTimeout(() => {
                        firstElement.style.animation = '';
                        secondElement.style.animation = '';
                    }, 3000);
                    
                    this.hintsUsed++;
                    this.hintsAvailable--;
                    this.hintCounter.textContent = this.hintsAvailable;
                    this.score = Math.max(0, this.score - 50);
                    this.updateStats();
                    this.playSound('hint');
                    return;
                }
            }
        }
    }
    
    endGame() {
        this.gameEnded = true;
        clearInterval(this.timerInterval);
        
        const finalTime = this.timerDisplay.textContent;
        const efficiency = Math.round((this.matchedPairs / this.attempts) * 100);
        const timeInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        this.victoryStats.innerHTML = `
            <div class="victory-stat">
                <span><strong>Time:</strong></span>
                <span>${finalTime}</span>
            </div>
            <div class="victory-stat">
                <span><strong>Attempts:</strong></span>
                <span>${this.attempts}</span>
            </div>
            <div class="victory-stat">
                <span><strong>Efficiency:</strong></span>
                <span>${efficiency}%</span>
            </div>
            <div class="victory-stat">
                <span><strong>Score:</strong></span>
                <span>${this.score.toLocaleString()}</span>
            </div>
            <div class="victory-stat">
                <span><strong>Max Streak:</strong></span>
                <span>${this.maxStreak}</span>
            </div>
            <div class="victory-stat">
                <span><strong>Hints Used:</strong></span>
                <span>${this.hintsUsed}</span>
            </div>
        `;
        
        this.showPerformanceBadges(efficiency, timeInSeconds);
        this.playSound('victory');
        
        setTimeout(() => {
            this.victoryModal.style.display = 'flex';
        }, 500);
    }
    
    showPerformanceBadges(efficiency, timeInSeconds) {
        let badges = [];
        
        if (efficiency >= 90) badges.push('<span class="performance-badge badge-excellent">🎯 Perfect Memory</span>');
        else if (efficiency >= 75) badges.push('<span class="performance-badge badge-good">🧠 Sharp Mind</span>');
        else if (efficiency >= 60) badges.push('<span class="performance-badge badge-average">💭 Good Focus</span>');
        
        if (timeInSeconds < 60) badges.push('<span class="performance-badge badge-excellent">⚡ Lightning Fast</span>');
        else if (timeInSeconds < 120) badges.push('<span class="performance-badge badge-good">🚀 Quick Thinker</span>');
        
        if (this.maxStreak >= 5) badges.push('<span class="performance-badge badge-excellent">🔥 Streak Master</span>');
        else if (this.maxStreak >= 3) badges.push('<span class="performance-badge badge-good">✨ Hot Streak</span>');
        
        if (this.hintsUsed === 0) badges.push('<span class="performance-badge badge-excellent">🎖️ No Hints</span>');
        
        if (this.currentDifficulty === 'hard') badges.push('<span class="performance-badge badge-excellent">💪 Challenge Master</span>');
        
        this.performanceBadges.innerHTML = badges.join('');
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const sounds = {
            flip: () => this.beep(800, 100),
            match: () => {
                this.beep(600, 100);
                setTimeout(() => this.beep(800, 100), 100);
            },
            wrong: () => this.beep(300, 200),
            victory: () => {
                [523, 659, 783, 1046].forEach((freq, i) => {
                    setTimeout(() => this.beep(freq, 200), i * 150);
                });
            },
            hint: () => this.beep(1000, 300),
            toggle: () => this.beep(500, 100)
        };
        
        if (sounds[type]) sounds[type]();
    }
    
    beep(frequency, duration) {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        }
    }
    
    resetStats() {
        this.attempts = 0;
        this.matchedPairs = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.flippedCards = [];
        this.hintsUsed = 0;
        this.hintsAvailable = 3;
        this.streak = 0;
        this.maxStreak = 0;
        
        this.updateStats();
        this.timerDisplay.textContent = '00:00';
        this.progressFill.style.width = '0%';
        this.hintCounter.textContent = this.hintsAvailable;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
    }
    
    newGame() {
        this.resetStats();
        this.createCards();
        this.shuffleCards();
        this.renderBoard();
        this.closeVictoryModal();
    }
    
    reset() {
        this.resetStats();
        this.cards.forEach(card => {
            card.flipped = false;
            card.matched = false;
        });
        this.renderBoard();
        this.closeVictoryModal();
    }
    
    closeVictoryModal() {
        this.victoryModal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new EnhancedMemoryGame();
    
    window.startNewGame = () => game.newGame();
    window.resetGame = () => game.reset();
    window.showHint = () => game.showHint();
    window.closeVictoryModal = () => game.closeVictoryModal();
});
