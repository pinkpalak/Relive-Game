// Orb Trajectory Modal Handler
// Manages opening and closing of the orbtrajectory modal

class TrajectoryTracker {
    constructor() {
        this.loadChoices();
    }

    loadChoices() {
        const saved = localStorage.getItem('playerChoices');
        this.playerChoices = saved ? JSON.parse(saved) : {};
        this.currentScenarioNumber = parseInt(localStorage.getItem('currentScenarioNumber') || '1');
        // transient preview choice (not persisted) - shape: { scenarioKey: 'scenario3', pathKey: 'path2' }
        this.tempChoice = null;
    }

    calculateScores() {
        const pathScores = {
            'path1': { survival: 40, dignity: 10 },
            'path2': { survival: 20, dignity: 30 },
            'path3': { survival: 10, dignity: 40 },
            'path4': { survival: -20, dignity: 50 }
        };

        let totalSurvival = 0;
        let totalDignity = 0;

        // Build an effective choices view that includes any transient preview
        const effectiveChoices = Object.assign({}, this.playerChoices);
        if (this.tempChoice && this.tempChoice.scenarioKey && this.tempChoice.pathKey) {
            effectiveChoices[this.tempChoice.scenarioKey] = this.tempChoice.pathKey;
        }

        for (let i = 1; i <= 9; i++) {
            const scenarioKey = `scenario${i}`;
            const chosenPath = effectiveChoices[scenarioKey];
            if (chosenPath && pathScores[chosenPath]) {
                totalSurvival += pathScores[chosenPath].survival;
                totalDignity += pathScores[chosenPath].dignity;
            }
        }

        // Normalize using known min/max totals for 9 scenarios
        const survivalMin = -20 * 9; // -180
        const survivalMax = 40 * 9;  // 360
        const dignityMin = 10 * 9;   // 90
        const dignityMax = 50 * 9;   // 450

        const survivalPercent = Math.round(Math.max(0, Math.min(100, ((totalSurvival - survivalMin) / (survivalMax - survivalMin)) * 100)));
        const dignityPercent = Math.round(Math.max(0, Math.min(100, ((totalDignity - dignityMin) / (dignityMax - dignityMin)) * 100)));

        return {
            survival: survivalPercent,
            dignity: dignityPercent,
            rawSurvival: totalSurvival,
            rawDignity: totalDignity
        };
    }

    getTrajectoryPath() {
        const scores = this.calculateScores();
        // Use normalized percentage difference for balance so curve follows meter values
        const balance = (scores.survival - scores.dignity) / 100; // range -1 .. 1
        return {
            ...scores,
            balance: balance
        };
    }

    getScenarioMarkers() {
        const markers = [];
        // Use effective choices that include transient preview
        const effectiveChoices = Object.assign({}, this.playerChoices);
        if (this.tempChoice && this.tempChoice.scenarioKey && this.tempChoice.pathKey) {
            effectiveChoices[this.tempChoice.scenarioKey] = this.tempChoice.pathKey;
        }

        for (let i = 1; i <= 9; i++) {
            const scenarioKey = `scenario${i}`;
            const chosenPath = effectiveChoices[scenarioKey];
            if (chosenPath) {
                markers.push({
                    scenario: i,
                    path: chosenPath,
                    pathNumber: parseInt(chosenPath.replace('path', ''))
                });
            }
        }
        return markers;
    }

    // apply a transient preview choice (does NOT persist to localStorage)
    applyTempChoice(scenarioKey, pathKey){
        this.tempChoice = { scenarioKey, pathKey };
    }

    clearTempChoice(){
        this.tempChoice = null;
    }
}

class TrajectoryRenderer {
    constructor() {
        this.tracker = new TrajectoryTracker();
        this.canvas = document.getElementById('trajectoryCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.setupEventListeners();
            this.ensureDebugOverlay();
            this.render();
        }
    }

    ensureDebugOverlay(){
        // create a small debug panel inside the popup to show raw score values
        try{
            let overlay = document.getElementById('orbDebugOverlay');
            if (!overlay){
                overlay = document.createElement('div');
                overlay.id = 'orbDebugOverlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '12px';
                overlay.style.right = '12px';
                overlay.style.zIndex = '9999';
                overlay.style.background = 'rgba(12,12,12,0.72)';
                overlay.style.color = '#FFF';
                overlay.style.padding = '8px 10px';
                overlay.style.borderRadius = '6px';
                overlay.style.fontSize = '12px';
                overlay.style.lineHeight = '1.25';
                overlay.style.maxWidth = '260px';
                overlay.style.pointerEvents = 'none';

                // attach into the popup container if available, else to body
                const container = document.getElementById('orbPopupContent') || document.getElementById('orbPopup') || document.body;
                // ensure container is positioned to allow absolute within it
                if (container && getComputedStyle(container).position === 'static') container.style.position = 'relative';
                container.appendChild(overlay);
            }
        }catch(e){ /* ignore overlay creation errors */ }
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.removeEventListener('click', this.closeBtnClickHandler);
            this.closeBtnClickHandler = () => {
                window.closeOrbPopup();
            };
            closeBtn.addEventListener('click', this.closeBtnClickHandler);
        }

