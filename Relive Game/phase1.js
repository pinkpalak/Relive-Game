/* ============================================
   GLOBAL VARIABLES & INITIALIZATION
   ============================================ */

// Canvas and drawing context
const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');

// Game state - stores player's choices
let playerChoices = [];

// Currently selected element type
let selectedElementType = null;

// Placed elements on canvas (for drag and drop)
let placedElements = [];
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// Element types available for placement (minimalist icons)
const elementTypes = [
    { id: 'person', icon: '👤', label: 'Person', color: '#8AB9B5' },
    { id: 'heart', icon: '❤️', label: 'Heart', color: '#8AB9B5' },
    { id: 'star', icon: '⭐', label: 'Star', color: '#8AB9B5' },
    { id: 'lightbulb', icon: '💡', label: 'Idea', color: '#8AB9B5' },
    { id: 'rainbow', icon: '🌈', label: 'Rainbow', color: '#8AB9B5' },
    { id: 'shield', icon: '🛡️', label: 'Strength', color: '#8AB9B5' },
    { id: 'butterfly', icon: '🦋', label: 'Transformation', color: '#8AB9B5' },
    { id: 'sun', icon: '☀️', label: 'Light', color: '#8AB9B5' },
    { id: 'moon', icon: '🌙', label: 'Night', color: '#8AB9B5' },
    { id: 'flower', icon: '🌸', label: 'Growth', color: '#8AB9B5' },
    { id: 'tree', icon: '🌳', label: 'Nature', color: '#8AB9B5' },
    { id: 'book', icon: '📖', label: 'Knowledge', color: '#8AB9B5' }
];

/* ============================================
   CANVAS INITIALIZATION
   ============================================ */

/**
 * Initialize the canvas with cream white background and dotted grid
 */
function initializeCanvas() {
    // Set canvas size (responsive)
    const container = canvas.parentElement;
    const maxWidth = Math.min(1200, container.clientWidth - 40);
    const aspectRatio = 1200 / 800;
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
    
    // Draw cream white background
    ctx.fillStyle = '#fef9e7'; // Cream white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw dotted grid pattern
    drawDottedGrid();
}

/**
 * Draw dotted grid pattern on canvas
 */
function drawDottedGrid() {
    ctx.fillStyle = '#8AB9B5'; // Primary color for dots
    const spacing = 20;
    const dotSize = 1.5;
    
    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * Redraw the entire canvas (background + placed elements)
 */
function redrawCanvas() {
    // Clear and redraw background
    ctx.fillStyle = '#fef9e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawDottedGrid();
    
    // Redraw all placed elements
    placedElements.forEach(element => {
        drawElementOnCanvas(element);
    });
}

/**
 * Draw an element on the canvas
 */
function drawElementOnCanvas(element) {
    const { x, y, type, id } = element;
    const elementData = elementTypes.find(e => e.id === type);
    
    if (!elementData) return;
    
    // Draw element background circle/rectangle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#8AB9B5';
    ctx.lineWidth = 2;
    
    // Draw rounded rectangle background
    const size = 60;
    const radius = 8;
    const centerX = x;
    const centerY = y;
    const xPos = centerX - size/2;
    const yPos = centerY - size/2;
    
    // Draw rounded rectangle manually for compatibility
    ctx.beginPath();
    ctx.moveTo(xPos + radius, yPos);
    ctx.lineTo(xPos + size - radius, yPos);
    ctx.quadraticCurveTo(xPos + size, yPos, xPos + size, yPos + radius);
    ctx.lineTo(xPos + size, yPos + size - radius);
    ctx.quadraticCurveTo(xPos + size, yPos + size, xPos + size - radius, yPos + size);
    ctx.lineTo(xPos + radius, yPos + size);
    ctx.quadraticCurveTo(xPos, yPos + size, xPos, yPos + size - radius);
    ctx.lineTo(xPos, yPos + radius);
    ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw icon (using emoji - for actual implementation, you might use SVG or images)
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(elementData.icon, centerX, centerY);
}

/* ============================================
   ELEMENT SELECTION & PLACEMENT
   ============================================ */

/**
 * Create and populate the elements grid
 */
function createElementsGrid() {
    const grid = document.getElementById('elementsGrid');
    grid.innerHTML = '';
    
    elementTypes.forEach(elementType => {
        const elementItem = document.createElement('div');
        elementItem.className = 'element-item';
        elementItem.dataset.elementId = elementType.id;
        
        const icon = document.createElement('span');
        icon.className = 'element-icon';
        icon.textContent = elementType.icon;
        
        const label = document.createElement('span');
        label.className = 'element-label';
        label.textContent = elementType.label;
        
        elementItem.appendChild(icon);
        elementItem.appendChild(label);
        
        // Click to select element
        elementItem.addEventListener('click', () => {
            selectElement(elementType.id);
        });
        
        grid.appendChild(elementItem);
    });
}

/**
 * Select an element type for placement
 */
function selectElement(elementId) {
    selectedElementType = elementId;
    
    // Update UI to show selected element
    document.querySelectorAll('.element-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-element-id="${elementId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // Change cursor on canvas
    canvas.style.cursor = 'crosshair';
}

/**
 * Get mouse/touch coordinates relative to canvas
 */
function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    } else {
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
}

/**
 * Place an element on the canvas at the given coordinates
 */
function placeElement(x, y, elementType) {
    if (!elementType) return;
    
    const element = {
        id: Date.now() + Math.random(), // Unique ID
        type: elementType,
        x: x,
        y: y
    };
    
    placedElements.push(element);
    
    // Add to player choices array
    playerChoices.push({
        elementId: element.id,
        elementType: elementType,
        position: { x: x, y: y },
        timestamp: new Date().toISOString()
    });
    
    redrawCanvas();
    console.log('Player choices:', playerChoices);
}

/**
 * Check if click is on a placed element (for dragging)
 */
function getElementAtPosition(x, y) {
    const size = 60;
    for (let i = placedElements.length - 1; i >= 0; i--) {
        const element = placedElements[i];
        const dx = x - element.x;
        const dy = y - element.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= size / 2) {
            return element;
        }
    }
    return null;
}

