/* ============================================
   MULTI-PHASE GAME - COMBINED SCRIPT
   ============================================ */

// Global game state
let gameState = {
    currentPhase: 'characterCreation',
    characterData: {
        name: '',
        drawing: null,
        description: '',
        environment: '',
        action: '',
        categorization: ''
    },
    phase2Data: {
        gender: null,
        scenarioIndex: 0,
        metrics: { dignity: 100, survival: 100, authenticity: 100 },
        choices: [],
        inaccessibleScenarios: [] // Track scenarios blocked by barriers
    },
    savedCharacters: [] // Character library
};

// Load saved characters from localStorage
function loadCharacterLibrary() {
    try {
        const saved = localStorage.getItem('characterLibrary');
        if (saved) {
            gameState.savedCharacters = JSON.parse(saved);
        }
    } catch (err) {
        console.warn('Failed to load character library', err);
    }
}

// Save current character to library
function saveCharacterToLibrary() {
    const character = {
        id: Date.now(),
        name: gameState.characterData.name || 'Unnamed Character',
        categorization: gameState.characterData.categorization,
        environment: gameState.characterData.environment,
        action: gameState.characterData.action,
        description: gameState.characterData.description,
        journey: {
            gender: gameState.phase2Data.gender,
            metrics: { ...gameState.phase2Data.metrics },
            choices: gameState.phase2Data.choices
        },
        timestamp: new Date().toISOString()
    };
    
    gameState.savedCharacters.push(character);
    localStorage.setItem('characterLibrary', JSON.stringify(gameState.savedCharacters));
}

