# Relive Game - Quick Reference

## 🎮 Current Implementation

**Relive** is a complete interactive storytelling experience from entry through reflection, capturing personal narrative decisions with trajectory visualization.

## Quick Navigation

| Page | Purpose |
|------|---------|
| relive-index.html | Entry point with SVG background |
| intro.html | 6-slide introduction |
| archive.html | Central hub with pink button |
| orb-demo.html | Character introduction |
| new-phase-2.html - phase2-task9.html | 9 interactive tasks |
| orbtrajectory.html | Trajectory visualization |
| end.html | Feedback collection form |

## Game Flow

1. relive-index.html → "Enter World" button
2. intro.html → 6 slides with navigation
3. archive.html → Pink center button launches journey
4. orb-demo.html → Character intro
5. new-phase-2.html through phase2-task9.html → 9 decision tasks with canvas paths
6. orbtrajectory.html → Trajectory visualization with meters
7. end.html → Notebook feedback form (max 100 words)
8. Return to archive.html to replay

---

## Data Storage

### localStorage.playerChoices
```javascript
{
  "scenario1": "path1",
  "scenario2": "path2",
  // ... through scenario9
}
```

### localStorage.relive_notes_archive
```javascript
[
  { note: "User feedback", wordCount: 45, timestamp: "2025-11-25T14:30:00Z" }
]
```

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Graphics**: SVG backgrounds + Canvas 2D (60fps)
- **Storage**: localStorage (+ optional Firebase/server)
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary Accent | Red-orange | #E0543D |
| Deep Black | Black | #050505 |
| Notebook Background | Beige | #FDFAF0 |
| Center Button | Pink | #FEC7C3 |

## Key Features

✅ Complete journey from entry to exit
✅ 9 interactive decision points
✅ Canvas-based trajectory visualization
✅ Meter dials for metrics (Survival & Dignity)
✅ Responsive design (mobile/tablet/desktop)
✅ Persistent data collection
✅ Optional cloud backends

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not persisting | Check localStorage enabled in browser |
| Canvas not rendering | Verify JavaScript errors in console |
| Paths not clickable | Ensure CSS stylesheets are loaded |
| Trajectory not showing | Verify choices were saved correctly |

## Production Status

**Status**: ✅ **PRODUCTION READY**

All components functional and integrated. Ready to launch!

---

For detailed documentation, see:
- ARCHITECTURE_DIAGRAMS.md
- PHASE2_BACKGROUND_SETUP.md
- PHASE2_IMPLEMENTATION.md
- PHASE2_READY.md
- PHASE2_FINAL_SUMMARY.md
