/* ============================================
   GLOBAL VARIABLES & INITIALIZATION
   ============================================ */

// Canvas and drawing context
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

// Drawing state variables
let isDrawing = false;
let currentTool = 'pen';
let currentColor = 'black';
let lastX = 0;
let lastY = 0;

// Game state
let currentPhase = 'character-creation'; // Initial phase
let gameData = {
    drawing: null,
    description: '',
    environment: '',
    action: '',
    categorization: ''
};

/* ============================================
   CANVAS SETUP & INITIALIZATION
   ============================================ */

/**
 * Initialize the canvas with proper settings
 */
function initializeCanvas() {
    // Set canvas size to match container (responsive)
    const container = canvas.parentElement;
    canvas.width = Math.min(800, container.clientWidth - 40);
    canvas.height = 500;
    
    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentColor;
    
    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Get mouse/touch coordinates relative to canvas
 */
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
        // Touch event
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    } else {
        // Mouse event
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
}

/* ============================================
   DRAWING FUNCTIONS
   ============================================ */

/**
 * Start drawing on the canvas
 */
function startDrawing(e) {
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

/**
 * Draw on the canvas
 */
function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault(); // Prevent scrolling on touch devices
    
    const coords = getCoordinates(e);
    const currentX = coords.x;
    const currentY = coords.y;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    
    if (currentTool === 'eraser') {
        // Eraser mode: use white color and larger size
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        // Pen mode: use selected color
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3;
    }
    
    ctx.stroke();
    ctx.closePath();
    
    lastX = currentX;
    lastY = currentY;
}

/**
 * Stop drawing
 */
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        // Save drawing state for game data
        saveDrawingState();
    }
}

/**
 * Save the current drawing as image data
 */
function saveDrawingState() {
    gameData.drawing = canvas.toDataURL('image/png');
}

/**
 * Clear the entire canvas
 */
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveDrawingState();
    }
}

/* ============================================
   TOOL SELECTION FUNCTIONS
   ============================================ */

/**
 * Set the active drawing tool
 */
