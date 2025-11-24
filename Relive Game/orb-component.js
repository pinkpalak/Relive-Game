// Orb Component: Game Master / Storyteller
// Usage: Include in your HTML and call Orb.showMessage(text)

class Orb {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            document.body.appendChild(this.container);
        }
        this.container.className = 'orb-master-container';
        this.renderOrb();
        this.createMessageBox();
    }

    renderOrb() {
        // Create SVG orb made of tiny dots
        const size = 120;
        const dotCount = 48;
        let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;">
            <g>`;
        for (let i = 0; i < dotCount; i++) {
            const angle = (2 * Math.PI * i) / dotCount;
            const r = 48 + Math.random() * 8;
            const x = size / 2 + r * Math.cos(angle);
            const y = size / 2 + r * Math.sin(angle);
            svg += `<circle cx="${x}" cy="${y}" r="4" fill="#E0543D" opacity="${0.7 + Math.random() * 0.3}" />`;
        }
        // Central core
        svg += `<circle cx="${size/2}" cy="${size/2}" r="28" fill="#fff" opacity="0.95" />`;
        svg += `</g></svg>`;
        this.container.innerHTML = `<div class="orb-visual">${svg}</div>`;
    }

    createMessageBox() {
        // Message box for orb narration
        this.messageBox = document.createElement('div');
        this.messageBox.className = 'orb-message-box';
        this.container.appendChild(this.messageBox);
    }

    showMessage(text) {
        this.messageBox.innerHTML = `<span>${text}</span>`;
        this.messageBox.style.opacity = 1;
    }

    hideMessage() {
        this.messageBox.style.opacity = 0;
    }
}

// Minimal styles for orb
const orbStyle = document.createElement('style');
orbStyle.innerHTML = `
.orb-master-container {
    position: fixed;
    bottom: 48px;
    left: 48px;
    z-index: 1002;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.orb-visual {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
}
.orb-message-box {
    background: rgba(20,20,20,0.92);
    color: #fff;
    font-size: 1.18rem;
    border-radius: 16px;
    padding: 18px 32px;
    box-shadow: 0 4px 18px rgba(224,84,61,0.12);
    min-width: 220px;
    max-width: 340px;
    text-align: center;
    opacity: 1;
    transition: opacity 0.3s;
}
`;
document.head.appendChild(orbStyle);

// Example usage:
// const orb = new Orb('game-orb');
// orb.showMessage('Welcome, adventurer! Your quest begins...');
// orb.hideMessage();
