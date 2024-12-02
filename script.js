// LocalStorage işlemleri için yardımcı fonksiyonlar
function getLocalStorageItem(key, defaultValue) {
    return parseInt(localStorage.getItem(key)) || defaultValue;
}

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}

// Başlangıç puanı, seviye ve XP değerleri
let score = getLocalStorageItem('score', 0);
let level = getLocalStorageItem('level', 1);
let currentXP = getLocalStorageItem('currentXP', 0);
let xpToNextLevel = level * 1000;

// DOM elementleri
const scoreElement = document.getElementById('score-value');
const levelDisplay = document.getElementById("level-display");
const progressBar = document.getElementById("level-progress-bar");

// Skoru ve level sistemini güncelle
function updateScore() {
    scoreElement.textContent = `UGR: ${score}`;
    scoreElement.classList.add('score-update'); // CSS sınıfını ekle
    setTimeout(() => {
        scoreElement.classList.remove('score-update'); // CSS sınıfını kaldır
    }, 500); // 0.5 saniye sonra kaldır
}

function updateLevelSystem() {
    levelDisplay.textContent = `Level ${level}`;
    const progressPercent = (currentXP / xpToNextLevel) * 100;
    progressBar.style.width = `${progressPercent}%`;
}

// XP ekleme ve seviye atlama
function addXP(amount) {
    currentXP += amount;
    if (currentXP >= xpToNextLevel) {
        levelUp();
    } else {
        setLocalStorageItem('currentXP', currentXP);
    }
    updateLevelSystem();
}

function levelUp() {
    level++;
    currentXP = currentXP - xpToNextLevel;
    xpToNextLevel = level * 1000;
    setLocalStorageItem('level', level);
    setLocalStorageItem('currentXP', currentXP);
    updateLevelSystem();
    launchConfetti();
}

// Görev tamamlama
document.querySelectorAll(".task-button").forEach(button => {
    button.addEventListener("click", function () {
        const points = parseInt(this.getAttribute("data-points"), 10);
        score += points;
        addXP(points / 10); // Puanın %10'u kadar XP ekleyin
        setLocalStorageItem('score', score);
        updateScore();
        this.disabled = true;
        this.innerText += " (Tamamlandı)";
    });
});

// Mining sistemi
const miningDuration = 8 * 60 * 60 * 1000; // 8 saat
let endTime = getLocalStorageItem('endTime', 0);

function startCountdown(displayElement) {
    const countdownInterval = setInterval(() => {
        const now = Date.now();
        const remainingTime = endTime - now;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            displayElement.textContent = "Mining Completed!";
            enableClaimButton();
            localStorage.removeItem('endTime');
        } else {
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            displayElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

document.getElementById("claim-button").addEventListener("click", () => {
    score += 5000;
    addXP(500); // Örneğin mining sonucunda XP ekleyin
    setLocalStorageItem('score', score);
    updateScore();
    disableClaimButton();

    endTime = Date.now() + miningDuration;
    setLocalStorageItem('endTime', endTime);

    const countdownDisplay = document.getElementById("countdown");
    startCountdown(countdownDisplay);
    launchConfetti();
});

// Sayfa yüklendiğinde başlat
window.onload = () => {
    updateScore();
    updateLevelSystem();

    const countdownDisplay = document.getElementById("countdown");
    if (endTime > Date.now()) {
        startCountdown(countdownDisplay);
        disableClaimButton();
    } else {
        countdownDisplay.textContent = "Mining Completed!";
        enableClaimButton();
    }
};

// Konfeti animasyonu fonksiyonu
function launchConfetti() {
    const duration = 2 * 1000; // 2 saniye sürecek
    const end = Date.now() + duration;

    const colors = ['#bb0000', '#ffffff', '#00bb00'];

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

// Butonları etkinleştirme/devre dışı bırakma fonksiyonları
function enableClaimButton() {
    document.getElementById("claim-button").disabled = false;
}

function disableClaimButton() {
    document.getElementById("claim-button").disabled = true;
}

// Sayfa geçişi fonksiyonu
function switchPage(pageId) {
    // Tüm sayfaları gizle
    const pages = document.querySelectorAll('#page-content > div');
    pages.forEach(page => page.style.display = 'none');
    
    // İlgili sayfayı göster
    const activePage = document.getElementById(pageId);
    activePage.style.display = 'block';
}

// Varsayılan sayfa: Home Page
switchPage('home-page');

// Butonlara tıklama olaylarını ekleyelim
const navButtons = document.querySelectorAll('.nav-button');
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const pageId = button.getAttribute('data-page');
        switchPage(pageId);
    });
});
