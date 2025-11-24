/* Re:Live - Phase 2 Interface
  Static SVG background with interactive choice nodes
*/

// Scenario data (from CSV)
const scenarios = [
    {
        description: 'You pull on the male conductor\'s uniform. It fits poorly, erasing your shape. It makes you look "decent" and masculine.',
        choices: [
            'Wear the uniform same way every other conductor friend of yours wears.',
            'Carry a small jasmine garland (gazra/malipu) in your pocket instead of directly decorating yourself with it.',
            'Alter your shirt to fit in a little more feminine way, claiming "it shrank in the wash" if asked.',
            'N/A'
        ]
    },
    {
        description: 'Before the shift, drivers and conductors gather at a chai stall. They casually tease you about the way you walk.',
        choices: [
            'Laugh it off since it was meant as a joke only.',
            'Drink your chai in silence, ignoring the conversation until the bus is ready.',
            'Leave the group to sit alone on the bus, isolating yourself further.',
            'Jokingly embrace it and comment back "Hey, I walk with grace".'
        ]
    },
    {
        description: 'In between stops, you are tired and lean against the rail near the ladies\' seats. A female passenger says, "This is for ladies, why are you standing so close? Go to the mens side!"',
        choices: [
            'Move instantly to the crowded mens area to avoid making any women uncomfortable.',
            'Defend yourself by saying "Madam, I am just doing my job, the bus is full."',
            'Ignore her and stand your ground but turn your back to her.',
            'Respond assertively but professionally.'
        ]
    },
    {
        description: 'During peak hour, the bus is really cramped. You push past people to sit at your assigned seat feeling uncomfortable with how aware you are of your body.',
        choices: [
            'Maneuver your heavy ticket bag to cover yourself like a shield.',
            'Say "Move inside! Don\'t crowd the door!" hoping to make some space for yourself.',
            'Try to endure it until the next stop, but accidentally end up hitting a passenger.',
            'N/A'
        ]
    },
    {
        description: 'You were late for lunch break and overhear other conductors share food and whispering about how weird you talk and act.',
        choices: [
            'Finish food quickly and return to the safety of the empty bus.',
            'Ignore their comments pretending you don\'t hear so you don\'t have to eat alone.',
            'Confront them and ask, "Do you have a problem with it? How is it affecting you?".',
            'N/A'
        ]
    },
    {
        description: 'You complain to your friend about your coworkers. He sighs, "Look, you are a man. Be tough. If you act soft, people will take advantage. Adjust a little."',
        choices: [
            'Agree silently, knowing nothing you do will matter.',
            'Try to talk to your deputy manager to change your route to a less crowded one. (Locked path)',
            'Fake sickness to get a few days off immediately.',
            'N/A'
        ]
    },
    {
        description: 'After years of this cycle, the emotional and physical toll becomes unbearable. You must decide whether to quit. You have no savings, no degree. Just the knowledge that you cannot step on that bus again.',
        choices: [
            'Resign citing "severe back pain" to leave on good terms.',
            'Slowly, don\'t show up. Just go on your own new path now.',
            '"I cannot work in this environment." (Manager will likely mock you).',
            'Ask for a transfer to a less crowded, safer route/time slot or not so public role which you know they won\'t give.'
        ]
    },
    {
        description: 'With no higher education, the job search is limited. The few positions available require uncomfortable binary uniforms.',
        choices: [
            'Take the job offered, accepting the compromise for stability.',
            'Try to negotiate a gender neutral uniform or dress code exception.',
            'Refuse all jobs requiring a uniform, narrowing options to almost zero.',
            'Keep looking for a better opportunity.'
        ]
    },
    {
        description: 'You meet some other trans women who share your loss and experiences. Joining your new friend on the street, you realise that everyone is clapping and exaggerating to get people to recognise them as trans and give them money. This feels a little odd and forced to you.',
        choices: [
            'Clap quietly, hoping the saree does the work.',
            'Mimic the others perfectly, adopting the loud clap and blessing gestures for survival.',
            'N/A',
            'N/A'
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
    selectBtn.addEventListener('click', () => {
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
        
        isRolling = true;
        document.body.style.cursor = 'wait';
        // Disable all buttons during processing
        document.querySelectorAll('.choice-node').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        setTimeout(() => {
            document.querySelectorAll('.choice-node').forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
            });
            processChoice();
            isRolling = false;
            document.body.style.cursor = 'default';
        }, 1000);
    });
}

function processChoice() {
    // Save the choice to playerChoices
    if (selectedPath) {
        const pathNumber = selectedPath.replace('choice-', '');
        const pathKey = `path${pathNumber}`;
        const playerChoices = JSON.parse(localStorage.getItem('playerChoices') || '{}');
        playerChoices['scenario1'] = pathKey;
        localStorage.setItem('playerChoices', JSON.stringify(playerChoices));
    }
    
    currentScenarioIndex++;
    if (currentScenarioIndex === 1) {
        // After first scenario, go to the duplicate page for Task 2
        window.location.href = 'new-phase-2-task2.html';
        return;
    }
    if (currentScenarioIndex < scenarios.length) {
        renderScenario(currentScenarioIndex);
    } else {
        alert('Journey complete!');
        window.location.href = 'index-combined.html';
    }
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
        localStorage.setItem('currentScenarioNumber', '1');
        localStorage.setItem('currentPathSelection', pathKey);
        localStorage.setItem('lastScenarioPage', currentPage);
    }
    window.location.href = 'orbtrajectory.html';
}
