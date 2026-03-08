This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

add react three fiber

create step forms or 
step into interactions for each branch of my experience/interest

in R3F: woods and hiking theme

start at the living tree
CTA: Start Journey
walk down path
click on trees, animals, rocks to see more
# Animation Instructions
------
1. 
npm install three @react-three/fiber @react-three/drei
npm install @react-three/rapier          # physics (optional but great for interactions)
npm install gsap                          # animation timeline control
npm install @types/three                  # TypeScript types
>>> npm install three @react-three/fiber @react-three/drei @react-three/rapier gsap @types/three  

2. 
update next.config:
transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

3. directory structure
src/
├── app/
│   └── story/
│       └── page.tsx              ← Main story page
├── components/
│   └── forest/
│       ├── ForestScene.tsx        ← Root Canvas component
│       ├── HikerCharacter.tsx     ← Animated hiker
│       ├── Tree.tsx               ← Clickable trees
│       ├── Rock.tsx               ← Clickable rocks
│       ├── Animal.tsx             ← Clickable animals (deer, bird, etc.)
│       ├── ForestFloor.tsx        ← Ground, fog, lighting
│       ├── StoryOverlay.tsx       ← MUI dialog/drawer for story text
│       └── useStoryState.ts       ← State machine for chapters

install zustand for usestoryState

key architecture decisions
dynamic(() => import(...), { ssr: false }) — non-negotiable for any R3F component in Next.js
Zustand for story state — avoids prop-drilling across the deep 3D tree
GSAP for camera choreography — far smoother than useFrame lerp for cinematic moves
MUI overlaid via position: absolute — keeps MUI in DOM, R3F in WebGL, no conflicts
Suspense wraps all 3D assets so GLTF models load gracefully


Recommended GLTF Models
Once your structure is solid, replace the primitives with real models:

Sketchfab / Poly Pizza / quaternius.com — free low-poly forest packs
Use useGLTF from @react-three/drei to load .glb files
Place models in public/models/ and reference as /models/tree.glb

Want me to now scaffold the full working codebase for this, or dive deeper into any specific piece — like the GSAP chapter transitions, the hiker walk animation, or loading real GLTF models?



Rabbit disappears after being clicked (fled state) — its dialog still fires first
ChapterLighting inside ForestFloor lerps the sun position each frame as chapters change, so light smoothly shifts from morning → golden hour without a hard cut
GrassField uses InstancedMesh so 500 grass blades cost roughly the same as 1 mesh
HikerCharacter walks continuously via useFrame and GSAP moves it to the correct trail position when the chapter changes — both animations run simultaneously


todo:
1. improve visuals: npm install @react-three/postprocessing
quaternius.com — free low-poly nature packs, perfect for this
kenney.nl — nature kit with trees, rocks, animals
Sketchfab — search "low poly forest" with downloadable GLB filter
Place your .glb files in public/models/.
2. route to story page smoothly, spa-like
3. change to immersed, 1 person view, lose hiker character