        const popup = document.getElementById('orbPopup');
        if (popup) {
            popup.removeEventListener('click', this.popupClickHandler);
            this.popupClickHandler = (e) => {
                if (e.target === popup) {
                    window.closeOrbPopup();
                }
            };
            popup.addEventListener('click', this.popupClickHandler);
        }
    }

    render() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.fillStyle = 'rgba(20, 20, 20, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTrajectory();
        this.drawMarkers();
        this.updateMeters();
    }

    drawTrajectory() {
        const trajectory = this.tracker.getTrajectoryPath();
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        const centerY = height / 2;
        // compute a dynamic maximum curve height based on available vertical space
        const maxCurve = Math.max(40, centerY - padding - 20);
        const curveHeight = maxCurve * trajectory.balance;

        this.ctx.beginPath();
        this.ctx.moveTo(padding, centerY);

        const controlX = width / 2;
        const controlY = centerY - curveHeight;

        this.ctx.quadraticCurveTo(controlX, controlY, width - padding, centerY);
        this.ctx.strokeStyle = '#E0543D';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.closePath();

        const gradient = this.ctx.createLinearGradient(0, centerY - curveHeight, 0, height - padding);
        gradient.addColorStop(0, 'rgba(224, 84, 61, 0.15)');
        gradient.addColorStop(1, 'rgba(224, 84, 61, 0.02)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    drawMarkers() {
        const markers = this.tracker.getScenarioMarkers();
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        const trajectory = this.tracker.getTrajectoryPath();
        const centerY = height / 2;
        const curveHeight = 60 * trajectory.balance;

        markers.forEach((marker) => {
            const t = marker.scenario / 10;
            const x = padding + (width - 2 * padding) * t;

            const controlX = width / 2;
            const controlY = centerY - curveHeight;
            const u = 1 - t;
            const y = u * u * centerY + 2 * u * t * controlY + t * t * centerY;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#E0543D';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(250, 250, 250, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = '#FAFAFA';
            this.ctx.font = 'bold 11px Segoe UI';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(marker.scenario.toString(), x, y);
        });
    }

    updateMeters() {
        const scores = this.tracker.calculateScores();

        const survivalMeter = document.getElementById('survivalMeter');
        if (survivalMeter) {
            survivalMeter.style.setProperty('--percentage', (scores.survival * 3.6) + 'deg');
            document.getElementById('survivalValue').textContent = scores.survival + '%';
        }

        const dignityMeter = document.getElementById('dignityMeter');
        if (dignityMeter) {
            dignityMeter.style.setProperty('--percentage', (scores.dignity * 3.6) + 'deg');
            document.getElementById('dignityValue').textContent = scores.dignity + '%';
        }

        // Update debug overlay with raw internal values
        try{
            const overlay = document.getElementById('orbDebugOverlay');
            if (overlay){
                const trajectory = this.tracker.getTrajectoryPath();
                const curveHeight = (trajectory.balance || 0) * 60;
                const effectiveChoices = Object.assign({}, this.tracker.playerChoices);
                if (this.tracker.tempChoice && this.tracker.tempChoice.scenarioKey && this.tracker.tempChoice.pathKey){
                    effectiveChoices[this.tracker.tempChoice.scenarioKey] = this.tracker.tempChoice.pathKey;
                }

                let choicesSummary = Object.keys(effectiveChoices).slice(0,6).map(k=>`${k}:${effectiveChoices[k]}`).join(', ');
                if (!choicesSummary) choicesSummary = '(none)';

                overlay.textContent = `rawSurvival: ${trajectory.rawSurvival}\nrawDignity: ${trajectory.rawDignity}\nbalance: ${trajectory.balance.toFixed(3)}\ncurveHeight: ${curveHeight.toFixed(1)}\neffective: ${choicesSummary}`;
            }
        }catch(e){ /* ignore debug errors */ }
    }
}

// Global renderer instance (attached to window so multiple scripts share it)
window.trajectoryRenderer = window.trajectoryRenderer || null;

function initOrbTrajectoryRenderer(){
    // If already initialized, refresh choices + render
    if (window.trajectoryRenderer){
        try{ window.trajectoryRenderer.tracker.loadChoices(); window.trajectoryRenderer.render(); }catch(e){}
        return window.trajectoryRenderer;
    }

    // If class is available, instantiate
    const RendererClass = (typeof TrajectoryRenderer !== 'undefined') ? TrajectoryRenderer : (window.TrajectoryRenderer || null);
    if (!RendererClass) return null;

    try{
        window.trajectoryRenderer = new RendererClass();
        return window.trajectoryRenderer;
    }catch(e){
        console.error('Failed to initialize TrajectoryRenderer', e);
        return null;
    }
}

// Public preview helpers: apply a temporary choice and render (does not persist)
window.previewOrbChoice = function(scenarioKey, pathKey){
    const r = initOrbTrajectoryRenderer();
    if (r && r.tracker && r.tracker.applyTempChoice){
        r.tracker.applyTempChoice(scenarioKey, pathKey);
        r.render();
    }
};

