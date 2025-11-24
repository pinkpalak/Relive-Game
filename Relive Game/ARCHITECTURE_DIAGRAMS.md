# Relive Game - Complete Architecture

## High-Level User Journey Flow

```
┌──────────────┐
│  relive-index   │  Entry point with "Enter World" button
│  .html       │  - Shows Relive Home SVG background
└──────┬───────┘  - Animated fade-in
       │
       ▼
┌──────────────┐
│  intro.html  │  6-slide intro sequence
│              │  - Displays Intro 1.svg → Intro 6.svg
└──────┬───────┘  - "Next" button advances slides
       │
       ▼
┌──────────────┐
│ archive.html │  Archive page with clickable center dot
│              │  - Shows Archive.svg background
│              │  - Pink circular button (#FEC7C3) in center
└──────┬───────┘  - "Click a dot to relive the story" message
       │
       ▼
┌──────────────┐
│ orb-demo     │  Character introduction & orb visualization
│ .html        │  - Shows Orb Reference 1.svg
│              │  - Character scenario description
└──────┬───────┘  - "Enter" button to start journey
       │
       ▼
┌──────────────┐
│ new-phase-2  │  First decision point (Task 1)
│ .html        │  - Canvas with central void + 4 paths
│              │  - User makes first choice
└──────┬───────┘  - Saves to playerChoices in localStorage
       │
       ▼
┌──────────────┐
│ new-phase-2  │  Subsequent tasks (Task 2)
│ -task2.html  │  - Similar structure to Task 1
└──────┬───────┘  - Additional decision points
       │
       ▼
┌──────────────┐
│ phase2-task3 │  Tasks 3-9 continue the journey
│ through      │  - Each task presents new scenario
│ phase2-task9 │  - User navigates choices
│ .html        │  - Choices affect trajectory metrics
└──────┬───────┘  - Dignity, survival, authenticity tracked
       │
       ▼
┌──────────────┐
│ orbtrajectory│  Trajectory visualization modal
│ .html        │  - Shows curve based on choices
│              │  - Displays survival & dignity meters
└──────┬───────┘  - Transient preview of selections
       │
       ▼
┌──────────────┐
│  end.html    │  Thank you & feedback page
│              │  - Shows Relive Home SVG background
│              │  - Notebook-style textarea for notes
│              │  - Submit to Firebase/server/localStorage
└──────────────┘  - Link to archive.html
```

## Detailed Page Architecture

### 1. relive-index.html (Entry Point)

```
┌─────────────────────────────────────────────────┐
│           Game Home (1280×832px)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Background: Relive Home.svg (cover)            │
│  Overlay: Translucent gradient                  │
│                                                 │
│              [Center Content]                   │
│                                                 │
│         ┌─────────────────────┐                 │
│         │   Enter World ▶     │                 │
│         └─────────────────────┘                 │
│                                                 │
│           (Button: #E0543D)                     │
│           onClick → intro.html                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. intro.html (Slideshow Sequence)

```
┌─────────────────────────────────────────────────┐
│           Intro Slideshow (Fullscreen)          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Background: Intro [1-6].svg (contain)          │
│                                                 │
│  Slides Array:                                  │
│    • Reference Documents/Intro 1.svg            │
│    • Reference Documents/Intro 2.svg            │
│    • Reference Documents/Intro 3.svg            │
│    • Reference Documents/Intro 4.svg            │
│    • Reference Documents/Intro 5.svg            │
│    • Reference Documents/Intro 6.svg            │
│                                                 │
│                                    ┌──────────┐ │
│                                    │   Next   │ │
│                                    └──────────┘ │
│                         (Bottom-right, 8vh gap) │
│                                                 │
│  Logic:                                         │
│    • Click Next: idx++                          │
│    • Last slide: navigate to archive.html      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. archive.html (Archive Navigation)

```
┌─────────────────────────────────────────────────┐
│           Archive Page (Fullscreen)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Background: Archive.svg (cover)                │
│                                                 │
│     ┌───────────────────────────────────┐       │
│     │  Archive                          │       │
│     │  ────────────────────────────────  │       │
│     │  Click a dot to relive the story  │       │
│     └───────────────────────────────────┘       │
│              (Translucent overlay)              │
│                                                 │
│                     ●                           │
│              (Pink button #FEC7C3)              │
│              onClick → orb-demo.html            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. orb-demo.html (Character Introduction)

```
┌─────────────────────────────────────────────────┐
│         Orb Demo (Character Setup)              │
├─────────────────────────────────────────────────┤
│                                                 │
│            ┌───────────────┐                    │
│            │  Orb SVG      │                    │
│            │  (Orb Ref 1)  │                    │
│            └───────────────┘                    │
│                                                 │
│     ┌─────────────────────────────────┐         │
│     │ Character Description Card      │         │
│     │ ───────────────────────────────  │         │
│     │ You are a bus conductor...      │         │
│     └─────────────────────────────────┘         │
│                                                 │
│                              ┌────────┐         │
│                              │ Enter  │         │
│                              └────────┘         │
│                     onClick → new-phase-2.html  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. Phase 2 Task Pages (Decision Journey)


