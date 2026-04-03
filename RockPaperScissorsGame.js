// 游戏状态
const gameState = {
    userSelection: null,
    userScore: 0,
    computerScore: 0,
    isPlaying: false,
    soundEnabled: true
};

// 选择映射
const choiceMap = {
    rock: { emoji: '✊', text: '石头' },
    scissors: { emoji: '✌️', text: '剪刀' },
    paper: { emoji: '✋', text: '布' }
};

// DOM 元素
const elements = {
    choiceBtns: document.querySelectorAll('.choice-btn'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    soundToggle: document.getElementById('sound-toggle'),
    userDisplay: document.getElementById('user-display'),
    computerDisplay: document.getElementById('computer-display'),
    resultText: document.getElementById('result-text'),
    userScore: document.getElementById('user-score'),
    computerScore: document.getElementById('computer-score'),
    userChoiceText: document.getElementById('user-choice-text'),
    computerChoiceText: document.getElementById('computer-choice-text')
};

// ==================== 音效系统 ====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 播放音效函数
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // 恢复音频上下文（浏览器自动播放策略）
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
        case 'select':
            // 清脆的"滴"声 - 选择
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;

        case 'start':
            // 上升的"叮"声 - 开始
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;

        case 'thinking':
            // 低沉的"嗡嗡"声 - 思考中
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;

        case 'win':
            // 欢快的胜利音效
            playWinSound();
            break;

        case 'lose':
            // 低沉的失败音效
            playLoseSound();
            break;

        case 'draw':
            // 中性的平局音效
            playDrawSound();
            break;

        case 'reset':
            // 重置音效
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
    }
}

// 胜利音效（双音调）
function playWinSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C大调和弦
    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.08 + 0.4);
        
        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.4);
    });
}

// 失败音效（下降音调）
function playLoseSound() {
    const notes = [392.00, 349.23, 293.66, 261.63]; // 下降音
    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.12 + 0.3);
        
        osc.start(audioCtx.currentTime + index * 0.12);
        osc.stop(audioCtx.currentTime + index * 0.12 + 0.3);
    });
}

// 平局音效（单音）
function playDrawSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
}

// ==================== 游戏逻辑 ====================

// 初始化
function init() {
    bindEvents();
    updateSoundButton();
}

// 绑定事件
function bindEvents() {
    // 选择按钮事件
    elements.choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => selectChoice(btn.dataset.choice));
    });

    // 开始按钮事件
    elements.startBtn.addEventListener('click', startGame);

    // 重置按钮事件
    elements.resetBtn.addEventListener('click', resetGame);

    // 音效开关
    elements.soundToggle.addEventListener('click', toggleSound);
}

// 切换音效
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    updateSoundButton();
    
    // 播放测试音效
    if (gameState.soundEnabled) {
        playSound('select');
    }
}

// 更新音效按钮显示
function updateSoundButton() {
    elements.soundToggle.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    elements.soundToggle.classList.toggle('muted', !gameState.soundEnabled);
    elements.soundToggle.title = gameState.soundEnabled ? '关闭音效' : '开启音效';
}

// 选择出招
function selectChoice(choice) {
    if (gameState.isPlaying) return;

    gameState.userSelection = choice;

    // 播放选择音效
    playSound('select');

    // 更新按钮状态
    elements.choiceBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.choice === choice);
    });

    // 更新显示
    elements.userDisplay.textContent = choiceMap[choice].emoji;
    elements.userDisplay.classList.add('active');
    elements.userChoiceText.textContent = `你选择了：${choiceMap[choice].text}`;
    
    // 启用开始按钮
    elements.startBtn.disabled = false;
    
    // 隐藏之前的结果
    elements.resultText.style.display = 'none';
    elements.computerDisplay.textContent = '❓';
    elements.computerDisplay.classList.remove('active');
    elements.computerChoiceText.textContent = '等待中...';
}

// 开始游戏
function startGame() {
    if (!gameState.userSelection || gameState.isPlaying) return;

    gameState.isPlaying = true;
    elements.startBtn.disabled = true;

    // 播放开始音效
    playSound('start');

    // 电脑思考动画
    elements.computerDisplay.classList.add('thinking');
    elements.computerChoiceText.textContent = '电脑思考中...';

    // 播放思考音效
    setTimeout(() => playSound('thinking'), 200);

    // 模拟思考时间
    setTimeout(() => {
        const computerChoice = getComputerChoice();
        resolveGame(computerChoice);
    }, 1200);
}

// 获取电脑选择
function getComputerChoice() {
    const choices = ['rock', 'scissors', 'paper'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// 判定游戏结果
function resolveGame(computerChoice) {
    const userChoice = gameState.userSelection;
    
    // 停止动画并显示电脑选择
    elements.computerDisplay.classList.remove('thinking');
    elements.computerDisplay.textContent = choiceMap[computerChoice].emoji;
    elements.computerDisplay.classList.add('active');
    elements.computerChoiceText.textContent = `电脑选择了：${choiceMap[computerChoice].text}`;

    // 判定胜负
    let result, resultClass, resultText;

    if (userChoice === computerChoice) {
        result = 'draw';
        resultClass = 'draw';
        resultText = '🤝 平局！';
    } else if (
        (userChoice === 'rock' && computerChoice === 'scissors') ||
        (userChoice === 'scissors' && computerChoice === 'paper') ||
        (userChoice === 'paper' && computerChoice === 'rock')
    ) {
        result = 'win';
        resultClass = 'win';
        resultText = '🎉 你赢了！';
        gameState.userScore++;
    } else {
        result = 'lose';
        resultClass = 'lose';
        resultText = '😔 你输了！';
        gameState.computerScore++;
    }

    // 播放结果音效
    playSound(result);

    // 更新分数
    elements.userScore.textContent = gameState.userScore;
    elements.computerScore.textContent = gameState.computerScore;

    // 显示结果
    elements.resultText.textContent = resultText;
    elements.resultText.className = `result-text ${resultClass}`;
    elements.resultText.style.display = 'inline-block';

    // 重置游戏状态
    gameState.isPlaying = false;
    gameState.userSelection = null;

    // 重置按钮状态
    elements.choiceBtns.forEach(btn => btn.classList.remove('selected'));
}

// 重置游戏
function resetGame() {
    // 播放重置音效
    playSound('reset');

    // 重置状态
    gameState.userSelection = null;
    gameState.userScore = 0;
    gameState.computerScore = 0;
    gameState.isPlaying = false;

    // 重置UI
    elements.userScore.textContent = '0';
    elements.computerScore.textContent = '0';
    elements.userDisplay.textContent = '❓';
    elements.computerDisplay.textContent = '❓';
    elements.userDisplay.classList.remove('active');
    elements.computerDisplay.classList.remove('active', 'thinking');
    elements.resultText.style.display = 'none';
    elements.userChoiceText.textContent = '等待选择...';
    elements.computerChoiceText.textContent = '等待中...';
    elements.startBtn.disabled = true;
    elements.choiceBtns.forEach(btn => btn.classList.remove('selected'));
}

// 启动游戏
init();
