/* Re:Live - Phase 2 Interface (Task 2)
   Scenario 2: The Visual Discrepancy
   Choices from CSV
*/

const scenarios = [
    {
        description: 'Before the shift, drivers and conductors gather at a chai stall. They casually tease you about the way you walk.',
        choices: [
            'Laugh it off since it was meant as a joke only.',
            'Drink your chai in silence, ignoring the conversation until the bus is ready.',
            'Leave the group to sit alone on the bus, isolating yourself further.',
            'Jokingly embrace it and comment back "Hey, I walk with grace".'
        ]
    }
];

let isRolling = false;
let currentScenarioIndex = 0;
let selectedPath = null;

window.addEventListener('load', () => {
    renderScenario(currentScenarioIndex);
    setupInteractions();
    setupSelectPathButton();
});

function renderScenario(index) {
    const scenario = scenarios[index];
    if (!scenario) return;
    // Update scenario text
    const scenarioText = document.querySelector('#scenario-card .scenario-text p');
    scenarioText.textContent = scenario.description;
    // Update choices
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`choice-${i+1}`);
        if (btn) {
            btn.querySelector('.description').textContent = scenario.choices[i] || '';
            btn.classList.remove('locked', 'selected-path');
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
    selectedPath = null;
    document.getElementById('selectPathBtn').style.display = 'none';
}

function setupInteractions() {
    const buttons = document.querySelectorAll('.choice-node');
    buttons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            if (isRolling) return;
            
            // Check if path is locked (N/A or marked as locked)
            const choiceText = btn.querySelector('.description')?.textContent || '';
            const isNAPath = choiceText.trim() === 'N/A' || choiceText.includes('(Locked path)');
            
            if (isNAPath) {
                // Show locked notification popup
                showLockedPopup(btn);
                return;
            }
            
            if (btn.classList.contains('locked')) {
                showLockedPopup(btn);
                return;
            }
            
            // Highlight selected path
            document.querySelectorAll('.choice-node').forEach(b => b.classList.remove('selected-path'));
            btn.classList.add('selected-path');
            selectedPath = btn.id;
            document.getElementById('selectPathBtn').style.display = 'block';
        });
    });
}

function showLockedPopup(pathBtn) {
    // Remove existing popup if present
    const existingPopup = document.querySelector('.locked-popup');
    if (existingPopup) existingPopup.remove();
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'locked-popup';
    popup.innerHTML = 'This path is locked for you due to an economic barrier.';
    
    // Position popup near the clicked button
    const rect = pathBtn.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = (rect.left + rect.width / 2) + 'px';
    popup.style.top = (rect.top - 60) + 'px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.backgroundColor = '#E0543D';
    popup.style.color = '#fff';
    popup.style.padding = '12px 16px';
    popup.style.borderRadius = '8px';
    popup.style.fontSize = '0.95rem';
    popup.style.fontWeight = '600';
    popup.style.zIndex = '1000';
    popup.style.whiteSpace = 'nowrap';
    popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    popup.style.animation = 'fadeInOut 3s ease-in-out';
    
    document.body.appendChild(popup);
    
    // Remove popup after 3 seconds
    setTimeout(() => popup.remove(), 3000);
}

// Add animation styles
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
`;
document.head.appendChild(styleSheet);

function setupSelectPathButton() {
    const selectBtn = document.getElementById('selectPathBtn');
    if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
            if (!selectedPath) return;
            
            // Check if selected path is locked
            const selectedBtn = document.getElementById(selectedPath);
            if (selectedBtn) {
                const choiceText = selectedBtn.querySelector('.description')?.textContent || '';
                const isNAPath = choiceText.trim() === 'N/A' || choiceText.includes('(Locked path)');
                
                if (isNAPath || selectedBtn.classList.contains('locked')) {
                    showLockedPopup(selectedBtn);
                    return;
                }
            }
            
            // Save choice before navigating
            processChoice();
            
            // Proceed with normal navigation
            const href = selectBtn.getAttribute('onclick');
            if (href) {
                const match = href.match(/window\.location\.href='([^']+)'/);
                if (match) window.location.href = match[1];
            }
        });
        selectBtn.style.pointerEvents = 'auto';
        selectBtn.style.opacity = '1';
    }
}

function processChoice() {
    // Save the choice to playerChoices
    if (selectedPath) {
        const pathNumber = selectedPath.replace('choice-', '');
        const pathKey = `path${pathNumber}`;
        const playerChoices = JSON.parse(localStorage.getItem('playerChoices') || '{}');
        playerChoices['scenario2'] = pathKey;
        localStorage.setItem('playerChoices', JSON.stringify(playerChoices));
    }
    
    // Not used, navigation handled in setupSelectPathButton
}

// Add minimal style for selected path
const style = document.createElement('style');
style.innerHTML = `.choice-node.selected-path { outline: 3px solid #E0543D; box-shadow: 0 0 0 4px #fff3; z-index: 30; }`;
document.head.appendChild(style);

// Navigate to consequence page with current path selection
function navigateToConsequence(scenarioKey, currentPage) {
    if (selectedPath) {
        const pathNumber = selectedPath.replace('choice-', '');
        const pathKey = `path${pathNumber}`;
        
        // Save current selection
        localStorage.setItem('currentScenarioNumber', '2');
        localStorage.setItem('currentPathSelection', pathKey);
        localStorage.setItem('lastScenarioPage', currentPage);
    }
    window.location.href = 'orbtrajectory.html';
}