```
┌─────────────────────────────────────────────────────┐
│           BROWSER VIEWPORT (Full Screen)            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │     CANVAS LAYER (z-index: 0)                │   │
│  │  ─────────────────────────────────────────   │   │
│  │  Deep Black Background (#050505)             │   │
│  │                                              │   │
│  │         Central Void                         │   │
│  │       (White Glow Aura)                      │   │
│  │           ▲                                  │   │
│  │          ╱ ╲                                 │   │
│  │         ╱   ╲                                │   │
│  │        ╱     ╲                               │   │
│  │       ╱ Path 3╲ (DIMMED/LOCKED)            │   │
│  │      ╱         ╲                             │   │
│  │  Path 2         Path 4                       │   │
│  │  (lighter)      (lighter)                    │   │
│  │    ╲           ╱                             │   │
│  │     ╲         ╱                              │   │
│  │      ╲       ╱                               │   │
│  │       ╲     ╱                                │   │
│  │        ╲   ╱                                 │   │
│  │         ╲ ╱                                  │   │
│  │        Path 1                                │   │
│  │       (lighter)                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │     UI LAYER (z-index: 10) [Above Canvas]   │   │
│  │  ─────────────────────────────────────────   │   │
│  │                                              │   │
│  │  □ Choice 1          □ Choice 3 [LOCKED]    │   │
│  │  (Bottom Left)       (Top Right - Dimmed)    │   │
│  │                                              │   │
│  │  □ Choice 2          □ Choice 4              │   │
│  │  (Top Left)          (Mid Right)             │   │
│  │                                              │   │
│  │           ┌────────────────────────┐         │   │
│  │           │     SCENARIO CARD      │         │   │
│  │           │  ─────────────────────  │         │   │
│  │           │  The air grows heavy   │         │   │
│  │           │  as the ribbons of     │         │   │
│  │           │  reality fracture...   │         │   │
│  │           └────────────────────────┘         │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

Task Sequence:
  new-phase-2.html → new-phase-2-task2.html → 
  phase2-task3.html → phase2-task4.html → phase2-task5.html →
  phase2-task6.html → phase2-task7.html → phase2-task8.html →
  phase2-task9.html → orbtrajectory.html → (loop or end.html)

Each task:
  • Presents a scenario card
  • Offers 4 path choices
  • User selects path (stores in localStorage.playerChoices)
  • "Select Path" button advances to next task
  • Optional orb trajectory popup shows progress
```

### 6. orbtrajectory.html (Visualization Modal)

```
┌─────────────────────────────────────────────────┐
│        Orb Trajectory Visualization             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │   Canvas: Trajectory Curve                │  │
│  │   ────────────────────────────────────    │  │
│  │                                           │  │
│  │      Start •                              │  │
│  │             ╲                             │  │
│  │              ╲   (Quadratic Bezier)       │  │
│  │               ●  Scenario 3               │  │
│  │              ╱                             │  │
│  │             ╱                              │  │
│  │      End   •                              │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────┐        ┌──────────────┐      │
│  │  Survival    │        │  Dignity     │      │
│  │     72%      │        │     58%      │      │
│  └──────────────┘        └──────────────┘      │
│    (Conic gradient dials)                      │
│                                                 │
│  Features:                                      │
│    • Reads localStorage.playerChoices          │
│    • Calculates normalized percentages         │
│    • balance = (survival% - dignity%) / 100    │
│    • Draws curve with dynamic height           │
│    • Transient preview support (tempChoice)    │
│    • Debug overlay (optional)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7. end.html (Thank You & Feedback)

```
┌─────────────────────────────────────────────────┐
│            End Page (Thank You)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Background: Relive Home.svg (bottom-aligned)   │
│  Overlay: Subtle dark gradient                  │
│                                                 │
│          [Content Bottom-Center]                │
│                                                 │
│     Thank you for reliving this life!           │
│     Leave a note about your experience...       │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ ┊                                         │  │
│  │ ┊  Notebook-style textarea               │  │
│  │ ┊  • Background: #FDFAF0                 │  │
│  │ ┊  • Left margin line (red accent)       │  │
│  │ ┊  • Ruled lines (repeating gradient)    │  │
│  │ ┊                                    ╔═══╗│  │
│  │ ┊                                    ║Sub║│  │
│  │ ┊                                    ╚═══╝│  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Submit → Firebase Firestore / POST /api/notes │
│         → localStorage fallback                 │
│                                                 │
│  Word count: 0 / 100 words                      │
│                          [See archive] link     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Data Flow & State Management

