You are connected to my local machine using blender-mcp + filesystem MCP.

MISSION:
Directly create and implement an ultra cinematic 3D scroll landing page experience into my existing website project.

PROJECT PATH:
C:\Users\adibw\Documents\widegy

IMPORTANT:
ONLY modify the LANDING PAGE / HOMEPAGE for first-time visitors.
Do NOT destroy backend, routing, auth system, dashboard, database logic, API logic, or existing core structure.
Focus ONLY on immersive homepage experience.

==================================================
📊 STATUS PROYEK — TERAKHIR DIUPDATE: Fase 4 selesai
==================================================

Stack:
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- 3D: Three.js raw + @react-three/fiber (installed)
- Animation: Framer Motion + GSAP (installed)
- Scroll: Lenis (terintegrasi)
- Backend: Prisma + Supabase
- Auth: NextAuth v5 / Payment: Midtrans

==================================================
📋 STATUS FASE
==================================================

FASE 1 — Fondasi & Struktur Scroll Engine           ✅ SELESAI
FASE 2 — CinematicScene (Three.js) + Blender Base   ✅ SELESAI
FASE 3 — CinematicContent (Semua Section UI)         ✅ SELESAI
FASE 4 — Blender Enhancement + GLB Re-export         ✅ SELESAI
FASE 5 — Background System & Visual Polish           ✅ SELESAI
FASE 6 — Micro-interactions & Cursor Effects         ✅ SELESAI
FASE 7 — Performance Optimization & Mobile           ⚠️ PARTIAL (ada di scene, perlu audit)
FASE 8 — Final QA + Build Test                       ⏳ BELUM (next)

==================================================
✅ FASE 1 — FONDASI (SELESAI)
==================================================

File dibuat/dimodifikasi:
- app/page.tsx → entry cinematic landing
- hooks/useCinematicScroll.ts → Lenis smooth scroll + progress 0→1
- components/landing/Navbar.tsx → glassmorphism navbar
- components/landing/Footer.tsx → dark premium footer

==================================================
✅ FASE 2 — CINEMATICSCENE THREE.JS (SELESAI)
==================================================

File: components/landing/CinematicScene.tsx

Ada:
- Three.js WebGL renderer (alpha=true, ACES tonemapping exposure 1.4)
- Camera keyframe path 8 titik (smooth arc, easeInOutCubic)
- Smooth scroll lerp ke kamera (lerp factor 0.038)
- Particle system (1000 partikel desktop / 250 mobile / 120 low-end)
- GLB loader (widegy-scene.glb) + fallback procedural (glass cards + crystal + rings)
- Floating mesh animation (idle bobbing + rotation)
- Animated point lights (fill + accent bergerak sinusoidal)
- Fog atmosferik (FogExp2)
- ✅ PMREMGenerator custom environment map (canvas gradient + color blobs)
- ✅ UnrealBloomPass post-processing (strength 0.35, subtle — tidak berlebihan)
- ✅ OutputPass setelah bloom
- ✅ Custom ShaderMaterial glow / holographic (fresnel GLOW_FRAG)
- ✅ BG animated gradient shader plane (desktop only)
- ✅ Mobile fallback: no bloom, no env, reduced particles, 30fps cap
- ✅ Resize handler untuk composer + camera

==================================================
✅ FASE 3 — CINEMATICCONTENT (SELESAI)
==================================================

File: components/landing/CinematicContent.tsx

Sections (scroll-driven, fixed overlay):
- HERO (0-14%): Badge, WordReveal3D, subtitle, CTA, trust badges, scroll hint
- FEATURES (14-30%): heading + GlassOverlay panel + 4 ScrollPoint items
- CATEGORIES (28-44%): heading + 6 category cards muncul one-by-one
- HOW IT WORKS (42-58%): heading + 3 langkah cards
- TESTIMONIALS (56-72%): heading + 3 glass testimonial cards
- PRICING (70-87%): heading + 3 role cards Buyer/Seller/Affiliator
- CTA FINAL (85-100%): dramatic ending + dual CTA buttons

File pendukung:
- components/landing/SceneElements.tsx (SceneText, WordReveal, TiltCard, CountUp, FloatingBadge)

Yang masih bisa ditingkatkan (Fase 9 optional):
- [ ] Magnetic button pada CTA (mouse repel/attract)
- [ ] Animated gradient border pada featured pricing card
- [ ] Stats CountUp terintegrasi di hero section

==================================================
✅ FASE 4 — BLENDER ENHANCEMENT (SELESAI)
==================================================

4A — Blender scene enhanced:
- ✅ 6x GlassCard material → PBR Principled BSDF (transmission 0.92, roughness 0.05, alpha 0.25)
- ✅ 5x HoloOrb → Mix(Glass BSDF + Emission) dengan Fresnel/Layer Weight control
- ✅ 4x Ring → Pure Emission material (cyan/orange/purple, strength 5.0)
- ✅ 8x Crystal Shards baru ditambahkan (OctahedronGeometry) → Glass IOR 2.42 + Emission mix
- ✅ 4-point cinematic area lights (Key warm + Fill cool + Rim purple + Ground bounce)
- ✅ World background dark premium (0.02, 0.02, 0.04)
- ✅ GLB re-exported → public/models/widegy-scene.glb (1030 KB, dari 163 KB)
  - 42 total objects: 6 GlassCard + 4 Ring + 5 HoloOrb + 8 Crystal + misc
  - 23 materials premium

