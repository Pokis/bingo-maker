// Simple Seeded PRNG (Mulberry32)
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

// Global State
let currentState = {
    theme: '',
    seed: '',
    crossed: [],
    customBg: '',
    hasWon: false
};

// DOM Elements
const themeSelect = document.getElementById('themeSelect');
const seedInput = document.getElementById('seedInput');
const randomSeedBtn = document.getElementById('randomSeedBtn');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const bgUpload = document.getElementById('bgUpload');
const bingoBoard = document.getElementById('bingoBoard');

const celebrationOverlay = document.getElementById('celebrationOverlay');
const continueBtn = document.getElementById('continueBtn');

const themeModal = document.getElementById('themeModal');
const openThemeCreatorBtn = document.getElementById('openThemeCreatorBtn');
const closeThemeModalBtn = document.getElementById('closeThemeModalBtn');
const exportThemeBtn = document.getElementById('exportThemeBtn');

// Initialization
function init() {
    // Populate themes
    const themes = window.BINGO_THEMES || {};
    const themeNames = Object.keys(themes);
    if (themeNames.length === 0) {
        alert("No themes found. Please ensure theme files are loaded.");
        return;
    }

    themeNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        themeSelect.appendChild(option);
    });

    // Load state from localStorage
    const savedState = localStorage.getItem('bingoState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            currentState = { ...currentState, ...parsed };
        } catch (e) {
            console.error("Failed to parse saved state");
        }
    }

    // Set UI from state or defaults
    themeSelect.value = currentState.theme || themeNames[0];
    seedInput.value = currentState.seed || generateRandomSeed();
    
    if (currentState.customBg) {
        document.body.style.backgroundImage = `url(${currentState.customBg})`;
    }

    generateBoard();
}

function saveState() {
    localStorage.setItem('bingoState', JSON.stringify(currentState));
}

function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Board Generation
function generateBoard() {
    currentState.theme = themeSelect.value;
    currentState.seed = seedInput.value;
    
    // Only clear crossed cells if we are generating a brand new board (different seed/theme)
    // Actually, clicking 'Generate' means fresh board. 
    // We will check if the user just clicked generate vs page load.
    // For simplicity, we just rebuild the DOM. Hydration of crossed state happens in render.

    const themeEntries = window.BINGO_THEMES[currentState.theme];
    if (!themeEntries || themeEntries.length < 24) {
        alert("Selected theme must have at least 24 entries.");
        return;
    }

    // Seed the PRNG
    const seed = xmur3(currentState.seed)();
    const prng = mulberry32(seed);

    // Shuffle a copy of the theme entries
    const shuffled = [...themeEntries];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedEntries = shuffled.slice(0, 24);
    
    // Insert FREE space at index 12
    selectedEntries.splice(12, 0, "FREE");

    renderBoard(selectedEntries);
    saveState();
}

function renderBoard(entries) {
    bingoBoard.innerHTML = '';
    
    entries.forEach((entry, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.textContent = entry;
        cell.dataset.index = index;

        if (entry === "FREE") {
            cell.classList.add('free-space');
            // FREE space is technically automatically crossed, let's treat it as crossed visually if needed
            // Actually, we'll let users cross it themselves or auto-cross it. Let's auto cross it.
            if (!currentState.crossed.includes(index)) {
                currentState.crossed.push(index);
            }
        }

        if (currentState.crossed.includes(index)) {
            cell.classList.add('crossed');
        }

        cell.addEventListener('click', () => handleCellClick(cell, index));
        bingoBoard.appendChild(cell);
    });

    checkWinState();
}

function handleCellClick(cell, index) {
    if (cell.classList.contains('crossed')) {
        cell.classList.remove('crossed');
        currentState.crossed = currentState.crossed.filter(i => i !== index);
    } else {
        cell.classList.add('crossed');
        currentState.crossed.push(index);
    }
    
    saveState();
    checkWinState();
}

// Win Logic
function checkWinState() {
    const crossed = new Set(currentState.crossed);
    
    // 5x5 Grid indices:
    // 0  1  2  3  4
    // 5  6  7  8  9
    // 10 11 12 13 14
    // 15 16 17 18 19
    // 20 21 22 23 24

    const winPatterns = [
        // Rows
        [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
        // Cols
        [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
        // Diagonals
        [0,6,12,18,24], [4,8,12,16,20]
    ];

    let hasBingo = false;
    for (let pattern of winPatterns) {
        if (pattern.every(idx => crossed.has(idx))) {
            hasBingo = true;
            break;
        }
    }

    if (hasBingo && !currentState.hasWon) {
        triggerCelebration();
        currentState.hasWon = true;
        saveState();
    } else if (!hasBingo) {
        // If they uncross a cell and lose bingo, we reset the flag so they can win again
        currentState.hasWon = false;
        saveState();
    }
}

function triggerCelebration() {
    celebrationOverlay.classList.add('active');
}

continueBtn.addEventListener('click', () => {
    celebrationOverlay.classList.remove('active');
});

// Controls Events
randomSeedBtn.addEventListener('click', () => {
    seedInput.value = generateRandomSeed();
    generateBtn.click();
});

generateBtn.addEventListener('click', () => {
    // When manually generating a new board, clear the crossed state
    currentState.crossed = [];
    currentState.hasWon = false;
    generateBoard();
});

printBtn.addEventListener('click', () => {
    window.print();
});

bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            currentState.customBg = dataUrl;
            document.body.style.backgroundImage = `url(${dataUrl})`;
            saveState();
        };
        reader.readAsDataURL(file);
    }
});

// Theme Creator Logic
openThemeCreatorBtn.addEventListener('click', () => {
    themeModal.classList.add('active');
});

closeThemeModalBtn.addEventListener('click', () => {
    themeModal.classList.remove('active');
});

exportThemeBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('newThemeName').value.trim();
    const entriesInput = document.getElementById('newThemeEntries').value;
    
    if (!nameInput) {
        alert('Please enter a theme name.');
        return;
    }

    const entries = entriesInput.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (entries.length < 24) {
        alert(`You need at least 24 entries. You currently have ${entries.length}.`);
        return;
    }

    const jsContent = `window.BINGO_THEMES = window.BINGO_THEMES || {};\nwindow.BINGO_THEMES["${nameInput}"] = ${JSON.stringify(entries, null, 4)};`;
    
    const blob = new Blob([jsContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    // Format filename (lowercase, replace spaces with hyphens)
    const fileName = nameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.js';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    themeModal.classList.remove('active');
    alert(`Downloaded ${fileName}. Place it in the 'themes' folder and add a <script> tag for it in index.html to use it!`);
});

// Start
init();