```
User Journey State:
  
localStorage Schema:
  ├─ playerChoices (object)
  │  ├─ scenario1: "path2"
  │  ├─ scenario2: "path1"
  │  └─ ... (9 scenarios total)
  │
  └─ relive_notes_archive (array)
     ├─ { note: "...", wordCount: 45, timestamp: "..." }
     └─ ...

Trajectory Calculation:
  1. Load playerChoices from localStorage
  2. Map each choice to survival/dignity scores
  3. Sum scores across all scenarios
  4. Normalize with explicit min/max ranges
  5. Calculate balance = (survival% - dignity%) / 100
  6. Plot curve with dynamic maxCurve based on canvas height
  7. Draw scenario markers along curve

Transient Preview:
  • applyTempChoice(scenario, path) sets tempChoice
  • calculateScores includes tempChoice in effective choices
  • clearTempChoice() removes preview without persisting
  • openOrbPopup() applies transient preview on selection
```

## Rendering Pipeline

```
┌─────────────────────────────────────────────┐
│        Page Load (new-phase-2.html)         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│    Document Ready, Script Loads             │
│    ─────────────────────────────────────    │
│    • Get canvas element reference           │
│    • Get 2D rendering context               │
│    • Attach event listeners                 │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│    Window.onload Event Fires                │
│    ─────────────────────────────────────    │
│    • resizeCanvas()                         │
│    • setupInteractions()                    │
│    • animate() [Start loop]                 │
└────────────┬────────────────────────────────┘
             │
             ▼
     ┌───────────────────┐
     │  Animation Loop   │
     │  (60fps / 16ms)   │
     └────────┬──────────┘
              │
       ┌──────┴──────────────────────────────┐
       │  Every Frame:                       │
       │  • ctx.clearRect() - clear frame    │
       │  • drawSketchyBackground()          │
       │  • requestAnimationFrame() - next   │
       └──────┬───────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │  drawSketchyBackground()        │
    │  ─────────────────────────────  │
    │  1. Set fill style to black     │
    │  2. Fill entire canvas          │
    │  3. Calculate center point      │
    │  4. Call drawSingularity()      │
    │  5. For each of 4 choices:      │
    │     - Get button element        │
    │     - Check lock status         │
    │     - Call drawSketchyRibbon()  │
    └─────────────────────────────────┘
```

## Interaction Flow

```
User Action → Event Handler → State Change → Visual Update
     │              │               │              │
     ▼              ▼               ▼              ▼

 HOVER        Button mouseenter   path.isHovered  Button scales
 OVER              event              = true       to 1.05x
 CHOICE
     │
     ├─► Click Listener Added ──────────────────────────┐
     │                                                  │
     ▼                                                  │
 CLICK ON      handleChoiceSelection()               │
 CHOICE   • isRolling = true                         │
 (1-4)    • Disable all buttons (opacity 0.5)        │
 │        • Cursor → 'wait'                          │
 ├─► setTimeout(1500ms)                              │
 │        • processChoice(choiceId, data)            │
 │        • Re-enable buttons (opacity 1.0)          │
 │        • Cursor → 'default'                       │
 │        • Show alert confirmation                  │
 │        • Increment scenario index                 │
 │                                                    │
 ▼                                                    │
 LOCK ON    Check locked class       Prevent button  │
 CHOICE 3   • Return early from      from responding │
            • Click handler          to clicks       │
            • Show lock overlay      Lock tooltip    │
                                     appears         
```

## Data Persistence

