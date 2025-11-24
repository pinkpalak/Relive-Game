# Phase 2 Background Images Setup

## Overview
Phase 2 now uses your sketch images as backgrounds with interactive choice nodes overlaid on top. The choice buttons are positioned to align with the sketched paths.

## Steps to Set Up Your Sketch Images

### 1. Save Your Images
- Save the first sketch image (basic scenario with 4 paths) as: **`scenario-1.png`**
- Save the second sketch image (scenario with lock overlay) as: **`scenario-2.png`**
- Place both files in the same folder as `new-phase-2.html`

### 2. Update the JavaScript Configuration
Open `new-phase-2.js` and update the `scenarioBackgrounds` array (around line 20):

```javascript
let scenarioBackgrounds = [
    'scenario-1.png',   // First scenario (all 4 paths available)
    'scenario-2.png',   // Second scenario (path 3 locked)
    'scenario-3.png',   // Add more scenarios as needed
    'scenario-4.png'
];
```

### 3. Current Choice Node Positions
The choice nodes are positioned as follows based on the sketch design:

| Choice | Position | CSS Selector |
|--------|----------|--------------|
| Path 1 | Bottom Left (20% from bottom, 10% from left) | `#choice-1` |
| Path 2 | Top Left (20% from top, 8% from left) | `#choice-2` |
| Path 3 | Top Right (10% from top, 15% from right) | `#choice-3` [LOCKED] |
| Path 4 | Mid Right (45% from top, 10% from right) | `#choice-4` |

### 4. Adjusting Choice Node Positions
If your sketch images differ in layout, adjust the CSS positioning in `new-phase-2.css`:

```css
/* Path 1: Bottom Left */
#choice-1 {
    bottom: 20%;  /* Adjust this value */
    left: 10%;    /* Adjust this value */
}

/* Path 2: Top Left */
#choice-2 {
    top: 20%;     /* Adjust this value */
    left: 8%;     /* Adjust this value */
}

/* Path 3: Top Right (LOCKED) */
#choice-3 {
    top: 10%;     /* Adjust this value */
    right: 15%;   /* Adjust this value */
}

/* Path 4: Mid Right */
#choice-4 {
    top: 45%;     /* Adjust this value */
    right: 10%;   /* Adjust this value */
}
```

## Image Requirements

### Dimensions
- Recommended: 1200x800px or wider (maintains aspect ratio)
- Minimum: 800x600px

### Format
- PNG, JPG, or WebP
- Transparency supported (PNG)

### Design Considerations
- Images should show the hand-drawn "sketchy" paths as shown in your design
- Ensure paths are clearly distinguishable
- Leave space around edges for choice node buttons (not covered by main artwork)

## How It Works

1. **Background Layer** (`#background-container`): Displays the scenario image
2. **UI Layer** (`#ui-layer`): Sits on top with interactive choice nodes
3. **Choice Nodes** (`.choice-node`): Positioned buttons that align with paths in the image
4. **Scenario Card** (`#scenario-card`): Bottom-right card with scenario description
5. **Lock Overlay**: Tooltip that appears when hovering over locked paths

## Testing

1. Open `new-phase-2.html` in a web browser
2. You should see your background image with 4 choice buttons overlaid
3. Hover over choices to see the scale animation
4. Click a choice to select it (locked paths prevent selection)
5. After 1.5 seconds, the game advances to the next scenario

## Dynamic Scenario Loading

The system supports cycling through multiple scenario backgrounds:

```javascript
// Advance to next scenario
currentScenarioIndex++;
loadScenario(currentScenarioIndex);
```

The backgrounds will cycle through the `scenarioBackgrounds` array. When you reach the end, the game will return to the character creation page.

## Customization

### Change Scenario Descriptions
Edit in `new-phase-2.html`:
```html
<article id="scenario-card">
    <h2 class="scenario-title">Scenario Title</h2>
    <div class="scenario-text">
        <p>Your scenario description here...</p>
    </div>
</article>
```

### Adjust Choice Labels
Edit in `new-phase-2.html`:
```html
<button class="choice-node" id="choice-1" data-path="1">
    <div class="choice-content">
        <span class="label">Path 1</span>
        <p class="description">Your choice description here</p>
    </div>
</button>
```

### Change Lock Reason
Edit in `new-phase-2.html`:
```html
<div class="lock-overlay">
    <div class="lock-icon"><!-- SVG lock icon --></div>
    <div class="lock-text">
        <strong>Locked</strong>
        <p>Your custom lock reason here</p>
    </div>
</div>
```

## Integration with Game State

The `handleChoiceSelection()` function in `new-phase-2.js` can be extended to:
- Update character metrics (dignity, survival, authenticity)
- Track player choices
- Update localStorage with journey progress
- Apply scenario consequences

Example extension:
```javascript
function processChoice(choiceId, choiceData) {
    console.log(`Selected ${choiceId}`);
    
    // Update metrics
    // updateMetrics(choiceData);
    
    // Load next scenario
    currentScenarioIndex++;
    loadScenario(currentScenarioIndex);
}
```

## Troubleshooting

**Images not loading:**
- Verify file paths are correct
- Check file names match exactly (case-sensitive on Linux)
- Ensure image files are in the same directory as `new-phase-2.html`

**Choice buttons off-screen:**
- Adjust the CSS positioning values in `new-phase-2.css`
- Use browser DevTools to inspect element positions
- Test on different screen sizes

**Locked button not showing lock overlay:**
- Ensure `#choice-3` has the `locked` class
- Check CSS z-index values if overlay is hidden behind other elements

---

For additional help, check the comments in `new-phase-2.js` and `new-phase-2.css`.
