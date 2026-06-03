# 3MF+Optimizer

Local-only Bambu Studio `.3mf` optimizer for 0.4 mm nozzle workflows.

**by Yasin Aribuga**

## Current build

v3.9 — Dark Mode / Modular Build / Soft Error Handling

## What it does

- Opens Bambu Studio `.3mf` files locally in the browser.
- Reads and patches process/support/fuzzy settings inside the 3MF package.
- Shows a change report before download.
- Exports a new optimized `.3mf` file.
- Keeps everything local; files are not uploaded to a server.

## Main features

- Turkish / English UI toggle.
- Light / Dark mode toggle; Light is default.
- Micron adaptive profiles:
  - 80 micron / 0.08 mm
  - 120 micron / 0.12 mm
  - 160 micron / 0.16 mm
  - 200 micron / 0.20 mm
- Bambu Cloud Strict mode.
- Yasin Aribuga Spec preset.
- Support Lab profiles:
  - Easy Remove
  - Balanced Tree
  - Close Contact
  - Max Separation
  - Yasin Support
- Texture / Fuzzy Override:
  - Keep existing
  - Fuzzy off
  - Subtle
  - Balanced
  - Strong
  - Yasin Spec texture
  - Yasin Lite texture
- Preset examples:
  - Lamp Shade Fuzzy 0.88
  - Sand & Paint Prep
  - Visual Polish
  - Functional Strength
  - Thin Wall / Organic
  - Fast Draft

## Documentation

- [Ayar Rehberi TR](docs/SETTINGS.md) — presetler, micron sistemi, support profilleri ve fuzzy ayarları.
- [Settings Guide EN](docs/SETTINGS_EN.md) — English guide for presets, micron behavior, supports, texture overrides, Cloud Strict, and troubleshooting.
- [Modular Structure](docs/MODULAR_STRUCTURE.md) — how the repo is organized and how presets can be split further.

## GitHub Pages

1. Upload these files to a new GitHub repository.
2. Go to **Settings → Pages**.
3. Select **Deploy from branch**.
4. Choose `main` and `/root`.
5. Open the published Pages URL.

## Local use

Just open `index.html` in a modern browser.

## Notes

After opening an optimized `.3mf` in Bambu Studio, slice the plate again. Existing preview/cache data inside a project can belong to the old slice.

## License

MIT