```
User Creates Character
  │
  └─► Character Data Object
      ├─ name: "Character Name"
      ├─ environment: "School"
      ├─ action: "Coming Out"
      ├─ description: "..."
      ├─ drawing: [canvas imageData]
      └─ journey:
         ├─ gender: null
         ├─ metrics:
         │  ├─ dignity: 100
         │  ├─ survival: 100
         │  └─ authenticity: 100
         └─ choices: []
  │
  └─► Saved to localStorage.characterLibrary
      (Array of character objects)
  │
  └─► Redirect to new-phase-2.html
      │
      ├─► Retrieve from localStorage
      │
      ├─► User Makes Choice
      │
      ├─► Update character.journey.choices
      │   Update character.journey.metrics
      │   Add to character.journey log
      │
      └─► Save Back to localStorage
```

## Component Hierarchy

```
new-phase-2.html
├── <head>
│   └── Stylesheets
│       └── new-phase-2.css
│
├── <body>
│   └── <main id="game-container">
│       │
│       ├── <canvas id="visuals-canvas">
│       │   │ Layer 0: Canvas Drawing
│       │   ├── Background Fill
│       │   ├── Central Singularity
│       │   │   ├── Outer Glow (gradient)
│       │   │   ├── Inner Dark Circle
│       │   │   ├── Radial Strokes
│       │   │   └── Jittery Scribbles
│       │   └── 4x Sketchy Ribbons
│       │       ├── Path 1 (Bottom Left)
│       │       ├── Path 2 (Top Left)
│       │       ├── Path 3 (Top Right - Dimmed)
│       │       └── Path 4 (Mid Right)
│       │
│       └── <section id="ui-layer">
│           │ Layer 1: Interactive Elements
│           │
│           ├── <div id="choices-container">
│           │   ├── <button id="choice-1">
│           │   │   ├── Label: "Path 1"
│           │   │   ├── Description: "Approach..."
│           │   │   └── Connector Line
│           │   │
│           │   ├── <button id="choice-2">
│           │   ├── <button id="choice-3" class="locked">
│           │   │   └── <div class="lock-overlay">
│           │   │       ├── Lock Icon (SVG)
│           │   │       └── Lock Reason
│           │   │
│           │   └── <button id="choice-4">
│           │
│           └── <article id="scenario-card">
│               ├── <h2>Scenario Title</h2>
│               └── <div class="scenario-text">
│                   └── <p>Scenario description...</p>
│
└── <script src="new-phase-2.js">
    │ Layer 2: Logic & Interactivity
    │
    ├── Canvas Setup
    │   ├── Get context
    │   ├── Bind events
    │   └── Start animation
    │
    ├── Rendering Functions
    │   ├── animate()
    │   ├── drawSketchyBackground()
    │   ├── drawSingularity()
    │   └── drawSketchyRibbon()
    │
    ├── Interaction Functions
    │   ├── setupInteractions()
    │   ├── handleChoiceSelection()
    │   └── processChoice()
    │
    └── State Variables
        ├── isRolling
        ├── currentScenarioIndex
        └── canvas context
```

## Sketchy Effect Algorithm

```
For each path from center to choice button:

Draw 6 overlapping strokes:

Stroke 1: ╭──╮
          ╰──╯  (with jitter variation 1)

Stroke 2:  ╭──╮
           ╰──╯  (with jitter variation 2)

Stroke 3:   ╭──╮
            ╰──╯  (with jitter variation 3)

... repeat ...

Result:  ╭─╭──╮─╮
         │ ╰──╯ │   (appears hand-drawn!)
         ╰──────╯


Jitter applied to control points:
  offset = ±(Math.random() * 10 - 5) pixels

Line width varies:
  2-5px random per stroke

Opacity based on lock:
  Normal: rgba(180, 180, 180, 0.4)
  Locked: rgba(100, 100, 100, 0.15)

Base ribbon beneath:
  25px wide, lower opacity
  Creates depth effect
```

## Lock System State Diagram

```
                    ┌──────────────┐
                    │   UNLOCKED   │
                    │  (Normal)    │
                    └──────┬───────┘
                           │
                    ▼      │      ▲
              ┌─────────────┼─────────────┐
              │             │             │
          Visual        Hover        Click
          • Bright      • Scale       • Process
          • Full        • +5%         • 1.5s
            opacity     • Show        • Update
                          desc        metrics
              │             │             │
              └─────────────┼─────────────┘
                            │
                     ┌──────▼────────┐
                     │   LOCKED      │
                     │  (Dimmed)     │
                     └──────┬────────┘
                            │
                    ▼       │       ▲
              ┌─────────────┼─────────────┐
              │             │             │
          Visual        Hover        Click
          • Gray        • No scale   • Blocked
          • 90%         • Show lock  • Return
            opacity       tooltip      early
              │             │             │
              └─────────────┼─────────────┘
                            │
                     Can be unlocked by:
                     • In-game condition
                     • Metric threshold
                     • Story progression
                     • Explicit call to
                       remove 'locked' class
```

