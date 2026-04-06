/**
 * Happy Birthday - Enhanced Script
 * Redesigned for modern UI/UX with vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loader = document.getElementById('loader');
    const startBtn = document.getElementById('start-btn');
    const mainContent = document.getElementById('main-content');
    const displayName = document.getElementById('display-name');
    const musicToggle = document.getElementById('music-toggle');
    const replayBtn = document.getElementById('replay-btn');
    const birthdaySong = document.getElementById('birthday-song');
    const balloonContainer = document.getElementById('balloon-container');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const shareSection = document.getElementById('share-section');
    const toast = document.getElementById('toast');
    const nameModal = document.getElementById('name-modal');
    const nameInput = document.getElementById('name-input');
    const saveNameBtn = document.getElementById('save-name-btn');

    // --- State ---
    let isMusicPlaying = false;
    let typedInstance = null;
    let name = 'Friend';

    // --- Initialization ---
    const init = () => {
        // 1. Get name from URL
        const urlParams = new URLSearchParams(window.location.search);
        const nameParam = urlParams.get('name');

        if (nameParam) {
            name = nameParam;
            displayName.textContent = name;
        } else {
            // Show name input modal if no name in URL
            nameModal.classList.remove('hidden');
        }

        // 2. Setup Snow
        initSnow();
    };

    // --- Event Listeners ---
    startBtn.addEventListener('click', () => {
        startCelebration();
    });

    musicToggle.addEventListener('click', toggleMusic);

    replayBtn.addEventListener('click', () => {
        if (typedInstance) {
            typedInstance.reset();
        }
    });

    saveNameBtn.addEventListener('click', () => {
        const inputVal = nameInput.value.trim();
        if (inputVal) {
            name = inputVal;
            displayName.textContent = name;
            // Update URL without reloading
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?name=' + encodeURIComponent(name);
            window.history.pushState({ path: newUrl }, '', newUrl);
            nameModal.classList.add('hidden');
        }
    });

    copyLinkBtn.addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast();
        });
    });

    // --- Core Functions ---
    const startCelebration = () => {
        // Fade out loader
        loader.classList.add('fade-out');
        
        // Show main content
        mainContent.classList.remove('hidden');
        mainContent.style.opacity = '0';
        setTimeout(() => {
            mainContent.style.opacity = '1';
        }, 100);

        // Start Music
        playMusic();

        // Start Confetti
        initConfetti();

        // Start Typing
        startTyping();

        // Animate Balloons
        animateBalloons();
    };

    const playMusic = () => {
        birthdaySong.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(err => console.log("Audio play blocked by browser", err));
    };

    const toggleMusic = () => {
        if (isMusicPlaying) {
            birthdaySong.pause();
            isMusicPlaying = false;
        } else {
            birthdaySong.play();
            isMusicPlaying = true;
        }
        updateMusicIcon();
    };

    const updateMusicIcon = () => {
        const icon = musicToggle.querySelector('i');
        if (isMusicPlaying) {
            icon.className = 'fas fa-volume-up';
        } else {
            icon.className = 'fas fa-volume-mute';
        }
    };

    const startTyping = () => {
        typedInstance = new Typed('#typed-text', {
            stringsElement: '#typed-strings',
            typeSpeed: 50,
            backSpeed: 20,
            backDelay: 2000,
            loop: false,
            onComplete: () => {
                // Show share section after typing finishes
                shareSection.classList.remove('hidden');
                setTimeout(() => {
                    shareSection.style.opacity = '1';
                }, 100);
            }
        });
    };

    const animateBalloons = () => {
        // Simple CSS-based upward movement
        balloonContainer.style.transform = 'translateY(-1000px)';
    };

    const showToast = () => {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    };

    // --- Canvas Snow (Lightweight) ---
    const initSnow = () => {
        const canvas = document.getElementById('snow-canvas');
        const ctx = canvas.getContext('2d');
        let width, height, particles;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        particles = Array.from({ length: 30 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 4 + 1,
            d: Math.random() * 1,
            v: Math.random() * 1 + 0.5
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            particles.forEach(p => {
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            });
            ctx.fill();
            update();
            requestAnimationFrame(draw);
        };

        const update = () => {
            particles.forEach(p => {
                p.y += p.v;
                p.x += Math.sin(p.d) * 1;
                if (p.y > height) {
                    p.y = -10;
                    p.x = Math.random() * width;
                }
            });
        };

        draw();
    };

    // --- Canvas Confetti (Simplified) ---
    const initConfetti = () => {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        let width, height, pieces = [];
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 100; i++) {
            pieces.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            pieces.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                
                p.y += p.speed;
                p.rotation += p.rotationSpeed;
                
                if (p.y > height) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
            });
            requestAnimationFrame(draw);
        };

        draw();
    };

    init();
});