/**
 * Remove an element from the canvas
 */
function removeElement(elementId) {
    placedElements = placedElements.filter(el => el.id !== elementId);
    playerChoices = playerChoices.filter(choice => choice.elementId !== elementId);
    redrawCanvas();
    console.log('Player choices after removal:', playerChoices);
}

/* ============================================
   CANVAS INTERACTION HANDLERS
   ============================================ */

/**
 * Handle mouse/touch down on canvas
 */
function handleCanvasDown(e) {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    
    // Check if clicking on existing element (for dragging)
    const element = getElementAtPosition(coords.x, coords.y);
    
    if (element) {
        // Start dragging
        draggedElement = element;
        dragOffset.x = coords.x - element.x;
        dragOffset.y = coords.y - element.y;
        canvas.style.cursor = 'move';
    } else if (selectedElementType) {
        // Place new element
        placeElement(coords.x, coords.y, selectedElementType);
    }
}

/**
 * Handle mouse/touch move on canvas
 */
function handleCanvasMove(e) {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    
    if (draggedElement) {
        // Update element position
        draggedElement.x = coords.x - dragOffset.x;
        draggedElement.y = coords.y - dragOffset.y;
        
        // Update player choices
        const choice = playerChoices.find(c => c.elementId === draggedElement.id);
        if (choice) {
            choice.position = { x: draggedElement.x, y: draggedElement.y };
        }
        
        redrawCanvas();
    } else {
        // Check if hovering over element
        const element = getElementAtPosition(coords.x, coords.y);
        canvas.style.cursor = element ? 'move' : (selectedElementType ? 'crosshair' : 'default');
    }
}

/**
 * Handle mouse/touch up on canvas
 */
function handleCanvasUp(e) {
    e.preventDefault();
    
    if (draggedElement) {
        draggedElement = null;
        dragOffset = { x: 0, y: 0 };
        canvas.style.cursor = selectedElementType ? 'crosshair' : 'default';
    }
}

/* ============================================
   BUTTON HANDLERS
   ============================================ */

/**
 * Clear the whiteboard
 */
function clearWhiteboard() {
    if (confirm('Are you sure you want to clear the whiteboard? All placed elements will be removed.')) {
        placedElements = [];
        playerChoices = [];
        redrawCanvas();
        console.log('Whiteboard cleared. Player choices reset.');
    }
}

/**
 * Continue to next phase
 */
function continueToNextPhase() {
    if (playerChoices.length === 0) {
        alert('Please place at least one element on the whiteboard before continuing.');
        return;
    }
    
    // Log final player choices
    console.log('Final player choices:', playerChoices);
    console.log('Total elements placed:', playerChoices.length);
    
    // Store choices in localStorage for use in other phases
    localStorage.setItem('phase1Choices', JSON.stringify(playerChoices));
    
    // Show confirmation
    alert(`You have placed ${playerChoices.length} element(s) on the whiteboard.\n\nYour choices have been saved.`);
    
    // Here you would navigate to the next phase
    // For now, we'll just log the data
    console.log('Ready to proceed to next phase with choices:', playerChoices);
}

/* ============================================
   EVENT LISTENERS SETUP
   ============================================ */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Canvas mouse events
    canvas.addEventListener('mousedown', handleCanvasDown);
    canvas.addEventListener('mousemove', handleCanvasMove);
    canvas.addEventListener('mouseup', handleCanvasUp);
    canvas.addEventListener('mouseleave', handleCanvasUp);
    
    // Canvas touch events (for mobile)
    canvas.addEventListener('touchstart', handleCanvasDown);
    canvas.addEventListener('touchmove', handleCanvasMove);
    canvas.addEventListener('touchend', handleCanvasUp);
    canvas.addEventListener('touchcancel', handleCanvasUp);
    
    // Button events
    document.getElementById('clearWhiteboard').addEventListener('click', clearWhiteboard);
    document.getElementById('continueBtn').addEventListener('click', continueToNextPhase);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        initializeCanvas();
        redrawCanvas();
    });
}

/* ============================================
   GAME INITIALIZATION
   ============================================ */

/**
 * Initialize Phase 1 of the game
 */
function initializePhase1() {
    // Initialize canvas
    initializeCanvas();
    
    // Create elements grid
    createElementsGrid();
    
    // Set up event listeners
    initializeEventListeners();
    
    console.log('Phase 1: Character Visualization initialized');
    console.log('Available elements:', elementTypes.map(e => e.label).join(', '));
}

// Start Phase 1 when the page loads
document.addEventListener('DOMContentLoaded', initializePhase1);

