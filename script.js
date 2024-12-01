const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const editButton = document.getElementById('editButton');
const titleButton = document.getElementById('titleButton');
const hideButton = document.getElementById('hideButton');
const namesList = document.getElementById('namesList');
const banner = document.getElementById('banner');
const spinSound = document.getElementById('spinSound');

let names = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
let hiddenNames = new Set();
let isSpinning = false;

function drawWheel() {
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, wheel.width, wheel.height);

    const activeNames = names.filter((_, i) => !hiddenNames.has(i));
    const sliceAngle = (2 * Math.PI) / activeNames.length;

    activeNames.forEach((name, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        const colors = ['#E5E1DA', '#89A8B2', '#E5E1DA', '#89A8B2'];
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#2A3335';
        ctx.font = '16px Arial Black';
        ctx.fillText(name, radius - 10, 5);
        ctx.restore();
    });
}

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    banner.style.display = 'none';
    spinButton.disabled = true;
    spinSound.currentTime = 0;
    spinSound.play();

    let startTime = null;
    const spinDuration = 30000;
    const totalRotation = 360 * 15 + Math.random() * 360;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / spinDuration;

        if (progress < 1) {
            const currentRotation = easeOutCubic(progress) * totalRotation;
            ctx.save();
            ctx.translate(wheel.width / 2, wheel.height / 2);
            ctx.rotate((currentRotation * Math.PI) / 180);
            ctx.translate(-wheel.width / 2, -wheel.height / 2);
            drawWheel();
            ctx.restore();

            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinButton.disabled = false;
            const activeNames = names.filter((_, i) => !hiddenNames.has(i));
            const sliceAngle = 360 / activeNames.length;

            const finalAngle = totalRotation % 360;
            const winningIndex = Math.floor(
                ((360 - finalAngle + sliceAngle / 2) % 360) / sliceAngle
            );
            showBanner(activeNames[winningIndex]);
            spinSound.pause();
        }
    }

    requestAnimationFrame(animate);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function showBanner(text) {
    banner.textContent = text;
    banner.style.display = 'block';
}


spinButton.addEventListener('click', spinWheel);
wheel.addEventListener('click', spinWheel);

resetButton.addEventListener('click', () => {
    hiddenNames.clear();
    drawWheel();
});

editButton.addEventListener('click', () => {
    if (namesList.style.display === 'none') {
        namesList.style.display = 'block';
        editButton.textContent = 'Done';
        namesList.value = names.join('\n');
    } else {
        namesList.style.display = 'none';
        editButton.textContent = 'Edit';
        names = namesList.value.split('\n').filter(name => name.trim() !== '');
        drawWheel();
    }
});

titleButton.addEventListener('click', () => {
    const newTitle = prompt('Please enter new title:');
    if (newTitle) {
        document.title = newTitle;
    }
});

hideButton.addEventListener('click', () => {
    const nameToHide = banner.textContent;
    if (nameToHide) {
        const index = names.indexOf(nameToHide);
        if (index !== -1) {
            hiddenNames.add(index);
            drawWheel();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { // Space
        e.preventDefault();
        spinWheel();
    } else if (e.key.toLowerCase() === 'x') {
        banner.style.display = 'none';
    } else if (e.key.toLowerCase() === 's') {
        hideButton.click();
    } else if (e.key.toLowerCase() === 'r') {
        resetButton.click();
    } else if (e.key.toLowerCase() === 'e') {
        editButton.click();
    }
});

// Initial draw
drawWheel();

// TIMER

let timeLeft = 60; // 5 minutes in seconds
let isRunning = false;
let timer = null;
let isSoundEnabled = true;

const display = document.getElementById('display');
const startButton = document.getElementById('startButton');
const soundToggle = document.getElementById('soundToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const modeButtons = document.querySelectorAll('.mode-toggle button');
const quickAddButtons = document.querySelectorAll('.quick-add button');
const resetButtonTimer = document.getElementById('resetButtonTimer');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    display.textContent = formatTime(timeLeft);
}

function startTimer() {
    if (!isRunning && timeLeft > 0) {
        isRunning = true;
        startButton.textContent = 'Pause';
        startButton.classList.add('running');
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                if (isSoundEnabled) {
                    playAlarm();
                }
            }
        }, 1000);
    } else {
        stopTimer();
    }
}

function stopTimer() {
    isRunning = false;
    startButton.textContent = 'Start';
    startButton.classList.remove('running');
    clearInterval(timer);
}

resetButtonTimer.addEventListener('click', () => {
    isRunning = false;
    startButton.textContent = 'Start';
    startButton.classList.remove('running');
    clearInterval(timer); // Timerni to'xtatish
    timeLeft = 60; // Boshlang'ich qiymatni o'rnatish
    updateDisplay();
});

function playAlarm() {
    // Create and play a beeping sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 1);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Event Listeners
startButton.addEventListener('click', startTimer);

soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.style.opacity = isSoundEnabled ? '1' : '0.5';
});

fullscreenToggle.addEventListener('click', toggleFullscreen);

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        stopTimer();
        timeLeft = 60;
        updateDisplay();
    });
});

quickAddButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!isRunning) {
            const seconds = parseInt(button.dataset.time);
            timeLeft += seconds;
            updateDisplay();
        }
    });
});


updateDisplay();