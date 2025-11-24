class TrajectoryTracker {
    constructor() {
        this.loadChoices();
    }

    loadChoices() {
        // Load finalized choices from playerChoices
        const saved = localStorage.getItem('playerChoices');
        this.playerChoices = saved ? JSON.parse(saved) : {};
        
        // Load current scenario number
        this.currentScenarioNumber = parseInt(localStorage.getItem('currentScenarioNumber') || '1');
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

        // Sum up scores from all finalized choices
        for (let i = 1; i <= 9; i++) {
            const scenarioKey = `scenario${i}`;
            const chosenPath = this.playerChoices[scenarioKey];
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
        // Calculate trajectory curve height based on choices
        // Higher survival = higher curve, higher dignity = lower curve
        const scores = this.calculateScores();
        
        // Curve is primarily influenced by the balance between survival and dignity
        // Use normalized percentage difference for balance so curve follows meter values
        // If survival > dignity, curve goes up; if dignity > survival, curve goes down
        const balance = (scores.survival - scores.dignity) / 100; // range -1 .. 1
        
        return {
            ...scores,
            balance: balance
        };
    }

    getScenarioMarkers() {
        // Get all scenario choices for visualization
        const markers = [];
        for (let i = 1; i <= 9; i++) {
            const scenarioKey = `scenario${i}`;
            const chosenPath = this.playerChoices[scenarioKey];
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
}

class TrajectoryRenderer {
    constructor() {
        this.tracker = new TrajectoryTracker();
        this.canvas = document.getElementById('trajectoryCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Store instance globally so it can be accessed from popup open function
        window.trajectoryRenderer = this;
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const popup = document.getElementById('orbPopup');
                if (popup) {
                    popup.classList.remove('show');
                }
            });
        }
        
        // Close on background click
        const popup = document.getElementById('orbPopup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.classList.remove('show');
                }
            });
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(20, 20, 20, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw trajectory curve
        this.drawTrajectory();

        // Draw scenario markers
        this.drawMarkers();

        // Update meters
        this.updateMeters();
    }

    drawTrajectory() {
        const trajectory = this.tracker.getTrajectoryPath();
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;

        // Calculate curve based on balance and available vertical space
        const centerY = height / 2;
        const maxCurve = Math.max(40, centerY - padding - 20);
        const curveHeight = maxCurve * trajectory.balance; // dynamic deviation

        // Draw trajectory curve using quadratic Bezier
        this.ctx.beginPath();
        this.ctx.moveTo(padding, centerY);

        // Control point for curve
        const controlX = width / 2;
        const controlY = centerY - curveHeight;

        // Draw the main curve
        this.ctx.quadraticCurveTo(controlX, controlY, width - padding, centerY);

        // Stroke the line
        this.ctx.strokeStyle = '#E0543D';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw gradient area under curve
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
            // Position marker along the curve
            const t = marker.scenario / 10; // 0 to 0.9 progress along curve
            const x = padding + (width - 2 * padding) * t;

            // Calculate y position on the curve (quadratic Bezier)
            const controlX = width / 2;
            const controlY = centerY - curveHeight;
            const u = 1 - t;
            const y = u * u * centerY + 2 * u * t * controlY + t * t * centerY;

            // Draw marker circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#E0543D';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(250, 250, 250, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw scenario number
            this.ctx.fillStyle = '#FAFAFA';
            this.ctx.font = 'bold 11px Segoe UI';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(marker.scenario.toString(), x, y);
        });
    }

    updateMeters() {
        const scores = this.tracker.calculateScores();

        // Update survival meter
        const survivalMeter = document.getElementById('survivalMeter');
        survivalMeter.style.setProperty('--percentage', (scores.survival * 3.6) + 'deg');
        document.getElementById('survivalValue').textContent = scores.survival + '%';

        // Update dignity meter
        const dignityMeter = document.getElementById('dignityMeter');
        dignityMeter.style.setProperty('--percentage', (scores.dignity * 3.6) + 'deg');
        document.getElementById('dignityValue').textContent = scores.dignity + '%';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Show the modal when page is loaded directly
    const popup = document.getElementById('orbPopup');
    if (popup) {
        popup.classList.add('show');
    }
    
    new TrajectoryRenderer();
});

// Global function to open popup from task pages
window.openOrbPopup = function(scenarioKey, currentPage) {
    if (window.selectedPath) {
        const pathNumber = window.selectedPath.replace('choice-', '');
        const pathKey = `path${pathNumber}`;
        
        // Save current selection
        localStorage.setItem('currentScenarioNumber', scenarioKey.replace('scenario', ''));
        localStorage.setItem('currentPathSelection', pathKey);
        localStorage.setItem('lastScenarioPage', currentPage);
    }
    
    // Show the popup
    const popup = document.getElementById('orbPopup');
    if (popup) {
        popup.classList.add('show');
        // Render the trajectory when popup opens
        if (window.trajectoryRenderer) {
            window.trajectoryRenderer.render();
        }
    }
};
