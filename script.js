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
const scoreElement = document.getElementById('score');
const levelDisplay = document.getElementById("level-display");
const progressBar = document.getElementById("level-progress-bar");

// Skoru ve level sistemini güncelle
function updateScore() {
    const formattedScore = formatScore(score); // Puanı formatla
    scoreElement.innerHTML = `<img src="coin.png" alt="Coin" style="width: 30px; height: 30px; margin-right: 10px;"> ${formattedScore}`; // Coin PNG ile birlikte göster
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
        const taskName = this.getAttribute("data-task");
        const points = parseInt(this.getAttribute("data-points"), 10);

        const lastCompleted = parseInt(localStorage.getItem(`${taskName}-lastCompleted`)) || 0;
        const now = Date.now();

        if (now - lastCompleted < 24 * 60 * 60 * 1000) {
            showNotification("Bu görevi 24 saat sonra tekrar tamamlayabilirsiniz!");
            return;
        }

        score += points;
        addXP(points / 10); // Puanın %10'u kadar XP ekle
        setLocalStorageItem('score', score);
        updateScore();

        // Tamamlama zamanını kaydet
        localStorage.setItem(`${taskName}-lastCompleted`, now);

        // Butonu devre dışı bırak ve başarı emojisi ekle
        this.disabled = true;
        this.innerText = "Tamamlandı!";
        showNotification("Görev tamamlandı! 🎉");
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

// Bildirim gösterme fonksiyonu
function showNotification(message, duration = 2000) {
    const notificationElement = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    // Mesajı ayarla ve bildirimi göster
    messageElement.textContent = message;
    notificationElement.style.display = 'block';
    notificationElement.classList.add('show');
    
    // Bildirimin belirtilen süre sonunda kaybolmasını sağla
    setTimeout(() => {
        notificationElement.classList.remove('show');
        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 500);
    }, duration);
}

// Sayı formatlama fonksiyonu
function formatScore(score) {
    if (score >= 1_000_000_000) {
        return (score / 1_000_000_000).toFixed(1) + "B"; // Milyar (B)
    } else if (score >= 1_000_000) {
        return (score / 1_000_000).toFixed(1) + "M"; // Milyon (M)
    } else if (score >= 1_000) {
        return (score / 1_000).toFixed(1) + "K"; // Bin (K)
    } else {
        return score.toString(); // 1000'in altında ise olduğu gibi göster
    }
}

// Kullanıcı için benzersiz referans ID oluştur
function generateReferralID() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli benzersiz ID
}

// Referans ID kontrol et ve oluştur
let referralID = localStorage.getItem('referralID');
if (!referralID) {
    referralID = generateReferralID();
    localStorage.setItem('referralID', referralID);
}

// Yeni referans linki oluştur
const generatedReferralLink = `https://t.me/ugrcoin_bot/ugrcoin?ref=${referralID}`;
document.getElementById('referral-link').value = generatedReferralLink;

// Link kopyalama işlemi
document.getElementById('copy-link-button').addEventListener('click', () => {
    const referralInput = document.getElementById('referral-link');
    referralInput.select();
    referralInput.setSelectionRange(0, 99999); // Mobil uyumlu seçme
    document.execCommand('copy');

    const emoji = document.createElement('span');
    emoji.textContent = '🎉 Link kopyalandı!';
    emoji.style.color = '#4CAF50';
    emoji.style.fontSize = '14px';
    emoji.style.marginLeft = '10px';
    document.getElementById('referral-container').appendChild(emoji);

    setTimeout(() => emoji.remove(), 2000);

    showNotification("Link başarıyla kopyalandı!");
});