// Render character library UI
function renderCharacterLibrary() {
    const grid = document.getElementById('libraryGrid');
    const empty = document.getElementById('emptyLibrary');
    
    if (gameState.savedCharacters.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = '';
    
    gameState.savedCharacters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-name">${escapeHtml(character.name)}</h3>
                <span class="card-identity">${character.categorization}</span>
            </div>
            <div class="card-details">
                <p><strong>Environment:</strong> ${escapeHtml(character.environment)}</p>
                <p><strong>Action:</strong> ${escapeHtml(character.action)}</p>
            </div>
            <div class="card-metrics">
                <span class="metric-badge">Dignity: ${Math.round(character.journey.metrics.dignity)}%</span>
                <span class="metric-badge">Survival: ${Math.round(character.journey.metrics.survival)}%</span>
                <span class="metric-badge">Authenticity: ${Math.round(character.journey.metrics.authenticity)}%</span>
            </div>
            <button class="view-journey-btn" onclick="viewCharacterJourney(${character.id})">
                View Journey Map
            </button>
        `;
        grid.appendChild(card);
    });
}

function viewCharacterJourney(characterId) {
    // View saved character's journey (future enhancement)
    alert('Journey viewer coming soon!');
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* ============================================
   PHASE NAVIGATION
   ============================================ */
function goToPhase(phaseName) {
    console.log('goToPhase called with:', phaseName);
    // Hide all phases
    document.querySelectorAll('.phase-container').forEach(phase => {
        phase.classList.remove('active');
    });
    
    // Show requested phase
    // Try the provided name, and also accept kebab-case or camelCase variants
    function kebabToCamel(s) {
        return s.split('-').map((part, idx) => idx === 0 ? part : (part.charAt(0).toUpperCase() + part.slice(1))).join('');
    }

    const candidates = [phaseName, kebabToCamel(phaseName)];
    let found = null;
    for (const name of candidates) {
        const el = document.getElementById(name + 'Phase');
        if (el) { found = { name, el }; break; }
    }

    if (found) {
        found.el.classList.add('active');
        gameState.currentPhase = found.name;
        console.log('Activated phase element:', found.el.id);

        // Initialize phase-specific code using the canonical (camel-case) name
        const canonical = found.name;
        if (canonical === 'characterCreation' || canonical === 'character-creation') {
            initCharacterCreation();
        } else if (canonical === 'phase1') {
            initPhase1();
        } else if (canonical === 'phase2') {
            initPhase2();
        } else if (canonical === 'phase3') {
            initPhase3();
        } else if (canonical === 'menu') {
            // nothing to init for menu
        }
    }
}

/* ============================================
   CHARACTER CREATION PHASE
   ============================================ */

// Canvas state
let charCreationCanvas = null;
let charCreationCtx = null;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = 'black';
let lastX = 0;
let lastY = 0;

function initCharacterCreation() {
    charCreationCanvas = document.getElementById('whiteboard');
    if (!charCreationCanvas) return;
    
    charCreationCtx = charCreationCanvas.getContext('2d');
    setupCharacterCanvas();
    attachCharacterCanvasListeners();
}

function setupCharacterCanvas() {
    charCreationCanvas.width = Math.min(800, charCreationCanvas.parentElement.clientWidth - 40);
    charCreationCanvas.height = 500;
    
    charCreationCtx.lineCap = 'round';
    charCreationCtx.lineJoin = 'round';
    charCreationCtx.lineWidth = 3;
    charCreationCtx.strokeStyle = currentColor;
    
    charCreationCtx.fillStyle = 'white';
    charCreationCtx.fillRect(0, 0, charCreationCanvas.width, charCreationCanvas.height);
}

function attachCharacterCanvasListeners() {
    charCreationCanvas.addEventListener('mousedown', startCharacterDrawing);
    charCreationCanvas.addEventListener('mousemove', drawCharacter);
    charCreationCanvas.addEventListener('mouseup', stopCharacterDrawing);
    charCreationCanvas.addEventListener('mouseout', stopCharacterDrawing);
    
    charCreationCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startCharacterDrawing(e);
    });
    charCreationCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        drawCharacter(e);
    });
    charCreationCanvas.addEventListener('touchend', stopCharacterDrawing);
}

function getCharCoordinates(e) {
    const rect = charCreationCanvas.getBoundingClientRect();
    const scaleX = charCreationCanvas.width / rect.width;
    const scaleY = charCreationCanvas.height / rect.height;
    
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

function startCharacterDrawing(e) {
    isDrawing = true;
    const coords = getCharCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

function drawCharacter(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCharCoordinates(e);
    const currentX = coords.x;
    const currentY = coords.y;
    
    charCreationCtx.beginPath();
    charCreationCtx.moveTo(lastX, lastY);
    charCreationCtx.lineTo(currentX, currentY);
    
    if (currentTool === 'eraser') {
        charCreationCtx.globalCompositeOperation = 'destination-out';
        charCreationCtx.lineWidth = 20;
    } else {
        charCreationCtx.globalCompositeOperation = 'source-over';
        charCreationCtx.strokeStyle = currentColor;
        charCreationCtx.lineWidth = 3;
    }
    
    charCreationCtx.stroke();
    lastX = currentX;
    lastY = currentY;
}

function stopCharacterDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveCharacterDrawing();
    }
}

function setTool(tool, color = null) {
    currentTool = tool;
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-tool="${tool}"]${color ? `[data-color="${color}"]` : ''}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    if (tool === 'eraser') {
        charCreationCtx.globalCompositeOperation = 'destination-out';
        charCreationCtx.lineWidth = 20;
    } else {
        charCreationCtx.globalCompositeOperation = 'source-over';
        charCreationCtx.lineWidth = 3;
        if (color) {
            currentColor = color;
            charCreationCtx.strokeStyle = color;
        }
    }
}

function clearCanvas() {
    if (confirm('Clear the canvas?')) {
        charCreationCtx.fillStyle = 'white';
        charCreationCtx.fillRect(0, 0, charCreationCanvas.width, charCreationCanvas.height);
        saveCharacterDrawing();
    }
}

function saveCharacterDrawing() {
    gameState.characterData.drawing = charCreationCanvas.toDataURL('image/png');
}

function saveCharacterDescription() {
    gameState.characterData.description = document.getElementById('characterDescription').value;
    gameState.characterData.environment = document.getElementById('environmentTag').value;
    gameState.characterData.action = document.getElementById('actionTag').value;
    gameState.characterData.categorization = document.getElementById('categorizationTag').value;
}

function completeCharacterCreation() {
    saveCharacterDescription();
    saveCharacterDrawing();
    
    // Save character name
    gameState.characterData.name = document.getElementById('characterName').value;
    
    // Validate
    if (!gameState.characterData.drawing || gameState.characterData.drawing === charCreationCanvas.toDataURL('image/png')) {
        const imageData = charCreationCtx.getImageData(0, 0, charCreationCanvas.width, charCreationCanvas.height);
        const isEmpty = imageData.data.every((pixel, index) => {
            return index % 4 === 3 || pixel === 255;
        });
        
        if (isEmpty) {
            alert('Please draw something first.');
            return;
        }
    }
    
    if (!gameState.characterData.description.trim()) {
        alert('Please provide a description.');
        return;
    }

    // Auto-assign gender based on categorization (gender selection removed)
    try {
        const cat = (gameState.characterData.categorization || '').toString().toLowerCase();
        const map = {
            'trans-man': 'male',
            'trans-woman': 'female',
            'nonbinary': 'nonbinary',
            'intersex': 'nonbinary',
            'gender-nonconforming': 'nonbinary'
        };
        assignedGender = map[cat] || 'nonbinary';
    } catch (e) {
        assignedGender = 'nonbinary';
    }

    // Auto-save current character so the Phase 2 page can access it,
    // then navigate to the separate Phase 2 page (new phase 2 html).
    try {
        // Ensure latest drawing/description are stored
        saveCharacterDrawing();
        saveCharacterDescription();
        // Save to library (so new page can read from localStorage)
        saveCharacterToLibrary();
    } catch (e) {
        console.warn('Failed to save character before navigating:', e);
    }

    // Navigate to the new Phase 2 page
    window.location.href = 'new-phase-2.html';
}

/* ============================================
   PHASE 2 - THE JOURNEY (Scenarios & Metrics)
   ============================================ */

let phase2Canvas = null;
let phase2Ctx = null;
let assignedGender = null;
let currentMetrics = { dignity: 100, survival: 100, authenticity: 100 };
let currentScenarioIndex = 0;
let characterPosition = { x: 0, y: 0, progress: 0 };
let isMoving = false;
let isScenarioActive = false;
let journeyMapOpen = false;

// Scenario canvas interaction state
let scenarioCanvas = null;
let scenarioCtx = null;
let scenarioPathObjects = [];
let scenarioMouseMoveHandler = null;
let scenarioClickHandler = null;

const pathColor = {
    female: '#D49D99',
    male: '#76AACD',
    nonbinary: '#8AB9B5'
};

// Scenarios with barriers (economic, systemic, caste-based)
const scenarios = [
    {
        title: "Workplace Harassment",
        text: "A coworker makes a transphobic joke. Everyone looks at you. How do you respond?",
        barriers: [], // No barriers; all options accessible
        choices: [
            { type: "FULL_AUTHENTICITY", text: "Speak up immediately", icon: "🗣️", consequences: { dignity: +15, survival: -20, authenticity: +20 } },
            { type: "BALANCED_EXPRESSION", text: "Address it privately later", icon: "⚖️", consequences: { dignity: +5, survival: -5, authenticity: +5 } },
            { type: "CAUTIOUS_CONFORMITY", text: "Laugh along", icon: "😔", consequences: { dignity: -15, survival: +10, authenticity: -20 } },
            { type: "COMPLETE_CONFORMITY", text: "Leave silently", icon: "🚶", consequences: { dignity: -25, survival: +15, authenticity: -30 } }
        ]
    },
    {
        title: "Family Gathering",
        text: "Your grandmother repeatedly uses your deadname. Your parents do nothing.",
        barriers: ['economic'], // May be economically dependent
        barriers_text: "Economic constraints may limit your options here.",
        choices: [
            { type: "FULL_AUTHENTICITY", text: "Firmly correct her", icon: "🗣️", consequences: { dignity: +20, survival: -10, authenticity: +25 }, inaccessible: ['economic'] },
            { type: "BALANCED_EXPRESSION", text: "Pull her aside privately", icon: "⚖️", consequences: { dignity: +10, survival: 0, authenticity: +10 }, inaccessible: [] },
            { type: "CAUTIOUS_CONFORMITY", text: "Let it slide", icon: "😔", consequences: { dignity: -20, survival: +5, authenticity: -25 }, inaccessible: [] },
            { type: "COMPLETE_CONFORMITY", text: "Leave early", icon: "🚶", consequences: { dignity: -30, survival: +10, authenticity: -35 }, inaccessible: ['economic'] }
        ]
    },
    {
        title: "Public Bathroom",
        text: "Someone questions if you're in the 'right' bathroom. You need to use it urgently.",
        barriers: ['systemic'],
        barriers_text: "Systemic discrimination makes some options riskier.",
        choices: [
            { type: "FULL_AUTHENTICITY", text: "Assert your right", icon: "🗣️", consequences: { dignity: +25, survival: -25, authenticity: +30 }, inaccessible: ['systemic'] },
            { type: "BALANCED_EXPRESSION", text: "Calmly explain", icon: "⚖️", consequences: { dignity: +10, survival: -10, authenticity: +15 }, inaccessible: [] },
            { type: "CAUTIOUS_CONFORMITY", text: "Find another bathroom", icon: "😔", consequences: { dignity: -15, survival: +5, authenticity: -20 }, inaccessible: [] },
            { type: "COMPLETE_CONFORMITY", text: "Apologize and leave", icon: "🚶", consequences: { dignity: -30, survival: +10, authenticity: -35 }, inaccessible: [] }
        ]
    },
    {
        title: "Job Interview",
        text: "The interviewer notices your ID doesn't match and asks invasive questions.",
        barriers: ['systemic', 'economic'],
        barriers_text: "Systemic bias and economic need complicate your choices.",
        choices: [
            { type: "FULL_AUTHENTICITY", text: "Refuse and redirect", icon: "🗣️", consequences: { dignity: +20, survival: -30, authenticity: +25 }, inaccessible: ['systemic', 'economic'] },
            { type: "BALANCED_EXPRESSION", text: "Answer briefly, pivot", icon: "⚖️", consequences: { dignity: +5, survival: -10, authenticity: +10 }, inaccessible: [] },
            { type: "CAUTIOUS_CONFORMITY", text: "Answer to appear cooperative", icon: "😔", consequences: { dignity: -20, survival: +5, authenticity: -25 }, inaccessible: [] },
            { type: "COMPLETE_CONFORMITY", text: "Answer everything", icon: "🚶", consequences: { dignity: -35, survival: +15, authenticity: -40 }, inaccessible: [] }
        ]
    },
    {
        title: "Healthcare",
        text: "Your insurance denies hormone therapy coverage. Doctor suggests 'proving' identity.",
        barriers: ['economic'],
        barriers_text: "Economic hardship limits your medical options.",
        choices: [
            { type: "FULL_AUTHENTICITY", text: "File appeal", icon: "🗣️", consequences: { dignity: +25, survival: -20, authenticity: +30 }, inaccessible: ['economic'] },
            { type: "BALANCED_EXPRESSION", text: "Provide docs but challenge", icon: "⚖️", consequences: { dignity: +10, survival: -5, authenticity: +15 }, inaccessible: [] },
            { type: "CAUTIOUS_CONFORMITY", text: "Provide documentation", icon: "😔", consequences: { dignity: -15, survival: +10, authenticity: -20 }, inaccessible: [] },
            { type: "COMPLETE_CONFORMITY", text: "Pay out of pocket", icon: "🚶", consequences: { dignity: -25, survival: -10, authenticity: -30 }, inaccessible: ['economic'] }
        ]
    },
    {
        title: "Finding Community",
        text: "You discover a local LGBTQ+ support group. Attending means visibility.",
        barriers: [],
        choices: [
            { type: "FULL_AUTHENTICITY", text: "Attend openly", icon: "🗣️", consequences: { dignity: +30, survival: +10, authenticity: +40 }, inaccessible: [] },
            { type: "BALANCED_EXPRESSION", text: "Attend, stay reserved", icon: "⚖️", consequences: { dignity: +15, survival: +15, authenticity: +20 }, inaccessible: [] },
            { type: "CAUTIOUS_CONFORMITY", text: "Observe from sidelines", icon: "😔", consequences: { dignity: +5, survival: +20, authenticity: +5 }, inaccessible: [] },
            { type: "COMPLETE_CONFORMITY", text: "Don't attend", icon: "🚶", consequences: { dignity: -10, survival: +25, authenticity: -20 }, inaccessible: [] }
        ]
    }
];

function initPhase2() {
    // Auto-assign gender from categorization (gender-selection removed)
    try {
        const cat = (gameState.characterData.categorization || '').toString().toLowerCase();
        const map = {
            'trans-man': 'male',
            'trans-woman': 'female',
            'nonbinary': 'nonbinary',
            'intersex': 'nonbinary',
            'gender-nonconforming': 'nonbinary'
        };
        assignedGender = map[cat] || 'nonbinary';
    } catch (e) {
        assignedGender = 'nonbinary';
    }

    // Show the first scenario modal immediately (no path scene)
    currentScenarioIndex = 0;
    showScenario();
}

function resizePhase2Canvas() {
    phase2Canvas.width = window.innerWidth;
    phase2Canvas.height = window.innerHeight;
    if (assignedGender) {
        drawPhase2Path();
    }
}

function selectGender(gender) {
    // Gender selection UI removed. Keep helper to allow programmatic override if needed.
    assignedGender = gender;
    drawPhase2Path();
}

function drawPhase2Path() {
    phase2Ctx.clearRect(0, 0, phase2Canvas.width, phase2Canvas.height);
    
    const centerY = phase2Canvas.height * 0.6;
    const pathWidth = 80;
    const pathColorValue = pathColor[assignedGender] || '#8AB9B5';
    
    phase2Ctx.strokeStyle = pathColorValue;
    phase2Ctx.lineWidth = pathWidth;
    phase2Ctx.lineCap = 'round';
    phase2Ctx.lineJoin = 'round';
    
    phase2Ctx.beginPath();
    const startX = -100;
    const startY = centerY;
    phase2Ctx.moveTo(startX, startY);
    
    const segments = 20;
    const pathLength = phase2Canvas.width + 200;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = startX + (pathLength * t);
        const y = centerY + Math.sin(t * Math.PI * 4) * 100 + Math.cos(t * Math.PI * 2) * 50;
        
        if (i === 0) {
            phase2Ctx.moveTo(x, y);
        } else {
            phase2Ctx.lineTo(x, y);
        }
    }
    
    phase2Ctx.stroke();
    
    // Update character position
    const charX = startX + (pathLength * characterPosition.progress);
    const charY = centerY + Math.sin(characterPosition.progress * Math.PI * 4) * 100 + 
                 Math.cos(characterPosition.progress * Math.PI * 2) * 50;
    
    characterPosition.x = charX;
    characterPosition.y = charY;
    
    const character = document.getElementById('character');
    const rect = phase2Canvas.getBoundingClientRect();
    character.style.left = (rect.left + charX) + 'px';
    character.style.top = (rect.top + charY) + 'px';
}

function moveForward() {
    // Path movement removed; proceed directly to next scenario or phase 3
    if (currentScenarioIndex >= scenarios.length) {
        goToPhase('phase3');
    } else {
        showScenario();
    }
}

function showScenario() {
    if (currentScenarioIndex >= scenarios.length) {
        goToPhase('phase3');
        return;
    }

    isScenarioActive = true;
    const scenario = scenarios[currentScenarioIndex];

    document.getElementById('scenarioTitle').textContent = scenario.title;

    // Add barrier info for text area
    let scenarioText = scenario.text;
    if (scenario.barriers && scenario.barriers.length > 0) {
        scenarioText += `\n\n⚠️ ${scenario.barriers_text || 'Some options may be limited.'}`;
    }
    document.getElementById('scenarioText').textContent = scenarioText;

    // Populate accessible choice buttons for accessibility and keyboard navigation
    const choicesContainer = document.getElementById('modalChoices');
    choicesContainer.innerHTML = '';
    scenario.choices.forEach((choice, index) => {
        const isInaccessible = choice.inaccessible && choice.inaccessible.length > 0;
        const button = document.createElement('button');
        button.className = 'choice-btn' + (isInaccessible ? ' inaccessible' : '');
        button.type = 'button';
        button.setAttribute('data-choice-index', index);
        button.innerHTML = `<span class="choice-icon">${isInaccessible ? '🔒' : choice.icon}</span><span class="choice-text">${choice.text}${isInaccessible ? ' [inaccessible]' : ''}</span>`;
        if (!isInaccessible) button.addEventListener('click', () => handleScenarioChoice(choice, index));
        else button.title = 'Not accessible due to barriers';
        choicesContainer.appendChild(button);
    });

    // Setup scenario canvas and draw paths
    scenarioCanvas = document.getElementById('scenarioCanvas');
    if (scenarioCanvas) {
        const wrapper = scenarioCanvas.parentElement.getBoundingClientRect();
        scenarioCanvas.width = Math.max(600, Math.floor(wrapper.width * window.devicePixelRatio));
        scenarioCanvas.height = Math.max(320, Math.floor(wrapper.height * window.devicePixelRatio));
        scenarioCanvas.style.width = wrapper.width + 'px';
        scenarioCanvas.style.height = wrapper.height + 'px';
        scenarioCtx = scenarioCanvas.getContext('2d');
        scenarioCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Build path objects with variation per scenarioIndex
        scenarioPathObjects = buildScenarioPaths(scenario, currentScenarioIndex, scenarioCanvas);
        drawScenarioPaths(scenarioCtx, scenarioCanvas, scenarioPathObjects, assignedGender);

        // Mouse handlers
        scenarioMouseMoveHandler = (e) => handleScenarioMouseMove(e, scenarioCanvas, scenarioCtx);
        scenarioClickHandler = (e) => handleScenarioClick(e, scenarioCanvas);
        scenarioCanvas.addEventListener('mousemove', scenarioMouseMoveHandler);
        scenarioCanvas.addEventListener('click', scenarioClickHandler);
        scenarioCanvas.addEventListener('touchstart', (ev) => { ev.preventDefault(); handleScenarioClick(ev, scenarioCanvas); }, {passive:false});
    }

    document.getElementById('scenarioModal').style.display = 'flex';
}

function closeScenarioModal() {
    document.getElementById('scenarioModal').style.display = 'none';
    isScenarioActive = false;
    // remove handlers
    if (scenarioCanvas) {
        scenarioCanvas.removeEventListener('mousemove', scenarioMouseMoveHandler);
        scenarioCanvas.removeEventListener('click', scenarioClickHandler);
    }
    hideLockedOverlay();
}

// Build simple bezier paths for each choice; variation seeded by scenarioIndex
function buildScenarioPaths(scenario, scenarioIndex, canvas) {
    const choices = scenario.choices;
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    const startX = w / 2;
    const startY = h - 20;
    const count = choices.length;
    const spacing = Math.max(80, w / (count + 1));
    const rng = mulberry32(scenarioIndex + 1);

    const paths = choices.map((choice, i) => {
        const endX = spacing * (i + 1);
        const endY = 80 + Math.round(rng() * 40) - 20; // small vertical variation
        // control points vary to change curvature
        const cp1x = startX + (endX - startX) * 0.25 + (rng() - 0.5) * 160;
        const cp1y = startY - 150 + (rng() - 0.5) * 120;
        const cp2x = startX + (endX - startX) * 0.75 + (rng() - 0.5) * 160;
        const cp2y = startY - 300 + (rng() - 0.5) * 160;
        return {
            choiceIndex: i,
            choice: choice,
            locked: choice.inaccessible && choice.inaccessible.length > 0,
            start: { x: startX, y: startY },
            cp1: { x: cp1x, y: cp1y },
            cp2: { x: cp2x, y: cp2y },
            end: { x: endX, y: endY }
        };
    });
    return paths;
}

// Draw scenario paths
function drawScenarioPaths(ctx, canvas, paths, gender) {
    if (!ctx) return;
    // clear
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    paths.forEach((p, idx) => {
        const color = p.locked ? '#cccccc' : (p.choice.type === 'FULL_AUTHENTICITY' ? '#7fc97f' : (p.choice.type === 'BALANCED_EXPRESSION' ? '#8AB9B5' : '#999'));
        ctx.beginPath();
        ctx.moveTo(p.start.x, p.start.y);
        ctx.bezierCurveTo(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.end.x, p.end.y);
        ctx.lineWidth = p.locked ? 10 : 12;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw end marker
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.end.x, p.end.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // small number inside
        ctx.fillStyle = '#222';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), p.end.x, p.end.y);
    });
}

// Mouse move: highlight nearest path, show locked overlay if needed
function handleScenarioMouseMove(e, canvas, ctx) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const clientY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    let nearest = null;
    let nearestDist = Infinity;
    scenarioPathObjects.forEach(p => {
        const dist = distanceToBezier({x:clientX,y:clientY}, p.start, p.cp1, p.cp2, p.end);
        if (dist < nearestDist) { nearestDist = dist; nearest = p; }
    });

    // redraw with highlight if near
    drawScenarioPaths(ctx, canvas, scenarioPathObjects, assignedGender);
    if (nearest && nearestDist < 28) {
        // highlight
        ctx.beginPath();
        ctx.moveTo(nearest.start.x, nearest.start.y);
        ctx.bezierCurveTo(nearest.cp1.x, nearest.cp1.y, nearest.cp2.x, nearest.cp2.y, nearest.end.x, nearest.end.y);
        ctx.lineWidth = 18;
        ctx.strokeStyle = '#FFD54F';
        ctx.stroke();

        if (nearest.locked) {
            showLockedOverlay(e.clientX, e.clientY, nearest.choice.inaccessible || nearest.choice.barriers || []);
        } else {
            hideLockedOverlay();
        }
    } else {
        hideLockedOverlay();
    }
}

// Click handler: choose path if accessible
function handleScenarioClick(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const clientY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    let nearest = null;
    let nearestDist = Infinity;
    scenarioPathObjects.forEach(p => {
        const dist = distanceToBezier({x:clientX,y:clientY}, p.start, p.cp1, p.cp2, p.end);
        if (dist < nearestDist) { nearestDist = dist; nearest = p; }
    });
    if (nearest && nearestDist < 28) {
        if (nearest.locked) {
            // show overlay locked message
            showLockedOverlay(e.clientX, e.clientY, nearest.choice.inaccessible || nearest.choice.barriers || []);
        } else {
            // trigger choice
            handleScenarioChoice(nearest.choice, nearest.choiceIndex);
        }
    }
}

function showLockedOverlay(clientX, clientY, reasons) {
    const overlay = document.getElementById('lockedOverlay');
    if (!overlay) return;
    const reasonsText = (reasons && reasons.length) ? reasons.join(', ') : 'barriers present';
    document.getElementById('lockedReasons').textContent = reasonsText;
    overlay.style.display = 'block';
    // position overlay near cursor
    const wrapper = overlay.parentElement.getBoundingClientRect();
    const left = clientX - wrapper.left;
    const top = clientY - wrapper.top;
    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
}

function hideLockedOverlay() {
    const overlay = document.getElementById('lockedOverlay');
    if (overlay) overlay.style.display = 'none';
}

// helper: seeded RNG
function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// approximate distance from point to cubic bezier by sampling
function distanceToBezier(pt, p0, p1, p2, p3) {
    let minDist = Infinity;
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = cubicAt(p0.x, p1.x, p2.x, p3.x, t);
        const y = cubicAt(p0.y, p1.y, p2.y, p3.y, t);
        const dx = pt.x - x;
        const dy = pt.y - y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < minDist) minDist = d;
    }
    return minDist;
}

function cubicAt(a,b,c,d,t) { return Math.pow(1-t,3)*a + 3*Math.pow(1-t,2)*t*b + 3*(1-t)*Math.pow(t,2)*c + Math.pow(t,3)*d; }

function viewJourneyMapQuick() {
    // Quick view of journey map overlay (can be enhanced)
    alert('📍 You\'ve completed ' + currentScenarioIndex + ' scenarios. Continue your journey to see your complete path!');
}

function handleScenarioChoice(choice, choiceIndex) {
    document.getElementById('scenarioModal').style.display = 'none';
    
    // Update metrics
    currentMetrics.dignity = Math.max(0, Math.min(100, currentMetrics.dignity + choice.consequences.dignity));
    currentMetrics.survival = Math.max(0, Math.min(100, currentMetrics.survival + choice.consequences.survival));
    currentMetrics.authenticity = Math.max(0, Math.min(100, currentMetrics.authenticity + choice.consequences.authenticity));
    
    updateMetricDisplay('dignity', currentMetrics.dignity);
    updateMetricDisplay('survival', currentMetrics.survival);
    updateMetricDisplay('authenticity', currentMetrics.authenticity);
    
    // Store choice
    gameState.phase2Data.choices.push({
        scenarioIndex: currentScenarioIndex,
        choiceIndex: choiceIndex,
        type: choice.type,
        consequences: choice.consequences
    });
    
    // Track inaccessible paths
    const scenario = scenarios[currentScenarioIndex];
    if (scenario.choices.length > 1) {
        scenario.choices.forEach((c, idx) => {
            if (idx !== choiceIndex && c.inaccessible && c.inaccessible.length > 0) {
                gameState.phase2Data.inaccessibleScenarios.push({
                    scenarioIndex: currentScenarioIndex,
                    inaccessibleIndices: scenario.choices.map((_, i) => i).filter(i => i !== choiceIndex && scenario.choices[i].inaccessible && scenario.choices[i].inaccessible.length > 0)
                });
            }
        });
    }
    
    // Update progress
    currentScenarioIndex++;
    updatePhase2Progress();
    
    // Show consequences
    const isPositive = (choice.consequences.dignity + choice.consequences.survival + choice.consequences.authenticity) > 0;
    const overlay = document.getElementById('consequencesOverlay');
    overlay.querySelector('#consequencesIcon').textContent = isPositive ? '✨' : '😔';
    overlay.querySelector('#consequencesText').textContent = isPositive ? 
        'Your authenticity strengthened.' : 'The emotional cost weighs heavily.';
    overlay.style.display = 'flex';
    
    setTimeout(() => {
        overlay.style.display = 'none';
        isScenarioActive = false;
        moveForward();
    }, 2500);
}

function updateMetricDisplay(metric, value) {
    document.getElementById(metric + 'Meter').style.width = value + '%';
    document.getElementById(metric + 'Value').textContent = Math.round(value) + '%';
}

function updatePhase2Progress() {
    document.getElementById('progressValue').textContent = `${currentScenarioIndex} / ${scenarios.length}`;
    document.getElementById('progressBar').style.width = (currentScenarioIndex / scenarios.length) * 100 + '%';
}

/* ============================================
   PHASE 3 - LIFE MAP (with interactive path viewer)
   ============================================ */

let pathViewerCanvas = null;
let pathViewerCtx = null;
let pathZoom = 1;
let pathPan = { x: 0, y: 0 };
let isPanning = false;

function initPhase3() {
    // Store phase 2 data
    gameState.phase2Data.gender = assignedGender;
    gameState.phase2Data.metrics = { ...currentMetrics };
    
    // Update phase 3 displays
    document.getElementById('finalDignity').textContent = Math.round(currentMetrics.dignity) + '%';
    document.getElementById('finalSurvival').textContent = Math.round(currentMetrics.survival) + '%';
    document.getElementById('finalAuthenticity').textContent = Math.round(currentMetrics.authenticity) + '%';
    
    document.getElementById('finalDignityBar').style.width = currentMetrics.dignity + '%';
    document.getElementById('finalSurvivalBar').style.width = currentMetrics.survival + '%';
    document.getElementById('finalAuthenticityBar').style.width = currentMetrics.authenticity + '%';
    
    document.getElementById('scenariosCompleted').textContent = scenarios.length;
    document.getElementById('authenticChoices').textContent = gameState.phase2Data.choices.filter(c => c.type === 'FULL_AUTHENTICITY').length;
    document.getElementById('balancedChoices').textContent = gameState.phase2Data.choices.filter(c => c.type === 'BALANCED_EXPRESSION').length;
    
    // Count locked paths (scenarios with inaccessible options)
    const lockedCount = gameState.phase2Data.inaccessibleScenarios.length;
    document.getElementById('lockedPaths').textContent = lockedCount;
    
    // Generate narrative reflection
    generateReflectionNarrative();
    
    // Initialize path viewer canvas
    setupPathViewerCanvas();
    
    // Save character to library
    saveCharacterToLibrary();
}

function generateReflectionNarrative() {
    const metrics = currentMetrics;
    const choices = gameState.phase2Data.choices;
    const authCount = choices.filter(c => c.type === 'FULL_AUTHENTICITY').length;
    const balanceCount = choices.filter(c => c.type === 'BALANCED_EXPRESSION').length;
    const conformityCount = choices.filter(c => c.type === 'CAUTIOUS_CONFORMITY' || c.type === 'COMPLETE_CONFORMITY').length;
    
    let narrative = '';
    
    // Dynamic narrative based on choices
    if (authCount > balanceCount && authCount > conformityCount) {
        narrative = `You chose authenticity above all else. Your dignity remains strong at ${Math.round(metrics.dignity)}%, but the cost of speaking your truth was evident in your survival metrics (${Math.round(metrics.survival)}%). Your journey shows that living authentically sometimes means accepting vulnerability.`;
    } else if (balanceCount >= authCount && balanceCount >= conformityCount) {
        narrative = `You found balance between expressing yourself and navigating the world. With a dignity of ${Math.round(metrics.dignity)}%, survival of ${Math.round(metrics.survival)}%, and authenticity of ${Math.round(metrics.authenticity)}%, you demonstrated wisdom in knowing when to hold firm and when to adapt.`;
    } else {
        narrative = `You prioritized survival and safety, sometimes at the cost of your authenticity (${Math.round(metrics.authenticity)}%). This too is a valid strategy—the barriers you faced were real, and your survival was paramount. Your journey highlights the systemic pressures that force such choices.`;
    }
    
    // Add reflection on barriers
    if (gameState.phase2Data.inaccessibleScenarios.length > 0) {
        narrative += ` \n\nYou encountered ${gameState.phase2Data.inaccessibleScenarios.length} scenarios where systemic barriers limited your choices. This reflects the real barriers many transgender and gender non-conforming people face daily—barriers that aren't about willpower, but about structural inequality.`;
    }
    
    document.getElementById('reflectionNarrative').innerHTML = `<p>${narrative}</p>`;
}

