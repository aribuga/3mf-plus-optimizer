# 3MF+Optimizer — Settings Guide

This guide explains the presets, micron system, support profiles, fuzzy/texture overrides, and Cloud Strict behavior used by 3MF+Optimizer.

> Quick flow: upload a `.3mf` → choose a preset → choose micron/layer height → optionally choose support and texture overrides → **Analyze & optimize** → review the diff → download the new `.3mf` → open it in Bambu Studio and slice the plate again.

---

## 1. Core idea

3MF+Optimizer opens a Bambu Studio `.3mf` project locally in the browser and patches process/config data inside the package. Files are not uploaded to a server.

The app tries to do three things at the same time:

1. **Patch setting values** such as `wall_loops`, `layer_height`, `support_top_z_distance`, and `fuzzy_skin_thickness`.
2. **Sync Bambu Studio’s project override manifest** so modified settings are also listed in `different_settings_to_system` when needed.
3. **Protect cloud/printer binding** by avoiding risky machine, host, filament, and printer override fields when Cloud Strict is enabled.

---

## 2. Recommended workflow

After opening an optimized file in Bambu Studio:

1. Check the settings in **Prepare**.
2. Go to **Preview → Slice plate**.
3. Do not trust old preview/cache data stored in the project.
4. If printer/cloud selection looks wrong, close the file and re-optimize from the clean original `.3mf`, with Cloud Strict on.

Recommended safe starting point:

```txt
Cloud Strict: On
Preset: as needed
Micron: 120 or 160
Support Mode: Keep or Tree Slim
Support Profile: Profile Default / Easy Remove / Yasin Support
Texture Override: Profile Default or Keep Existing
```

---

## 3. Micron / Layer Height system

Micron selection is not just `layer_height`. When layer height changes, the app can also adapt speed, support spacing, top/bottom shell layer counts, and texture density.

| Micron | Layer height | Use case | Note |
|---:|---:|---|---|
| 80 micron | 0.08 mm | Ultra detail / small objects | Slow. Support and fuzzy texture need more control. |
| 120 micron | 0.12 mm | Main quality profile | Default recommendation for visual pieces and lamp shades. |
| 160 micron | 0.16 mm | Production / speed-quality balance | Very useful when fuzzy skin hides layer lines. |
| 200 micron | 0.20 mm | Fast prototype | More visible stepping on spheres and organic surfaces. |

For 0.4 nozzle workflows and 0.88 mm shell targets, line width usually stays stable:

```txt
Nozzle: 0.4 mm
Default line width: 0.42 mm
Outer wall line width: 0.42 mm
Inner wall line width: 0.46 mm
Wall loops: 2
```

Reason:

```txt
0.42 outer + 0.46 inner ≈ 0.88 mm
```

---

## 4. Main presets

### Yasin Aribuga Spec

Captured from the preferred `Tendril_base_v4.3mf` 0.12 mm setup. It keeps the strong organic texture and critical support behavior.

```txt
Layer height: 0.12
Wall loops: 3
Line width: 0.42
Sparse infill: 18%
Infill pattern: gyroid
Fuzzy skin: external / contour
Fuzzy thickness: 0.22
Fuzzy point distance: 0.30
Support: tree(auto) + tree_hybrid
Support threshold angle: 55
Support top Z distance: 0.24
Support bottom Z distance: 0.12
Interface top layers: 4
Support on build plate only: on
```

Best use:

```txt
Preset: Yasin Aribuga Spec
Micron: 120
Support Mode: Keep
Support Profile: Profile Default or Yasin Support
Texture Override: Profile Default or Yasin Spec texture
```

### Lamp Shade Fuzzy 0.88

For spherical or organic lamp shade parts with roughly 0.88 mm shell thickness.

```txt
Layer height: 0.12
Wall loops: 2
Outer wall: 0.42
Inner wall: 0.46
Infill: 0%
Top shell: 0 or minimal
Bottom shell: 1
Seam: random
Fuzzy: outside only
Fuzzy thickness: 0.10
Fuzzy point distance: 0.60
```

For a clean top rim, keep the body fuzzy but disable fuzzy on the last 5–10 mm in Bambu Studio with a modifier. The site does not add geometry modifiers automatically.

### Sand & Paint Prep

For parts that will be sanded, primed, and painted. It disables fuzzy, uses a stronger shell, and keeps surfaces more predictable.

```txt
Fuzzy: off
Layer height: 0.12
Wall loops: 4
Infill: 10% gyroid
Top shell: strong
Bottom shell: strong
Outer wall speed: slower
Seam: back / aligned
Ironing: off by default
```

