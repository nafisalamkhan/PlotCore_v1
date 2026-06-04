# PlotCore_v1

A cyberpunk-themed polar curve animator that visualizes **Rose curves** and **Limaçons** with animated tracing, polar + cartesian graphs, and key points data.

Created by **[Nafis Alam Khan](https://github.com/nafisalamkhan)**

<img src="src/assets/logo.png" alt="PlotCore" width="50" height="50" style="border-radius: 10px;">

## Features

- **Rose curves** (`r = a·cos(nθ)`, `r = a·sin(nθ)`) with configurable amplitude `a` and petal count `n`
- **Limaçons** (`r = a ± b·cos(θ)`, `r = a ± b·sin(θ)`) with configurable `a`, `b`, and operator
- **Dual graph view** — polar and cartesian graphs displayed side-by-side
- **Animated tracing** — play/pause/step-forward/step-back/restart/reset controls with progress bar
- **Key points data table** — horizontal table showing `r` and `θ` values for critical points, scoped per period and replicated across the full range
- **Dark/Light theme toggle** — cyberpunk dark theme (`#66fcf1` / `#b026ff`) and clean light theme
- **Download images** — save polar graph as PNG (equation included in filename)
- **Responsive** — adapts from desktop to tablet to mobile with touch-friendly targets

## Usage

1. Select **Rose** or **Limaçon** from the sidebar tabs
2. Adjust parameters (`a`, `b`, `n`, function, operator)
3. Click **Generate** to compute and start animation
4. Use the control buttons to play/pause/step through the trace
5. Toggle dark/light mode with the sun/moon button in the header
6. Click the download icon on the polar graph to save as PNG

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — build tool
- **p5.js** — polar graph rendering
- **Canvas 2D API** — cartesian graph rendering
- **mathjs** — mathematical evaluation
- **CSS custom properties** — theming (dark/light)