---
name: Apple-Style Component Visualization
colors:
  surface: '#151312'
  surface-dim: '#151312'
  surface-bright: '#3c3838'
  surface-container-lowest: '#100e0d'
  surface-container-low: '#1e1b1a'
  surface-container: '#221f1e'
  surface-container-high: '#2d2929'
  surface-container-highest: '#383433'
  on-surface: '#e8e1df'
  on-surface-variant: '#d3c3c0'
  inverse-surface: '#e8e1df'
  inverse-on-surface: '#33302f'
  outline: '#9c8e8b'
  outline-variant: '#4f4442'
  surface-tint: '#e2beb8'
  primary: '#fff2ef'
  on-primary: '#412b26'
  primary-container: '#f5d0c9'
  on-primary-container: '#735752'
  inverse-primary: '#745853'
  secondary: '#c5c6cc'
  on-secondary: '#2e3035'
  secondary-container: '#47494e'
  on-secondary-container: '#b7b8be'
  tertiary: '#e3faf3'
  on-tertiary: '#213430'
  tertiary-container: '#c7ddd7'
  on-tertiary-container: '#4e625d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#e2beb8'
  on-primary-fixed: '#2a1613'
  on-primary-fixed-variant: '#5a413c'
  secondary-fixed: '#e2e2e8'
  secondary-fixed-dim: '#c5c6cc'
  on-secondary-fixed: '#191c20'
  on-secondary-fixed-variant: '#45474c'
  tertiary-fixed: '#d1e7e1'
  tertiary-fixed-dim: '#b5cbc5'
  on-tertiary-fixed: '#0b1f1b'
  on-tertiary-fixed-variant: '#374b46'
  background: '#151312'
  on-background: '#e8e1df'
  surface-variant: '#383433'
  ui-coral: '#F5D0C9'
  ui-rose-gold: '#E7C1B8'
  core-space-gray: '#2C2E33'
  core-midnight: '#1A1C1E'
  data-sage: '#B2C2B9'
  data-teal: '#8BAAA5'
  repo-white: '#F2F2F2'
  repo-silver: '#C0C0C0'
  connection-silver: '#E0E0E0'
typography:
  node-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  category-header:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  detail-body:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  connection-thickness: '0.05'
  node-gap-md: 2rem
  slab-height: 0.25rem
  pill-scale: '0.5'
---

    1 # Design: Elegant "Apple-Style" Component Visualization
    2
    3 ## Objective
    4 Elevate the visual aesthetic of the component graph from a basic "blue hologram" look to a highly polished, minimalist, and premium design inspired by Apple's design language (think visionOS or sleek physical product
      design). The visualization should feel tactile, clean, and effortlessly distinguishable.
    5
    6 ## Proposed Design Changes
    7
    8 ### 1. Premium Materials (Goodbye Holograms)
    9 Instead of glowing, unlit neon boxes, we will utilize physically based rendering (PBR) to create materials that look like premium physical objects or sleek glass.
   10 - **Material Choice**: We will use the existing `PBR.mat` / `simple_pbr.ss_graph` assets.
   11 - **Finishes**: Configure the PBR materials in Lens Studio to have:
   12   - **Sleek Matte/Anodized Aluminum**: High roughness, metallic feel for infrastructural components.
   13   - **Glossy/Ceramic**: Low roughness, high smoothness for UI or central modules.
   14   - **Frosted Glass**: If opacity settings allow, a slight transparency with blur.
   15
   16 ### 2. Refined Minimalist Color Palette
   17 We will implement a curated, muted color palette based on component `category` to replace the monolithic blue.
   18 - **UI Components**: Soft, warm pastel coral or rose gold.
   19 - **Backend/Core**: Sleek space gray or deep midnight blue.
   20 - **Data Access/State**: Subtle sage green or muted teal.
   21 - **Repository/Folders**: Crisp matte white or brushed silver.
   22
   23 ### 3. Tactile Geometry (Shapes)
   24 Apple design favors rounded, organic, and friendly shapes over sharp, primitive cubes.
   25 - **Dynamic Meshes**: We will use `Sphere.mesh`, `Cylinder.mesh` (scaled down to look like sleek coins or pills), and standard boxes.
   26 - **Mapping by `type`**:
   27   - `component` (e.g., React components): Shallow, wide cylinders (like physical buttons or coins).
   28   - `module` (e.g., backend services): Perfect spheres (representing core logic orbs).
   29   - `subsystem` / `directory`: Standard boxes (representing foundational blocks), but we will adjust their scale to look more like sleek slabs rather than chunky cubes.
   30
   31 ### 4. Elegant Typography and Labeling
   32 - Ensure the text contrast is optimal (e.g., crisp white text on darker nodes, or dark gray text on light nodes).
   33 - We will tweak the `setNodeText` function in `CityGenerator.js` to ensure the label placement is perfectly centered or elegantly floating above the node, with a refined scale.
   34
   35 ### 5. Connection Lines
   36 - Instead of thick, blocky connection lines, we will make the connections thinner and subtler so they don't distract from the nodes themselves. We can apply a sleek, slightly emissive white or silver material to the
      connections.
   37
   38 ## Summary of Actionable Steps
   39 1. Modify `CityGenerator.js` to include `@input` fields for the refined color palette and the `Sphere` and `Cylinder` meshes.
   40 2. Update the `spawnNode` function to dynamically assign the geometry (mesh) based on `nodeData.type`.
   41 3. Update the `spawnNode` function to dynamically set the `baseColor` of the node's PBR material based on `nodeData.category`.
   42 4. Adjust the connection thickness input (`@input float connectionThickness = 0.05`) to be much thinner and elegant.
   43 5. In Lens Studio (manual step after script changes), the developer will ensure the Node Prefab uses a high-quality PBR material with appropriate roughness/metallic settings.