## Color Palette

```
Background & Base
  ┌─ Deep Black (#050505)          Main background
  ├─ Near Black (#0a0a0a)         Singularity core
  └─ Very Dark Gray (#1e1e1e)     Lock tooltip bg

Paths & Details
  ├─ Light Gray (#dcdcdc)         Choice button bg
  ├─ Medium Gray (rgb(180,180,180))  Normal paths
  ├─ Dim Gray (rgb(100,100,100))   Locked paths
  ├─ Light Gray (#b0b0b0)         Locked button
  └─ White (#ffffff)               Glow, highlights

Gradients
  ├─ White → Gray → Transparent   Singularity glow
  ├─ Radial for depth effect      Light source
  └─ Opacity variations create    Visual hierarchy
    layering effect
```

## State Machine

```
                    ┌──────────────┐
                    │    IDLE      │◄───────┐
                    │   (Waiting)  │        │
                    └──────┬───────┘        │
                           │                │
                    User clicks choice      │
                           │                │
                           ▼                │
                    ┌──────────────┐        │
                    │  PROCESSING  │        │
                    │  (1500ms)    │        │
                    └──────┬───────┘        │
                           │                │
                    Animation completes     │
                           │                │
                           ▼                │
                    ┌──────────────┐        │
                    │  COMPLETE    │        │
                    │  (Feedback)  │        │
                    └──────┬───────┘        │
                           │                │
                    Show alert, update      │
                           │                │
                           └────────────────┘
                                 Back to IDLE
```

## Complete Navigation Map

```
                    relive-index.html (Entry)
                           ↓
                      intro.html (6 slides)
                           ↓
                      archive.html (Hub)
                           ↓
                      orb-demo.html
                           ↓
                   new-phase-2.html (Task 1)
                           ↓
                new-phase-2-task2.html (Task 2)
                           ↓
                   phase2-task3.html (Task 3)
                           ↓
                   phase2-task4.html (Task 4)
                           ↓
                   phase2-task5.html (Task 5)
                           ↓
                   phase2-task6.html (Task 6)
                           ↓
                   phase2-task7.html (Task 7)
                           ↓
                   phase2-task8.html (Task 8)
                           ↓
                   phase2-task9.html (Task 9)
                           ↓
                 orbtrajectory.html (Summary)
                           ↓
                      end.html (Feedback)
                           ↓
                  archive.html (Return to hub)
```

## Memory Layout (Runtime)

```
DOM Elements (Phase 2 Tasks)
  ├─ canvas#visuals-canvas (2D context)
  ├─ section#ui-layer (contains choices)
  ├─ button#choice-1 (event listeners attached)
  ├─ button#choice-2 (event listeners attached)
  ├─ button#choice-3 (event listeners attached, locked class)
  ├─ button#choice-4 (event listeners attached)
  └─ article#scenario-card

JavaScript Variables
  ├─ canvas (reference)
  ├─ ctx (2D context)
  ├─ uiLayer (reference)
  ├─ isRolling (boolean: false/true)
  ├─ currentScenarioIndex (number: 0+)
  └─ animationId (requestAnimationFrame ID)

Trajectory Renderer (orbtrajectory.js)
  ├─ window.trajectoryRenderer (shared instance)
  ├─ TrajectoryTracker
  │  ├─ loadChoices() → reads localStorage
  │  ├─ calculateScores() → returns normalized %
  │  ├─ getTrajectoryPath() → returns balance
  │  ├─ applyTempChoice() → preview mode
  │  └─ clearTempChoice() → remove preview
  └─ TrajectoryRenderer
     ├─ render() → main update loop
     ├─ drawTrajectory() → quadratic Bezier
     ├─ drawMarkers() → scenario dots
     └─ updateMeters() → conic gradient dials

Browser Storage
  └─ localStorage
     ├─ playerChoices (object)
     │  └─ { scenario1: "path2", scenario2: "path1", ... }
     ├─ relive_notes_archive (array)
     │  └─ [ {note, wordCount, timestamp}, ... ]
     └─ window.__FIREBASE_CONFIG__ (optional)
        └─ { apiKey, projectId, ... }

Canvas Buffer
  └─ ImageData (pixels being drawn)
     ├─ Background fill (#050505)
     ├─ Central singularity (glow + radial strokes)
     ├─ 4× Sketchy ribbon paths
     └─ Trajectory curve (orbtrajectory canvas)
```