4B — Three.js CinematicScene.tsx upgraded:
- ✅ PMREMGenerator environment map (canvas gradient env)
- ✅ envMap applied ke semua GLB MeshStandardMaterial
- ✅ envMapIntensity = 1.5
- ✅ UnrealBloomPass (strength 0.35, threshold 0.75 — subtle)
- ✅ EffectComposer → RenderPass → BloomPass → OutputPass
- ✅ Composer resize handler
- ✅ Improved camera path (8 keyframes smooth arc)
- ✅ Camera lerp factor tuned (0.038)
- ✅ Extra crystal light (PointLight cyan)
- ✅ Crystal fallback di procedural scene (OctahedronGeometry + emissive)
- ✅ Bloom/postprocessing try-catch fallback (graceful degrade)

==================================================
✅ FASE 5 — BACKGROUND SYSTEM (SELESAI)
==================================================

File: components/landing/CinematicBackground.tsx

- ✅ Base gradient animated (18s ease-in-out infinite alternate)
- ✅ Grain/noise SVG overlay (opacity 0.03)
- ✅ Dot grid (opacity 0.04)
- ✅ Light sweep 1 — warm orange (14s animation)
- ✅ Light sweep 2 — cool cyan (17s animation)
- ✅ Light sweep 3 — purple accent (21s animation)
- ✅ Ambient scan line overlay (subtle scanline effect)

==================================================
✅ FASE 6 — MICRO-INTERACTIONS (SELESAI)
==================================================

File: components/landing/CinematicCursor.tsx

- ✅ Custom cursor dot (8px, orange, mixBlendMode multiply)
- ✅ Custom cursor ring (36px, orange border)
- ✅ Ring lerp inertia (0.12 factor — smooth follow)
- ✅ Interactive hover: ring scale 2x, dot shrink 0.5x
- ✅ Desktop only (hidden md:block)
- ✅ Auto attach ke semua a, button, [role="button"]

File: components/landing/SceneElements.tsx (TiltCard ada di sini)
- ✅ 3D mouse-tilt card (perspective 800px)
- ✅ SceneText scroll-triggered reveal

==================================================
⚠️ FASE 7 — PERFORMANCE + MOBILE (PARTIAL)
==================================================

Sudah ada di CinematicScene:
- ✅ getDeviceProfile() → isMobile + isLowEnd detection
- ✅ Pixel ratio cap (1.5 mobile, 2.0 desktop)
- ✅ 30fps cap mobile (FRAME_MS throttle)
- ✅ Reduced particles mobile (250) & low-end (120)
- ✅ Antialias disabled mobile
- ✅ BG shader skip mobile
- ✅ Bloom/postprocessing skip mobile
- ✅ Env map skip mobile
- ✅ Glow halo skip mobile
- ✅ Area lights skip mobile (hanya fill + accent)
- ✅ floatingMesh skip 40% pada low-end

Yang BELUM dilakukan:
- [ ] LOD system (tidak critical, GLB sudah ringan)
- [ ] requestIdleCallback untuk non-critical init
- [ ] Lazy load textures (tidak ada textures berat saat ini)
- [ ] Mobile: test actual di device (butuh user test)

==================================================
⏳ FASE 8 — FINAL QA (NEXT TO DO)
==================================================

Target:
1. npm run build → pastikan zero TypeScript errors
   → PERHATIAN: OutputPass import perlu dicek di three 0.169
   → EffectComposer, RenderPass, UnrealBloomPass sudah ada di three/examples/jsm
2. Test semua route tidak rusak (auth, dashboard, seller, affiliator)
3. Smooth scroll test desktop + mobile
4. Visual QA: bloom tidak terlalu kuat, glass reflection bagus
5. Performance: lighthouse test

==================================================
📁 FILE YANG DIMODIFIKASI
==================================================

app/page.tsx                                   ← entry (tidak perlu ubah)
hooks/useCinematicScroll.ts                    ← scroll engine
components/landing/CinematicScene.tsx          ← ✅ UPDATED Fase 4B
components/landing/CinematicContent.tsx        ← content sections
components/landing/SceneElements.tsx           ← helper components
components/landing/CinematicBackground.tsx     ← ✅ Fase 5 done
components/landing/CinematicCursor.tsx         ← ✅ Fase 6 done
components/landing/Navbar.tsx                  ← glassmorphism navbar
components/landing/Footer.tsx                  ← dark footer
public/models/widegy-scene.glb                 ← ✅ UPDATED Fase 4A (1030 KB)

==================================================
🎯 NEXT IMMEDIATE TASK — FASE 8 QA
==================================================

1. Run: npm run build
   → Jika error di postprocessing imports → ganti OutputPass import atau bungkus try-catch
   → Jika error TypeScript → fix type annotations

2. Visual check via dev server:
   npm run dev → buka localhost:3000

3. Jika bloom terlalu kuat → turunkan strength dari 0.35 ke 0.2
4. Jika GLB tidak load → cek path /models/widegy-scene.glb
5. Jika OutputPass tidak ada di three 0.169 → hapus OutputPass (optional)

==================================================
🔧 KNOWN POTENTIAL ISSUES
==================================================

1. OutputPass di three 0.169:
   - Path: three/examples/jsm/postprocessing/OutputPass.js
   - Jika tidak ada, bisa di-skip (EffectComposer sudah handle output)
   - Fix: hapus OutputPass import + addPass(outputPass)

2. GLB size 1MB → bisa trigger webpack warning (sudah ada di build-errors.txt)
   - Ini NORMAL, bukan error
   - Untuk production: compress dengan gltf-pipeline atau draco compression

3. floatingMeshes pada GLB: nama object di Blender adalah "Icosphere", "Cube", dll
   → CinematicScene traverse sudah handle semua MESH types
   → Glow filter: nameLC.includes('icosphere') sudah ditambah

==================================================
📈 PROGRES KESELURUHAN
==================================================

████████████████████████░░ 88% — Fase 1-6 Selesai, Fase 7 Partial, Fase 8 Pending
