# Modular Structure

v3.9 moves the single-file prototype toward a cleaner GitHub-ready structure.

```txt
index.html                  # UI markup + JSZip CDN include
assets/css/styles.css       # visual system, light/dark mode, responsive layout
assets/js/app.js            # optimizer logic, presets, patching, UI events
assets/js/presets-reference.json  # readable preset reference for future refactor
docs/SETTINGS.md            # Turkish settings guide
docs/SETTINGS_EN.md         # English settings guide
```

## Why not fully external JSON yet?

The optimizer still needs synchronous preset rules while patching `.3mf` entries, and many rules are paired with helper functions such as micron scaling, support profiles, texture overrides, Cloud Strict filtering, and manifest syncing.

The next clean step is to move pure preset data out of `app.js` while keeping transform functions in code:

```txt
assets/data/presets.json
assets/data/support-profiles.json
assets/data/texture-profiles.json
assets/js/app.js
```

For now, the app is modular enough for GitHub maintenance while keeping local/offline behavior predictable.
