/* ============================================
   UI OVERLAY - EMOTIONAL METRICS & CONTROLS
   ============================================ */

/**
 * UI Overlay Manager
 * Handles emotional metrics, progress tracking, and move forward button
 */

// Current metric values (0-100)
let metrics = {
    dignity: 100,
    survival: 100,
    authenticity: 100
};

// Progress tracking
let progress = {
    current: 0,
    total: 0
};

/* ============================================
   METRICS MANAGEMENT
   ============================================ */

/**
 * Update a specific metric value
 * @param {string} metricName - 'dignity', 'survival', or 'authenticity'
 * @param {number} value - New value (0-100)
 */
function updateMetric(metricName, value) {
    // Clamp value between 0 and 100
    metrics[metricName] = Math.max(0, Math.min(100, value));
    
    // Update UI
    updateMetricBar(metricName, metrics[metricName]);
}

/**
 * Adjust a metric by a delta amount
 * @param {string} metricName - 'dignity', 'survival', or 'authenticity'
 * @param {number} delta - Change amount (can be positive or negative)
 */
function adjustMetric(metricName, delta) {
    updateMetric(metricName, metrics[metricName] + delta);
}

/**
 * Update all metrics at once
 * @param {Object} changes - Object with dignity, survival, authenticity properties
 */
function updateAllMetrics(changes) {
    if (changes.dignity !== undefined) {
        adjustMetric('dignity', changes.dignity);
    }
    if (changes.survival !== undefined) {
        adjustMetric('survival', changes.survival);
    }
    if (changes.authenticity !== undefined) {
        adjustMetric('authenticity', changes.authenticity);
    }
}

/**
 * Update the visual metric bar
 * @param {string} metricName - 'dignity', 'survival', or 'authenticity'
 * @param {number} value - Current value (0-100)
 */
function updateMetricBar(metricName, value) {
    const meter = document.getElementById(metricName + 'Meter');
    const valueDisplay = document.getElementById(metricName + 'Value');
    
    if (!meter || !valueDisplay) return;
    
    // Update width with smooth animation
    meter.style.width = value + '%';
    
    // Update text value
    valueDisplay.textContent = Math.round(value) + '%';
    
    // Update color class based on value
    meter.classList.remove('low', 'medium', 'high', 'animating');
    
    if (value < 30) {
        meter.classList.add('low');
    } else if (value < 70) {
        meter.classList.add('medium');
    } else {
        meter.classList.add('high');
    }
    
    // Add animation class temporarily
    meter.classList.add('animating');
    setTimeout(() => {
        meter.classList.remove('animating');
    }, 500);
}

/**
 * Get current metric values
 * @returns {Object} Current metrics object
 */
function getMetrics() {
    return { ...metrics };
}

/**
 * Reset all metrics to 100
 */
function resetMetrics() {
    metrics = {
        dignity: 100,
        survival: 100,
        authenticity: 100
    };
    
    updateMetricBar('dignity', 100);
    updateMetricBar('survival', 100);
    updateMetricBar('authenticity', 100);
}

/* ============================================
   PROGRESS MANAGEMENT
   ============================================ */

/**
 * Set total number of scenarios
 * @param {number} total - Total number of scenarios
 */
function setTotalScenarios(total) {
    progress.total = total;
    updateProgressDisplay();
}

/**
 * Update current progress
 * @param {number} current - Current scenario number (0-based)
 */
function setProgress(current) {
    progress.current = current;
    updateProgressDisplay();
}

/**
 * Increment progress by 1
 */
function incrementProgress() {
    progress.current = Math.min(progress.current + 1, progress.total);
    updateProgressDisplay();
}

/**
 * Update the progress display UI
 */
function updateProgressDisplay() {
    const progressValue = document.getElementById('progressValue');
    const progressBar = document.getElementById('progressBar');
    
    if (!progressValue || !progressBar) return;
    
    // Update text
    progressValue.textContent = `${progress.current} / ${progress.total}`;
    
    // Update bar width
    const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
    progressBar.style.width = percentage + '%';
}

/**
 * Get current progress
 * @returns {Object} Progress object with current and total
 */
function getProgress() {
    return { ...progress };
}

/**
 * Reset progress to 0
 */
function resetProgress() {
    progress.current = 0;
    updateProgressDisplay();
}

/* ============================================
   MOVE FORWARD BUTTON
   ============================================ */

/**
 * Enable the move forward button
 */
function enableMoveForwardButton() {
    const btn = document.getElementById('moveForwardBtn');
    if (btn) {
        btn.disabled = false;
    }
}

/**
 * Disable the move forward button
 */
function disableMoveForwardButton() {
    const btn = document.getElementById('moveForwardBtn');
    if (btn) {
        btn.disabled = true;
    }
}

/**
 * Set move forward button click handler
 * @param {Function} handler - Function to call when button is clicked
 */
function setMoveForwardHandler(handler) {
    const btn = document.getElementById('moveForwardBtn');
    if (btn) {
        // Remove existing listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add new listener
        newBtn.addEventListener('click', handler);
    }
}

/**
 * Update button text
 * @param {string} text - New button text
 */
function setMoveForwardButtonText(text) {
    const btn = document.getElementById('moveForwardBtn');
    if (btn) {
        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) {
            textSpan.textContent = text;
        }
    }
}

/* ============================================
   INITIALIZATION
   ============================================ */

/**
 * Initialize the UI overlay
 */
function initializeUIOverlay() {
    // Initialize metrics display
    updateMetricBar('dignity', metrics.dignity);
    updateMetricBar('survival', metrics.survival);
    updateMetricBar('authenticity', metrics.authenticity);
    
    // Initialize progress display
    updateProgressDisplay();
    
    // Button starts disabled by default
    disableMoveForwardButton();
    
    console.log('UI Overlay initialized');
}

/* ============================================
   EXAMPLE USAGE / DEMO
   ============================================ */

/**
 * Example: Simulate metric changes
 */
function demoMetrics() {
    // Simulate some metric changes
    setTimeout(() => {
        adjustMetric('dignity', -20);
        adjustMetric('survival', +10);
        adjustMetric('authenticity', -15);
    }, 1000);
    
    setTimeout(() => {
        adjustMetric('dignity', +15);
        adjustMetric('survival', -5);
        adjustMetric('authenticity', +20);
    }, 3000);
}

/**
 * Example: Simulate progress updates
 */
function demoProgress() {
    setTotalScenarios(12);
    
    let current = 0;
    const interval = setInterval(() => {
        incrementProgress();
        current++;
        if (current >= 12) {
            clearInterval(interval);
        }
    }, 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeUIOverlay();
    
    // Example: Set up move forward button handler
    setMoveForwardHandler(() => {
        console.log('Move Forward button clicked!');
        incrementProgress();
        
        // Example: Adjust metrics
        adjustMetric('dignity', -5);
        adjustMetric('survival', +3);
        adjustMetric('authenticity', -8);
    });
    
    // Enable button after a short delay (for demo)
    setTimeout(() => {
        enableMoveForwardButton();
    }, 500);
    
    // Uncomment to run demos:
    // demoMetrics();
    // demoProgress();
});

/* ============================================
   EXPORT FUNCTIONS (for use in other modules)
   ============================================ */

// If using modules, export these functions
// export {
//     updateMetric,
//     adjustMetric,
//     updateAllMetrics,
//     getMetrics,
//     resetMetrics,
//     setTotalScenarios,
//     setProgress,
//     incrementProgress,
//     getProgress,
//     resetProgress,
//     enableMoveForwardButton,
//     disableMoveForwardButton,
//     setMoveForwardHandler,
//     setMoveForwardButtonText
// };