## Technology Stack

```
Frontend:
  ├─ HTML5 (semantic markup)
  ├─ CSS3 (gradients, animations, backdrop-filter)
  ├─ Vanilla JavaScript (no frameworks)
  └─ Canvas 2D API (drawing paths & trajectory)

Assets:
  ├─ SVG backgrounds (Relive Home, Archive, Intro 1-6, Orb Reference)
  └─ Inline SVG icons (buttons, UI elements)

Storage:
  ├─ localStorage (primary client-side storage)
  ├─ Firebase Firestore (optional serverless backend)
  └─ Server POST /api/notes (optional custom backend)

Libraries:
  └─ Firebase Compat SDK (dynamically loaded when configured)
```

## Color Palette

```
Primary Colors:
  ├─ Accent Red: #E0543D (buttons, highlights)
  ├─ Deep Black: #050505 (canvas background)
  ├─ Near Black: #0A0A0A (page backgrounds)
  └─ Notebook Beige: #FDFAF0 (textarea background)

UI Grays:
  ├─ Light Gray: #DCDCDC (choice buttons)
  ├─ Medium Gray: rgb(180,180,180) (normal paths, 40% opacity)
  ├─ Dim Gray: rgb(100,100,100) (locked paths, 15% opacity)
  └─ Muted Text: #9A9A9A (secondary text)

Gradients:
  ├─ Singularity Glow: radial white → transparent
  ├─ Page Overlays: linear rgba(6,6,6,0.22) → rgba(6,6,6,0.22)
  └─ Meter Dials: conic-gradient based on percentage

Pink Accent:
  └─ Archive Button: #FEC7C3 (center dot button)
```

## Key Interaction Patterns

```
Hover Effects:
  • Buttons scale to 1.05× on hover
  • Paths show descriptions on mouseover
  • Cursor changes to pointer over interactive elements

Click Handlers:
  • Path selection → stores to playerChoices
  • "Select Path" button → navigates to next task
  • Center pink dot (archive) → navigates to orb-demo
  • Submit button (end.html) → posts note + shows confirmation

Animation Loop (Phase 2 canvas):
  requestAnimationFrame() at 60fps
    ↓
  clearRect() entire canvas
    ↓
  drawSketchyBackground()
    ├─ Fill black background
    ├─ drawSingularity() at center
    └─ For each path: drawSketchyRibbon()
       ├─ Draw base wide path
       └─ Draw 6 jittered strokes on top

Trajectory Rendering:
  render() called on modal open or choice change
    ↓
  calculateScores() → normalized percentages
    ↓
  getTrajectoryPath() → balance value
    ↓
  drawTrajectory()
    ├─ Compute quadratic Bezier control point
    ├─ Draw curve with dynamic maxCurve
    └─ Call drawMarkers() for scenario dots
    ↓
  updateMeters()
    ├─ Set CSS --percentage custom property
    ├─ Update numeric labels
    └─ Update debug overlay (if present)
```

## File Organization

```
Root Level:
  ├─ relive-index.html          (entry point)
  ├─ intro.html              (slideshow)
  ├─ archive.html            (hub with pink button)
  ├─ orb-demo.html           (character intro)
  ├─ new-phase-2.html        (task 1)
  ├─ new-phase-2-task2.html  (task 2)
  ├─ phase2-task3.html       (task 3)
  ├─ phase2-task4.html       (task 4)
  ├─ phase2-task5.html       (task 5)
  ├─ phase2-task6.html       (task 6)
  ├─ phase2-task7.html       (task 7)
  ├─ phase2-task8.html       (task 8)
  ├─ phase2-task9.html       (task 9)
  ├─ orbtrajectory.html      (trajectory modal/standalone)
  ├─ end.html                (feedback page)
  ├─ orbtrajectory.js        (trajectory renderer)
  ├─ orbtrajectory-popup.js  (modal injection handler)
  ├─ firebase-config.js      (optional Firestore config)
  ├─ Archive.svg             (archive background)
  └─ ...

Reference Documents/ (SVG assets):
  ├─ Relive Home.svg
  ├─ Archive.svg
  ├─ Intro 1.svg
  ├─ Intro 2.svg
  ├─ Intro 3.svg
  ├─ Intro 4.svg
  ├─ Intro 5.svg
  ├─ Intro 6.svg
  └─ Orb Reference 1.svg
```

---

This architecture ensures smooth rendering, responsive interaction, and clean data flow from entry through completion of the Relive game experience.
