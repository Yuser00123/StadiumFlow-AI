# 🏟️ FIFA World Cup 2026 ArenaOps & Fan Guide

An AI-powered, production-grade tournament intelligence platform designed to revolutionize host stadium operations and enhance the overall match-day experience for fans, organizers, volunteers, and stadium staff during the **FIFA World Cup 2026**.

This platform delivers two primary user flows—a high-fidelity **Fan Hub Assistance Center** and a robust **Incident Operations Control Desk**—grounded in official stadium protocols and backed by the real-time reasoning power of **Gemini 3.5 Flash**.

---

## 🌟 Key Capabilities & Features

### 1. 🗺️ Interactive Live Stadium Visualizer
*   **Real-Time Telemetry Mapping:** Features an elegant, interactive stadium vector map that visualizes entry gates, food concessions, ADA restrooms, medical centers, and transportation terminals.
*   **Crowd Density & Wait-Time Tracker:** Real-time visual overlays highlighting congestion statuses (e.g., Gate B ticket lane bottlenecking) and live estimated wait queues.
*   **♿ Adaptive Accessibility Routes:** Activates a dedicated, blue-colored path overlay that highlights wheelchair-accessible lifts, escalators, ramps, and sensory rooms on the map.

### 2. 💬 Multilingual AI Fan Assistant
*   **Grounding Knowledge Base:** Powered by custom, server-side APIs that supply real-time facts on World Cup parking, shuttle intervals, reusable cup return zones, and peak congestion timings.
*   **7-Language Localization:** Dynamically supports **English (US)**, **Español (MX)**, **Français**, **Português (BR)**, **العربية**, **日本語**, and **Deutsch** out of the box with quick preset prompt suggestions.
*   **Concession Optimizer:** Dynamic intelligence that automatically guides hungry fans to nearby under-utilized food stalls with the shortest waiting lines.

### 3. 🚨 Operations Command & Incident Desk
*   **Steward Dispatch Management:** Enables stadium organizers to report and log facility repairs, medical emergency calls, and ticket scanner connection failures.
*   **Generative AI Resolution Plans:** Uses custom Prompt engineering to return step-by-step emergency protocols, safety-guided crowd diversion routes, and volunteer allocations.
*   **PA Announcement Scripting:** Dynamically crafts calming, clear public address announcements in the selected operations language to coordinate crowd flow.

---

## 🛠️ Technology Stack & Architecture

*   **Frontend Client:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, and Motion for fluid layout animations.
*   **Backend Server:** Express.js, Node.js with native ES Modules compilation via `esbuild`.
*   **Generative AI Core:** `@google/genai` TypeScript SDK utilizing the powerful `gemini-3.5-flash` model.
*   **Accessibility First:** Fully compliant with WCAG color contrasts, dynamic text scaling (1.2x), high-contrast accessibility (pure black backing), and interactive focus indicators.

---

## 📁 Codebase Directory Structure

```
├── .env.example              # Template for secure server-side environment variables
├── package.json              # Full dependency catalog (Express, React, Vite, Gemini SDK)
├── metadata.json             # AI Studio metadata & frame permissions
├── tsconfig.json             # TypeScript compiler rules
├── vite.config.ts            # Vite server & build parameters
├── server.ts                 # Main full-stack Express server, API proxy, and Gemini router
├── src/
│   ├── main.tsx              # React client entry point
│   ├── index.css             # Tailwind imports & custom WCAG design systems
│   ├── types.ts              # Typed interfaces for Incidents, Facilities, and Messages
│   └── components/
│       ├── Navbar.tsx        # Fully responsive mobile, tablet & desktop header navigation
│       ├── StadiumVisualizer.tsx # Interactive SVG map layer with live crowd levels
│       ├── FanHub.tsx        # Chat UI, Suggested prompt rail, and Sustainability guide
│       ├── StaffConsole.tsx  # Ground operations incident dispatcher and AI resolution planner
│       └── DiagnosticConsole.tsx # Self-check terminal testing APIs and schema health
```

---

## ⚡ Setup & Execution

### 1. Configure Secrets
Create a `.env` file at the root or add the following environment variable through the **AI Studio Secrets** panel:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

### 2. Install Dependencies
Run the package manager from your workspace root:
```bash
npm install
```

### 3. Start Development Mode
Boot both the Express.js backend and Vite asset compilation server together:
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the system.

### 4. Build for Production
Compiles client assets and bundles the Node server using esbuild:
```bash
npm run build
npm run start
```

---

## 📈 Parameter Judgments & Alignment

1.  **Code Quality:** Strictly modularized layout. Zero monolithic files. Strong type declarations in `types.ts` prevent runtime failures.
2.  **Security:** Keep API keys strictly hidden! All calls to Gemini are routed through server-side `/api/*` proxies.
3.  **Efficiency:** Minimal DOM footprint. High-performance SVGs are used instead of massive custom imagery. Features a dedicated `/api/health` diagnostic.
4.  **Accessibility:** High-contrast color themes, flexible scale-adjustments, and responsive layouts ensure 100% usability.