function setupPathViewerCanvas() {
    pathViewerCanvas = document.getElementById('pathViewerCanvas');
    if (!pathViewerCanvas) return;
    
    pathViewerCtx = pathViewerCanvas.getContext('2d');
    
    // Set canvas size
    const container = pathViewerCanvas.parentElement;
    pathViewerCanvas.width = container.clientWidth;
    pathViewerCanvas.height = container.clientHeight;
    
    // Draw initial path with scenario markers
    drawPathViewer();
    
    // Add pan and zoom listeners
    pathViewerCanvas.addEventListener('wheel', handlePathZoom);
    pathViewerCanvas.addEventListener('mousedown', startPathPan);
    pathViewerCanvas.addEventListener('mousemove', handlePathPan);
    pathViewerCanvas.addEventListener('mouseup', endPathPan);
    pathViewerCanvas.addEventListener('mouseleave', endPathPan);
}

function drawPathViewer() {
    pathViewerCtx.clearRect(0, 0, pathViewerCanvas.width, pathViewerCanvas.height);
    
    const centerY = pathViewerCanvas.height / 2;
    const pathWidth = 40;
    const pathLength = pathViewerCanvas.width - 100;
    const startX = 50;
    
    // Save context for transformations
    pathViewerCtx.save();
    pathViewerCtx.translate(pathPan.x, pathPan.y);
    pathViewerCtx.scale(pathZoom, pathZoom);
    
    // Draw main path
    const pathColor = assignedGender === 'female' ? '#D49D99' : '#76AACD';
    pathViewerCtx.strokeStyle = pathColor;
    pathViewerCtx.lineWidth = pathWidth;
    pathViewerCtx.lineCap = 'round';
    pathViewerCtx.lineJoin = 'round';
    
    pathViewerCtx.beginPath();
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = startX + (pathLength * t);
        const y = centerY + Math.sin(t * Math.PI * 4) * 60 + Math.cos(t * Math.PI * 2) * 40;
        
        if (i === 0) {
            pathViewerCtx.moveTo(x, y);
        } else {
            pathViewerCtx.lineTo(x, y);
        }
    }
    pathViewerCtx.stroke();
    
    // Draw scenario markers
    gameState.phase2Data.choices.forEach((choice, idx) => {
        const t = idx / scenarios.length;
        const x = startX + (pathLength * t);
        const y = centerY + Math.sin(t * Math.PI * 4) * 60 + Math.cos(t * Math.PI * 2) * 40;
        
        // Draw circle marker
        pathViewerCtx.fillStyle = choice.type === 'FULL_AUTHENTICITY' ? '#7fc97f' : 
                                  choice.type === 'BALANCED_EXPRESSION' ? '#8AB9B5' : '#999';
        pathViewerCtx.beginPath();
        pathViewerCtx.arc(x, y, 8, 0, Math.PI * 2);
        pathViewerCtx.fill();
        
        // Draw scenario number
        pathViewerCtx.fillStyle = 'white';
        pathViewerCtx.font = 'bold 10px Arial';
        pathViewerCtx.textAlign = 'center';
        pathViewerCtx.textBaseline = 'middle';
        pathViewerCtx.fillText(idx + 1, x, y);
    });
    
    // Draw locked path indicators (greyed out alternate paths)
    gameState.phase2Data.inaccessibleScenarios.forEach(locked => {
        const t = locked.scenarioIndex / scenarios.length;
        const x = startX + (pathLength * t);
        const y = centerY + Math.sin(t * Math.PI * 4) * 60 + Math.cos(t * Math.PI * 2) * 40;
        
        // Draw lock icon
        pathViewerCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        pathViewerCtx.font = '16px Arial';
        pathViewerCtx.textAlign = 'center';
        pathViewerCtx.textBaseline = 'middle';
        pathViewerCtx.fillText('🔒', x + 30, y - 30);
    });
    
    pathViewerCtx.restore();
}

