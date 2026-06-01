# 3MF+Optimizer

A local, single-file web tool for optimizing Bambu Studio `.3mf` project settings.

Built for 0.4 mm nozzle workflows with micron-adaptive presets, support profiles, texture/fuzzy override presets, and a custom **Yasin Aribuga Spec** extracted from Tendril project settings.

## Features

- Runs locally in the browser.
- Opens and rewrites `.3mf` packages without uploading files to a server.
- Turkish / English interface.
- Micron-adaptive print profiles: 80, 120, 160, 200 micron.
- Support Lab: easy remove, balanced tree, close contact, max separation, Yasin Support.
- Texture / Fuzzy override: keep, off, subtle, balanced, strong, Yasin Spec, Yasin Lite.
- Manifest sync for Bambu Studio project overrides.
- Fixes invalid `support_style: slim` values.

## Usage

Open `index.html` in a modern browser, upload a `.3mf`, choose a preset, analyze/optimize, then download the optimized `.3mf`.

## Notes

This tool edits project/config settings inside 3MF packages. For final verification, open the optimized file in Bambu Studio and re-slice the plate.

## Author

by yasin aribuga