---

## 5. Support Lab

Support is separated into two decisions.

### Support engine

```txt
Keep existing support engine
Disable support
Enable Tree Slim
Enable Normal / Snug support
```

### Support profile

```txt
Profile default / do not touch
Easy Remove
Balanced Tree
Close Contact
Max Separation
Yasin Support
```

How to read the profiles:

- **Easy Remove** increases top Z distance. Supports come off more easily and usually leave fewer marks, but undersides can be looser.
- **Balanced Tree** balances removal and underside quality.
- **Close Contact** keeps supports closer to the model for cleaner undersides, but removal can be harder and marks can increase.
- **Max Separation** keeps supports farthest from the model; marks are minimized, but heavy overhangs can sag.
- **Yasin Support** applies the captured Tendril setup: `tree_hybrid`, 55°, top Z 0.24, bottom Z 0.12, interface top 4.

Important fields:

```txt
support_top_z_distance
support_bottom_z_distance
support_interface_top_layers
support_interface_spacing
support_object_xy_distance
tree_support_branch_distance
tree_support_branch_diameter
tree_support_wall_count
```

---

## 6. Texture / Fuzzy Override

Texture override can intentionally ignore the current file’s fuzzy settings and write a new texture profile.

```txt
Profile default
Keep fuzzy settings from file
Fuzzy off
Subtle texture
Balanced texture
Strong texture
Yasin Spec texture
Yasin Lite texture
```

Key behaviors:

- **Profile default** uses the selected preset’s texture.
- **Keep file** writes no fuzzy keys and preserves the `.3mf` as-is.
- **Fuzzy off** disables fuzzy skin.
- **Subtle / Balanced / Strong** adapt by micron.
- **Yasin Spec texture** is fixed at `0.22 / 0.30` and does not change by micron.
- **Yasin Lite texture** is a safer, thinner texture for lamp shade shells.

At 120 micron:

```txt
Subtle:     thickness 0.08 / point distance 0.80
Balanced:   thickness 0.10 / point distance 0.60
Strong:     thickness 0.14 / point distance 0.45
Yasin Spec: thickness 0.22 / point distance 0.30
Yasin Lite: thickness 0.10 / point distance 0.60
```

---

## 7. Cloud Strict

Cloud Strict reduces the chance that a patched `.3mf` makes Bambu Studio treat the project as a custom/local printer setup.

When enabled, the app avoids or removes risky override fields such as:

```txt
machine slot overrides
printer_variant
nozzle_diameter manifest overrides
host_type
printhost_* fields
filament_* manifest overrides
nozzle_temperature manifest overrides
fan/bed/cloud-risky active overrides
```

It focuses on process settings instead: walls, layer height, support spacing, fuzzy texture, speed, infill, and shell behavior.

---

## 8. Dark Mode

v3.9 adds a Light/Dark theme selector. Light is the default. The selected theme is saved in browser `localStorage`.

This affects only the UI. It does not write anything into the `.3mf` file.

---

## 9. Soft error handling

The app now surfaces common failures inside the UI instead of only failing in the browser console.

Examples:

- unsupported file type
- corrupted ZIP/3MF package
- encrypted archive
- non-Bambu Studio 3MF, such as Cura/Prusa-style 3MF missing `Metadata/project_settings.config`

The app does not try to “repair” non-Bambu files. It asks for a clean Bambu Studio `.3mf` export.

---

## 10. Troubleshooting

### “The settings appear unchanged in Bambu Studio”

Make sure the app updates `Metadata/project_settings.config` and `different_settings_to_system`. Then slice the plate again. Old preview/cache data can be misleading.

### “Supports leave too many marks”

Try:

```txt
Support Profile: Easy Remove or Max Separation
Increase top Z distance
Use Tree Slim / tree_hybrid
Keep support on build plate only when possible
```

### “Undersides sag too much”

Try:

```txt
Support Profile: Balanced Tree or Close Contact
Lower top Z distance
Enable interface layers
Slow overhang speeds
Increase cooling
```

### “Fuzzy top rim is rough”

Keep fuzzy on the body, but disable fuzzy on the last 5–10 mm using a Bambu Studio modifier.

---

## 11. Modular repo structure

v3.9 separates app assets so future preset work is easier:

```txt
index.html
assets/css/styles.css
assets/js/app.js
assets/js/presets-reference.json
docs/SETTINGS.md
docs/SETTINGS_EN.md
docs/MODULAR_STRUCTURE.md
```

The current runtime preset logic is in `assets/js/app.js`. `assets/js/presets-reference.json` is a human-readable preset reference file for future extraction/refactor work.