function zoomPathIn() {
    pathZoom = Math.min(3, pathZoom + 0.2);
    drawPathViewer();
}

function zoomPathOut() {
    pathZoom = Math.max(0.5, pathZoom - 0.2);
    drawPathViewer();
}

function resetPathView() {
    pathZoom = 1;
    pathPan = { x: 0, y: 0 };
    drawPathViewer();
}

function togglePan() {
    isPanning = !isPanning;
    pathViewerCanvas.style.cursor = isPanning ? 'grab' : 'default';
}

let lastPanX = 0, lastPanY = 0;

function startPathPan(e) {
    if (!isPanning) return;
    lastPanX = e.clientX;
    lastPanY = e.clientY;
    pathViewerCanvas.style.cursor = 'grabbing';
}

function handlePathPan(e) {
    if (!isPanning || !lastPanX) return;
    
    const deltaX = e.clientX - lastPanX;
    const deltaY = e.clientY - lastPanY;
    
    pathPan.x += deltaX;
    pathPan.y += deltaY;
    
    lastPanX = e.clientX;
    lastPanY = e.clientY;
    
    drawPathViewer();
}

function endPathPan() {
    lastPanX = 0;
    lastPanY = 0;
    if (isPanning) pathViewerCanvas.style.cursor = 'grab';
}

function shareJourney() {
    const text = `I navigated a journey exploring transgender experiences.\n\nFinal Metrics:\nDignity: ${Math.round(currentMetrics.dignity)}%\nSurvival: ${Math.round(currentMetrics.survival)}%\nAuthenticity: ${Math.round(currentMetrics.authenticity)}%\n\nTry it and reflect.`;
    
    if (navigator.share) {
        navigator.share({ title: 'My Journey', text: text });
    } else {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadCharacterLibrary();
    renderCharacterLibrary();
    
    // Start directly at character creation since the intro/menu was removed
    goToPhase('characterCreation');
});