function setTool(tool, color = null) {
    currentTool = tool;
    
    // Update button states
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate the selected tool button
    const activeBtn = document.querySelector(`[data-tool="${tool}"]${color ? `[data-color="${color}"]` : ''}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update drawing context based on tool
    if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 3;
        if (color) {
            currentColor = color;
            ctx.strokeStyle = color;
        }
    }
}

/* ============================================
   CHARACTER DESCRIPTION FUNCTIONS
   ============================================ */

/**
 * Save character description data
 */
function saveDescriptionData() {
    gameData.description = document.getElementById('characterDescription').value;
    gameData.environment = document.getElementById('environmentTag').value;
    gameData.action = document.getElementById('actionTag').value;
    gameData.categorization = document.getElementById('categorizationTag').value;
}

/**
 * Load character description data (for editing)
 */
function loadDescriptionData() {
    document.getElementById('characterDescription').value = gameData.description || '';
    document.getElementById('environmentTag').value = gameData.environment || '';
    document.getElementById('actionTag').value = gameData.action || '';
    document.getElementById('categorizationTag').value = gameData.categorization || '';
}

/* ============================================
   GAME PHASE MANAGEMENT
   ============================================ */

/**
 * Display a game phase (modal overlay)
 */
function showGamePhase(title, description, showNextButton = false) {
    const phaseElement = document.getElementById('gamePhase');
    const phaseTitle = document.getElementById('phaseTitle');
    const phaseDescription = document.getElementById('phaseDescription');
    const nextBtn = document.getElementById('nextPhaseBtn');
    
    phaseTitle.textContent = title;
    phaseDescription.textContent = description;
    nextBtn.style.display = showNextButton ? 'block' : 'none';
    phaseElement.style.display = 'flex';
}

/**
 * Hide the game phase modal
 */
function hideGamePhase() {
    document.getElementById('gamePhase').style.display = 'none';
}

/**
 * Process the "Done" button click
 */
function processDoneButton() {
    // Save all current data
    saveDescriptionData();
    saveDrawingState();
    
    // Validate that user has provided some input
    if (!gameData.drawing || gameData.drawing === canvas.toDataURL('image/png')) {
        // Check if canvas is empty (all white)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const isEmpty = imageData.data.every((pixel, index) => {
            // Skip alpha channel, check if all pixels are white (255, 255, 255)
            return index % 4 === 3 || pixel === 255;
        });
        
        if (isEmpty) {
            alert('Please draw something on the whiteboard before proceeding.');
            return;
        }
    }
    
    if (!gameData.description.trim()) {
        alert('Please provide a character description before proceeding.');
        return;
    }
    
    // Show confirmation and next phase
    const categorizationText = document.getElementById('categorizationTag').selectedOptions[0]?.text || 'Not specified';
    const summary = `Character Summary:\n\n` +
                   `Identity: ${categorizationText}\n` +
                   `Environment: ${gameData.environment || 'Not specified'}\n` +
                   `Action: ${gameData.action || 'Not specified'}\n` +
                   `Description: ${gameData.description.substring(0, 100)}${gameData.description.length > 100 ? '...' : ''}\n\n` +
                   `Thank you for creating this character. This exercise helps build empathy and understanding.`;
    
    showGamePhase(
        'Character Created!',
        summary,
        true
    );
}

/**
 * Move to the next game phase
 */
function nextPhase() {
    // Proceed directly to Phase 2: persist current character and navigate
    hideGamePhase();
    console.log('Game data saved:', gameData);

    try {
        // Ensure latest data saved
        saveDrawingState();
        saveDescriptionData();

        // Read existing library from localStorage (shared key)
        const raw = localStorage.getItem('characterLibrary');
        const lib = raw ? JSON.parse(raw) : [];

        // Build character record
        const character = {
            id: Date.now(),
            name: gameData.categorization || 'Unnamed Character',
            categorization: gameData.categorization,
            environment: gameData.environment,
            action: gameData.action,
            description: gameData.description,
            drawing: gameData.drawing,
            journey: { gender: null, metrics: { dignity:100, survival:100, authenticity:100 }, choices: [] },
            timestamp: new Date().toISOString()
        };

        lib.push(character);
        localStorage.setItem('characterLibrary', JSON.stringify(lib));
    } catch (e) {
        console.warn('Failed to persist character before Phase 2 navigation', e);
    }

    // Navigate to the separate Phase 2 page
    window.location.href = 'new-phase-2.html';
}

/**
 * Reset the game to initial state
 */
function resetGame() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear form fields
    document.getElementById('characterDescription').value = '';
    document.getElementById('environmentTag').value = '';
    document.getElementById('actionTag').value = '';
    document.getElementById('categorizationTag').value = '';
    
    // Reset game data
    gameData = {
        drawing: null,
        description: '',
        environment: '',
        action: '',
        categorization: ''
    };
    
    // Reset tool to default
    setTool('pen', 'black');
}

/* ============================================
   EVENT LISTENERS SETUP
   ============================================ */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Canvas drawing events (mouse)
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Canvas drawing events (touch for mobile)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    // Tool button events
    document.querySelectorAll('.pen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            setTool('pen', color);
        });
    });
    
    document.querySelectorAll('.eraser-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTool('eraser');
        });
    });
    
    // Clear canvas button
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    
    // Done button
    document.getElementById('doneButton').addEventListener('click', processDoneButton);
    
    // Next phase button
    document.getElementById('nextPhaseBtn').addEventListener('click', nextPhase);
    
    // Auto-save description data as user types
    document.getElementById('characterDescription').addEventListener('input', saveDescriptionData);
    document.getElementById('environmentTag').addEventListener('input', saveDescriptionData);
    document.getElementById('actionTag').addEventListener('input', saveDescriptionData);
    document.getElementById('categorizationTag').addEventListener('change', saveDescriptionData);
    
    // Handle window resize to maintain canvas aspect ratio
    window.addEventListener('resize', () => {
        initializeCanvas();
        // Optionally reload drawing if saved
        if (gameData.drawing) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
            img.src = gameData.drawing;
        }
    });
}

/* ============================================
   GAME INITIALIZATION
   ============================================ */

/**
 * Initialize the entire game
 */
function initializeGame() {
    initializeCanvas();
    initializeEventListeners();
    setTool('pen', 'black'); // Set default tool
    
    console.log('Interactive Narrative Game initialized');
    console.log('This game explores transgender and gender non-conforming experiences');
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);