window.clearOrbPreview = function(){
    if (window.trajectoryRenderer && window.trajectoryRenderer.tracker && window.trajectoryRenderer.tracker.clearTempChoice){
        window.trajectoryRenderer.tracker.clearTempChoice();
        window.trajectoryRenderer.render();
    }
};

// Global function to open orbtrajectory popup
window.openOrbPopup = function(scenarioKey, currentPage) {
    console.log('Opening orbtrajectory modal for:', scenarioKey, currentPage);
    
    // Attempt to detect the selected path using multiple fallbacks
    let pathKey = null;

    // 1) DOM: element with explicit selected class
    const selectedDom = document.querySelector('.choice-node.selected-path') || document.querySelector('[data-selected-path].selected-path');
    if (selectedDom) {
        // prefer explicit data-path attribute if present
        if (selectedDom.dataset && selectedDom.dataset.path) {
            pathKey = selectedDom.dataset.path;
        } else if (selectedDom.getAttribute && selectedDom.getAttribute('data-path')) {
            pathKey = selectedDom.getAttribute('data-path');
        } else if (selectedDom.id && selectedDom.id.startsWith('choice-')) {
            const num = selectedDom.id.replace('choice-', '');
            pathKey = `path${num}`;
        }
    }

    // 2) global variable fallback (some pages set window.selectedPath)
    if (!pathKey && window.selectedPath) {
        pathKey = window.selectedPath;
    }

    // 3) localStorage fallback (previously-stored selection)
    if (!pathKey) {
        const ls = localStorage.getItem('currentPathSelection');
        if (ls) pathKey = ls;
    }

    // Normalize numeric-only values to `pathN`
    if (pathKey && /^\d+$/.test(pathKey)) {
        pathKey = `path${pathKey}`;
    }

    if (pathKey) {
        // Normalize scenario number (accept "scenario3" or 3)
        const scenarioNumber = (typeof scenarioKey === 'string' && scenarioKey.indexOf('scenario') === 0)
            ? scenarioKey.replace('scenario', '')
            : String(scenarioKey);

        // store metadata (scenario/page) but DO NOT persist the chosen path into finalized playerChoices here
        try {
            localStorage.setItem('currentScenarioNumber', scenarioNumber);
            localStorage.setItem('currentPathSelection', pathKey);
            localStorage.setItem('lastScenarioPage', currentPage);
        } catch (e) { /* ignore storage errors */ }

        console.log('Detected selected path (preview):', pathKey);

        // apply a transient preview to the renderer so meters/curve update immediately
        const r = initOrbTrajectoryRenderer();
        if (r && r.tracker && typeof r.tracker.applyTempChoice === 'function'){
            // clear any previous transient preview before applying new one
            if (typeof r.tracker.clearTempChoice === 'function') r.tracker.clearTempChoice();
            r.tracker.applyTempChoice(`scenario${scenarioNumber}`, pathKey);
            r.render();
        }
    }
    
    // Show the popup
    const popup = document.getElementById('orbPopup');
    if (popup) {
        popup.style.display = 'flex';
        popup.classList.add('show');
        
        // Initialize renderer if not already done (works whether injected or standalone)
        const existing = initOrbTrajectoryRenderer();
        if (!existing){
            // try again shortly if DOM was just injected
            setTimeout(() => { initOrbTrajectoryRenderer(); }, 120);
        }
    } else {
        console.error('orbPopup element not found');
    }
};

// Global function to close orbtrajectory popup
window.closeOrbPopup = function() {
    console.log('Closing orbtrajectory modal');
    const popup = document.getElementById('orbPopup');
    if (popup) {
        popup.style.display = 'none';
        popup.classList.remove('show');
        // clear any transient preview when closing
        if (window.trajectoryRenderer && window.trajectoryRenderer.tracker && window.trajectoryRenderer.tracker.clearTempChoice){
            window.trajectoryRenderer.tracker.clearTempChoice();
        }
    }
};

// Alias for consistency
function closeOrbPopup() {
    window.closeOrbPopup();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('orbtrajectory-popup.js loaded');
    // Pre-load the orbtrajectory.html content and styles into the popup
    const orbPopupContent = document.getElementById('orbPopupContent');
    if (orbPopupContent) {
        fetch('orbtrajectory.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract styles from orbtrajectory.html
                const styles = doc.querySelector('style');
                if (styles && !document.querySelector('style[data-orb-modal]')) {
                    const styleClone = styles.cloneNode(true);
                    styleClone.setAttribute('data-orb-modal', 'true');
                    document.head.appendChild(styleClone);
                }
                
                // Extract main content
                const mainContent = doc.querySelector('main');
                if (mainContent) {
                    orbPopupContent.innerHTML = mainContent.innerHTML;
                    // initialize renderer now that content exists in DOM
                    setTimeout(()=>{ initOrbTrajectoryRenderer(); }, 60);
                }
            })
            .catch(error => console.error('Failed to load orbtrajectory content:', error));
    }

    // If the modal/canvas already exists on the page (standalone orbtrajectory.html), init renderer
    setTimeout(()=>{ if (document.getElementById('trajectoryCanvas')) initOrbTrajectoryRenderer(); }, 40);
});
