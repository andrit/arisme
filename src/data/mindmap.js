// ─────────────────────────────────────────────────────────────────
// src/data/mindmap.js
//
// Single source of truth for the skills mindmap.
// Edit GRAPH_CONFIG to tweak visual settings.
// Edit NODES to add / update your skills.
// Edit CROSS_LINKS to add phase-3 cross-discipline connections.
// ─────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════
// GRAPH CONFIG  — all visual + simulation settings in one place
// ═══════════════════════════════════════════════════════════════
export const GRAPH_CONFIG = {

  // ── Domain hex node ──────────────────────────────────────────
  domainNode: {
    radius:      40,    // circumradius of the hexagon (px)
    strokeWidth: 1.5,
  },

  // ── Weight scale (1–5) ───────────────────────────────────────
  // Controls how skill nodes look at each experience level.
  // hasDash:  dashed border ring (signals "not yet solid")
  // hasHalo:  faint outer ring (anchors the node visually)
  weights: [
    { value: 1, label: 'Curious',    radius: 10, fillOpacity: 0.00, strokeWidth: 1.8, hasDash: true,  hasHalo: false },
    { value: 2, label: 'Exploring',  radius: 14, fillOpacity: 0.30, strokeWidth: 1.4, hasDash: false, hasHalo: false },
    { value: 3, label: 'Practicing', radius: 19, fillOpacity: 0.55, strokeWidth: 1.2, hasDash: false, hasHalo: false },
    { value: 4, label: 'Proficient', radius: 24, fillOpacity: 0.82, strokeWidth: 1.5, hasDash: false, hasHalo: false },
    { value: 5, label: 'Expert',     radius: 30, fillOpacity: 1.00, strokeWidth: 2.0, hasDash: false, hasHalo: true  },
  ],

  // ── Domain colour palettes ───────────────────────────────────
  // Each domain needs: fill/stroke for the hex, and a 4-stop
  // colour ramp for skill nodes (ultraLight → light → accent → solid)
  // plus textDark/textLight for legibility on each.
  domains: [
    {
      id:         'design',
      label:      'Design',
      hexFill:    '#7F77DD',
      hexStroke:  '#3C3489',
      solid:      '#534AB7',   // w5 fill
      accent:     '#7F77DD',   // w4 fill
      light:      '#AFA9EC',   // w3 fill
      ultraLight: '#EEEDFE',   // w2 fill
      halo:       '#7F77DD',   // w5 outer ring
      textLight:  '#ffffff',   // text on solid/accent fills
      textDark:   '#26215C',   // text on light/ultraLight fills
    },
    {
      id:         'story',
      label:      'Story',
      hexFill:    '#D85A30',
      hexStroke:  '#712B13',
      solid:      '#993C1D',
      accent:     '#D85A30',
      light:      '#F0997B',
      ultraLight: '#FAECE7',
      halo:       '#D85A30',
      textLight:  '#ffffff',
      textDark:   '#4A1B0C',
    },
    {
      id:         'technology',
      label:      'Information Technology',
      hexFill:    '#1D9E75',
      hexStroke:  '#085041',
      solid:      '#0F6E56',
      accent:     '#1D9E75',
      light:      '#5DCAA5',
      ultraLight: '#E1F5EE',
      halo:       '#1D9E75',
      textLight:  '#ffffff',
      textDark:   '#04342C',
    },
    {
      id:         'photography',
      label:      'Photography',
      hexFill:    '#EF9F27',
      hexStroke:  '#633806',
      solid:      '#BA7517',
      accent:     '#EF9F27',
      light:      '#FAC775',
      ultraLight: '#FAEEDA',
      halo:       '#EF9F27',
      textLight:  '#412402',   // amber is light — use dark text even on solid
      textDark:   '#412402',
    },
    {
      id:         'systems',
      label:      'Systems Thinking',
      hexFill:    '#378ADD',
      hexStroke:  '#0C447C',
      solid:      '#185FA5',
      accent:     '#378ADD',
      light:      '#85B7EB',
      ultraLight: '#E6F1FB',
      halo:       '#378ADD',
      textLight:  '#ffffff',
      textDark:   '#042C53',
    },
    {
      id:         'operations',
      label:      'Operations',
      hexFill:    '#639922',
      hexStroke:  '#27500A',
      solid:      '#3B6D11',
      accent:     '#639922',
      light:      '#97C459',
      ultraLight: '#EAF3DE',
      halo:       '#639922',
      textLight:  '#ffffff',
      textDark:   '#173404',
    },
    {
      id:         'filmmaking',
      label:      'Filmmaking',
      hexFill:    '#D4537E',
      hexStroke:  '#72243E',
      solid:      '#993556',
      accent:     '#D4537E',
      light:      '#ED93B1',
      ultraLight: '#FBEAF0',
      halo:       '#D4537E',
      textLight:  '#ffffff',
      textDark:   '#4B1528',
    },
  ],

  // ── Edge type definitions ────────────────────────────────────
  // All three types defined up front so phases 2 + 3 are a config
  // toggle, not a data restructure.
  //
  // useSourceColor: true  → inherits the source node's domain colour
  // useSourceColor: false → uses the fixed `color` value below
  edges: {
    hierarchy: {
      // Domain → Skill  (phase 1, always visible)
      strokeWidth:    0.8,
      opacity:        0.45,
      dash:           null,
      useSourceColor: true,
      showLabel:      false,
      animated:       false,
      visibleInPhase: 1,
    },
    withinDomain: {
      // Skill → Skill, same domain  (phase 2+)
      strokeWidth:    0.6,
      opacity:        0.28,
      dash:           '4 3',
      useSourceColor: true,
      showLabel:      false,
      animated:       false,
      visibleInPhase: 2,
    },
    crossDomain: {
      // Skill → Skill, across domains  (phase 3 — the storytelling edges)
      strokeWidth:    1.4,
      opacity:        0.65,
      dash:           null,
      useSourceColor: false,
      color:          '#c49a52',   // neutral amber bridge — matches portfolio palette
      showLabel:      true,        // label appears on hover
      animated:       true,        // flowing dash option for phase 3
      visibleInPhase: 3,
    },
  },

  // ── D3 force simulation ──────────────────────────────────────
  forces: {
    linkDistance: {
      hierarchy:   130,   // domain–skill separation
      withinDomain: 70,   // skill–skill same domain
      crossDomain: 200,   // skill–skill cross domain (keep them far)
    },
    linkStrength: {
      hierarchy:    0.7,
      withinDomain: 0.35,
      crossDomain:  0.08,  // weak pull — don't collapse the graph
    },
    chargeStrength:   -380,  // node repulsion (more negative = more spread)
    collisionPadding:  10,   // extra breathing room beyond node radius
    centerStrength:   0.06,  // how strongly nodes gravitate to canvas centre
    alphaDecay:       0.02,  // how fast simulation cools (lower = longer settle)
  },

  // ── Zoom limits ───────────────────────────────────────────────
  zoom: {
    min: 0.25,
    max: 5.0,
    defaultScale: 0.85,  // initial zoom level on mount
  },

  // ── Transition durations (ms) ────────────────────────────────
  animation: {
    nodeEnter:    600,
    nodeUpdate:   350,
    edgeEnter:    400,
    hover:        150,
    panTo:        500,   // duration when programmatically flying to a node
  },
}


// ═══════════════════════════════════════════════════════════════
// NODES
// ═══════════════════════════════════════════════════════════════
// id:     unique slug, used in CROSS_LINKS to reference this node
// label:  display text inside the node circle
// domain: must match a domain id in GRAPH_CONFIG.domains
// group:  sub-cluster within the domain (drives force clustering)
// weight: 1–5  (see GRAPH_CONFIG.weights for what each level means)
// ═══════════════════════════════════════════════════════════════
export const NODES = [

  // ── Design ────────────────────────────────────────────────────
  { id: 'gestalt',         label: 'Gestalt',           domain: 'design',       group: 'visual-theory', weight: 5 },
  { id: 'hierarchy',       label: 'Hierarchy',          domain: 'design',       group: 'visual-theory', weight: 5 },
  { id: 'colour-theory',   label: 'Colour Theory',      domain: 'design',       group: 'visual-theory', weight: 4 },
  { id: 'typography',      label: 'Typography',          domain: 'design',       group: 'layout',        weight: 5 },
  { id: 'grid-systems',    label: 'Grid Systems',        domain: 'design',       group: 'layout',        weight: 4 },
  { id: 'whitespace',      label: 'Whitespace',          domain: 'design',       group: 'layout',        weight: 4 },
  { id: 'composition',     label: 'Composition',         domain: 'design',       group: 'layout',        weight: 4 },
  { id: 'design-systems',  label: 'Design Systems',      domain: 'design',       group: 'tools',         weight: 4 },
  { id: 'ui-patterns',     label: 'UI Patterns',         domain: 'design',       group: 'tools',         weight: 4 },
  { id: 'figma',           label: 'Figma',               domain: 'design',       group: 'tools',         weight: 5 },
  { id: 'motion-design',   label: 'Motion Design',       domain: 'design',       group: 'motion',        weight: 4 },
  { id: 'easing',          label: 'Easing',              domain: 'design',       group: 'motion',        weight: 4 },
  { id: 'choreography',    label: 'Choreography',        domain: 'design',       group: 'motion',        weight: 3 },

  // ── Story ─────────────────────────────────────────────────────
  { id: 'three-act',       label: 'Three-act Structure', domain: 'story',        group: 'structure',     weight: 4 },
  { id: 'heros-journey',   label: "Hero's Journey",      domain: 'story',        group: 'structure',     weight: 4 },
  { id: 'narrative-arc',   label: 'Narrative Arc',        domain: 'story',        group: 'structure',     weight: 5 },
  { id: 'pacing',          label: 'Pacing',               domain: 'story',        group: 'craft',         weight: 5 },
  { id: 'tension',         label: 'Tension',              domain: 'story',        group: 'craft',         weight: 4 },
  { id: 'dialogue',        label: 'Dialogue',             domain: 'story',        group: 'craft',         weight: 3 },
  { id: 'character-arc',   label: 'Character Arc',        domain: 'story',        group: 'character',     weight: 5 },
  { id: 'voice',           label: 'Voice',                domain: 'story',        group: 'character',     weight: 4 },
  { id: 'motivation',      label: 'Motivation',           domain: 'story',        group: 'character',     weight: 4 },
  { id: 'world-building',  label: 'World-building',       domain: 'story',        group: 'world',         weight: 5 },
  { id: 'exposition',      label: 'Exposition',           domain: 'story',        group: 'world',         weight: 4 },
  { id: 'lore',            label: 'Lore',                 domain: 'story',        group: 'world',         weight: 4 },
  { id: 'narrative-design',label: 'Narrative Design',     domain: 'story',        group: 'world',         weight: 3 },

  // ── Information Technology ────────────────────────────────────
  { id: 'javascript',      label: 'JavaScript',           domain: 'technology',   group: 'languages',     weight: 5 },
  { id: 'react',           label: 'React',                domain: 'technology',   group: 'frontend',      weight: 5 },
  { id: 'threejs',         label: 'Three.js',             domain: 'technology',   group: 'frontend',      weight: 4 },
  { id: 'gsap',            label: 'GSAP',                 domain: 'technology',   group: 'frontend',      weight: 4 },
  { id: 'css',             label: 'CSS',                  domain: 'technology',   group: 'frontend',      weight: 5 },
  { id: 'd3',              label: 'D3.js',                domain: 'technology',   group: 'frontend',      weight: 3 },
  { id: 'nodejs',          label: 'Node.js',              domain: 'technology',   group: 'backend',       weight: 4 },
  { id: 'apis',            label: 'APIs',                 domain: 'technology',   group: 'backend',       weight: 5 },
  { id: 'postgresql',      label: 'PostgreSQL',           domain: 'technology',   group: 'backend',       weight: 4 },
  { id: 'graphql',         label: 'GraphQL',              domain: 'technology',   group: 'backend',       weight: 3 },
  { id: 'docker',          label: 'Docker',               domain: 'technology',   group: 'infrastructure',weight: 3 },
  { id: 'cloud',           label: 'Cloud (AWS)',           domain: 'technology',   group: 'infrastructure',weight: 3 },
  { id: 'cicd',            label: 'CI/CD',                domain: 'technology',   group: 'infrastructure',weight: 3 },
  { id: 'nextjs',          label: 'Next.js',              domain: 'technology',   group: 'frontend',      weight: 4 },
  { id: 'vibe-coding',     label: 'Vibe Coding',          domain: 'technology',   group: 'frontend',      weight: 1 },
  { id: 'python',          label: 'Python',               domain: 'technology',   group: 'languages',     weight: 2 },

  // ── Photography ───────────────────────────────────────────────
  { id: 'framing',         label: 'Framing',              domain: 'photography',  group: 'composition',   weight: 5 },
  { id: 'rule-of-thirds',  label: 'Rule of Thirds',       domain: 'photography',  group: 'composition',   weight: 4 },
  { id: 'dof',             label: 'Depth of Field',        domain: 'photography',  group: 'technical',     weight: 3 },
  { id: 'natural-light',   label: 'Natural Light',         domain: 'photography',  group: 'light',         weight: 4 },
  { id: 'golden-hour',     label: 'Golden Hour',           domain: 'photography',  group: 'light',         weight: 4 },
  { id: 'exposure',        label: 'Exposure',              domain: 'photography',  group: 'technical',     weight: 3 },
  { id: 'colour-grading',  label: 'Colour Grading',        domain: 'photography',  group: 'post',          weight: 3 },
  { id: 'street-photo',    label: 'Street Photography',    domain: 'photography',  group: 'genre',         weight: 2 },
  { id: 'storytelling-img',label: 'Visual Storytelling',   domain: 'photography',  group: 'genre',         weight: 4 },

  // ── Systems Thinking ──────────────────────────────────────────
  { id: 'mental-models',   label: 'Mental Models',         domain: 'systems',      group: 'thinking',      weight: 5 },
  { id: 'feedback-loops',  label: 'Feedback Loops',        domain: 'systems',      group: 'thinking',      weight: 4 },
  { id: 'second-order',    label: 'Second-order Thinking', domain: 'systems',      group: 'thinking',      weight: 4 },
  { id: 'zettelkasten',    label: 'Zettelkasten',           domain: 'systems',      group: 'knowledge',     weight: 5 },
  { id: 'knowledge-graphs',label: 'Knowledge Graphs',      domain: 'systems',      group: 'knowledge',     weight: 4 },
  { id: 'obsidian',        label: 'Obsidian',              domain: 'systems',      group: 'knowledge',     weight: 5 },
  { id: 'arch-patterns',   label: 'Architecture Patterns', domain: 'systems',      group: 'architecture',  weight: 4 },
  { id: 'tech-debt',       label: 'Technical Debt',        domain: 'systems',      group: 'architecture',  weight: 3 },
  { id: 'conways-law',     label: "Conway's Law",          domain: 'systems',      group: 'architecture',  weight: 3 },
  { id: 'diagrams',        label: 'Diagrams',              domain: 'systems',      group: 'knowledge',     weight: 4 },

  // ── Operations ────────────────────────────────────────────────
  { id: 'project-mgmt',    label: 'Project Management',    domain: 'operations',   group: 'process',       weight: 4 },
  { id: 'agile',           label: 'Agile',                 domain: 'operations',   group: 'process',       weight: 4 },
  { id: 'documentation',   label: 'Documentation',         domain: 'operations',   group: 'process',       weight: 4 },
  { id: 'roadmapping',     label: 'Roadmapping',           domain: 'operations',   group: 'process',       weight: 3 },
  { id: 'retros',          label: 'Retrospectives',        domain: 'operations',   group: 'process',       weight: 3 },
  { id: 'monitoring',      label: 'Monitoring',            domain: 'operations',   group: 'tooling',       weight: 3 },
  { id: 'incident-resp',   label: 'Incident Response',     domain: 'operations',   group: 'tooling',       weight: 2 },
  { id: 'stakeholders',    label: 'Stakeholders',          domain: 'operations',   group: 'team',          weight: 4 },
  { id: 'team-comms',      label: 'Team Communication',    domain: 'operations',   group: 'team',          weight: 5 },
  { id: 'hiring',          label: 'Hiring',                domain: 'operations',   group: 'team',          weight: 2 },
  // ── Filmmaking ────────────────────────────────────────────────
  { id: 'editing-rhythm',  label: 'Editing Rhythm',      domain: 'filmmaking',   group: 'post',          weight: 3 },
  { id: 'montage',         label: 'Montage',              domain: 'filmmaking',   group: 'post',          weight: 3 },
  { id: 'color-grading-f', label: 'Colour Grading',       domain: 'filmmaking',   group: 'post',          weight: 3 },
  { id: 'cinematography',  label: 'Cinematography',       domain: 'filmmaking',   group: 'camera',        weight: 4 },
  { id: 'shot-language',   label: 'Shot Language',         domain: 'filmmaking',   group: 'camera',        weight: 4 },
  { id: 'camera-movement', label: 'Camera Movement',       domain: 'filmmaking',   group: 'camera',        weight: 3 },
  { id: 'directing',       label: 'Directing',             domain: 'filmmaking',   group: 'production',    weight: 2 },
  { id: 'screenwriting',   label: 'Screenwriting',         domain: 'filmmaking',   group: 'production',    weight: 2 },
  { id: 'sound-design',    label: 'Sound Design',          domain: 'filmmaking',   group: 'audio',         weight: 2 },
  { id: 'visual-rhythm',   label: 'Visual Rhythm',         domain: 'filmmaking',   group: 'post',          weight: 3 },
]


export const CROSS_LINKS = [
  // Design ↔ Photography
  { source: 'gestalt',        target: 'framing',          label: 'Visual grammar',        strength: 0.6 },
  { source: 'gestalt',        target: 'rule-of-thirds',   label: 'Spatial grouping',      strength: 0.5 },
  { source: 'colour-theory',  target: 'colour-grading',   label: 'Colour language',       strength: 0.7 },
  { source: 'composition',    target: 'framing',          label: 'Pictorial structure',   strength: 0.7 },

  // Design ↔ Story
  { source: 'hierarchy',      target: 'narrative-arc',    label: 'Reading order',         strength: 0.5 },
  { source: 'choreography',   target: 'pacing',           label: 'Temporal rhythm',       strength: 0.8 },
  { source: 'easing',         target: 'tension',          label: 'Felt momentum',         strength: 0.6 },
  { source: 'motion-design',  target: 'narrative-arc',    label: 'Kinetic storytelling',  strength: 0.5 },

  // Design ↔ Technology
  { source: 'design-systems', target: 'arch-patterns',    label: 'Structural consistency',strength: 0.6 },
  { source: 'ui-patterns',    target: 'react',            label: 'Component thinking',    strength: 0.7 },

  // Story ↔ Systems Thinking
  { source: 'three-act',      target: 'mental-models',    label: 'Framework thinking',    strength: 0.5 },
  { source: 'world-building', target: 'knowledge-graphs', label: 'Connected lore',        strength: 0.7 },
  { source: 'character-arc',  target: 'feedback-loops',   label: 'Change over time',      strength: 0.4 },
  { source: 'narrative-design',target:'zettelkasten',     label: 'Linked ideas',          strength: 0.5 },

  // Story ↔ Photography
  { source: 'narrative-arc',  target: 'storytelling-img', label: 'Visual narrative',      strength: 0.7 },

  // Technology ↔ Systems Thinking
  { source: 'feedback-loops', target: 'cicd',             label: 'Iterative improvement', strength: 0.6 },
  { source: 'arch-patterns',  target: 'nodejs',           label: 'Backend structure',     strength: 0.4 },
  { source: 'knowledge-graphs',target:'d3',               label: 'Graph visualisation',   strength: 0.6 },
  { source: 'tech-debt',      target: 'documentation',    label: 'Managing complexity',   strength: 0.5 },

  // Photography ↔ Story
  { source: 'golden-hour',    target: 'tension',          label: 'Atmospheric mood',      strength: 0.4 },

  // Operations ↔ Systems Thinking
  { source: 'agile',          target: 'feedback-loops',   label: 'Sprint cadence',        strength: 0.7 },
  { source: 'roadmapping',    target: 'second-order',     label: 'Consequence mapping',   strength: 0.5 },
  { source: 'retros',         target: 'mental-models',    label: 'Reflective practice',   strength: 0.5 },
  // Filmmaking ↔ Photography
  { source: 'cinematography',  target: 'framing',          label: 'Spatial language',      strength: 0.8 },
  { source: 'shot-language',   target: 'composition',      label: 'Frame construction',    strength: 0.7 },
  { source: 'color-grading-f', target: 'colour-grading',   label: 'Shared colour craft',   strength: 0.9 },
  { source: 'camera-movement', target: 'natural-light',    label: 'Physical awareness',    strength: 0.4 },

  // Filmmaking ↔ Story
  { source: 'editing-rhythm',  target: 'pacing',           label: 'Temporal control',      strength: 0.9 },
  { source: 'montage',         target: 'narrative-arc',    label: 'Compressed meaning',    strength: 0.7 },
  { source: 'screenwriting',   target: 'three-act',        label: 'Scene structure',       strength: 0.8 },
  { source: 'directing',       target: 'character-arc',    label: 'Performance shaping',   strength: 0.6 },
  { source: 'visual-rhythm',   target: 'tension',          label: 'Built suspense',        strength: 0.7 },

  // Filmmaking ↔ Design
  { source: 'visual-rhythm',   target: 'choreography',     label: 'Timed movement',        strength: 0.7 },
  { source: 'shot-language',   target: 'hierarchy',        label: 'Visual priority',       strength: 0.5 },
  { source: 'color-grading-f', target: 'colour-theory',    label: 'Emotional palette',     strength: 0.6 },

  // Filmmaking ↔ Photography
  { source: 'cinematography',  target: 'framing',          label: 'Spatial language',      strength: 0.8 },
  { source: 'shot-language',   target: 'composition',      label: 'Frame construction',    strength: 0.7 },
  { source: 'color-grading-f', target: 'colour-grading',   label: 'Shared colour craft',   strength: 0.9 },
  { source: 'camera-movement', target: 'natural-light',    label: 'Physical awareness',    strength: 0.4 },

  // Filmmaking ↔ Story
  { source: 'editing-rhythm',  target: 'pacing',           label: 'Temporal control',      strength: 0.9 },
  { source: 'montage',         target: 'narrative-arc',    label: 'Compressed meaning',    strength: 0.7 },
  { source: 'screenwriting',   target: 'three-act',        label: 'Scene structure',       strength: 0.8 },
  { source: 'directing',       target: 'character-arc',    label: 'Performance shaping',   strength: 0.6 },
  { source: 'visual-rhythm',   target: 'tension',          label: 'Built suspense',        strength: 0.7 },

  // Filmmaking ↔ Design
  { source: 'visual-rhythm',   target: 'choreography',     label: 'Timed movement',        strength: 0.7 },
  { source: 'shot-language',   target: 'hierarchy',        label: 'Visual priority',       strength: 0.5 },
  { source: 'color-grading-f', target: 'colour-theory',    label: 'Emotional palette',     strength: 0.6 },

  // Filmmaking ↔ Photography
  { source: 'cinematography',  target: 'framing',          label: 'Spatial language',      strength: 0.8 },
  { source: 'shot-language',   target: 'composition',      label: 'Frame construction',    strength: 0.7 },
  { source: 'color-grading-f', target: 'colour-grading',   label: 'Shared colour craft',   strength: 0.9 },
  { source: 'camera-movement', target: 'natural-light',    label: 'Physical awareness',    strength: 0.4 },

  // Filmmaking ↔ Story
  { source: 'editing-rhythm',  target: 'pacing',           label: 'Temporal control',      strength: 0.9 },
  { source: 'montage',         target: 'narrative-arc',    label: 'Compressed meaning',    strength: 0.7 },
  { source: 'screenwriting',   target: 'three-act',        label: 'Scene structure',       strength: 0.8 },
  { source: 'directing',       target: 'character-arc',    label: 'Performance shaping',   strength: 0.6 },
  { source: 'visual-rhythm',   target: 'tension',          label: 'Built suspense',        strength: 0.7 },

  // Filmmaking ↔ Design
  { source: 'visual-rhythm',   target: 'choreography',     label: 'Timed movement',        strength: 0.7 },
  { source: 'shot-language',   target: 'hierarchy',        label: 'Visual priority',       strength: 0.5 },
  { source: 'color-grading-f', target: 'colour-theory',    label: 'Emotional palette',     strength: 0.6 },
]
// ═══════════════════════════════════════════════════════════════
// HELPERS  — derived data used by SkillMap.jsx
// ═══════════════════════════════════════════════════════════════

// Quick lookup: domain config by id
export const DOMAIN_MAP = Object.fromEntries(
  GRAPH_CONFIG.domains.map(d => [d.id, d])
)

// Quick lookup: weight config by value
export const WEIGHT_MAP = Object.fromEntries(
  GRAPH_CONFIG.weights.map(w => [w.value, w])
)

// All intra-domain hierarchy links (domain → skill)
// These are auto-generated — you never need to write them manually.
export const HIERARCHY_LINKS = NODES.map(n => ({
  source:   n.domain,   // domain node id
  target:   n.id,       // skill node id
  type:    'hierarchy',
}))

// All links combined — pass this to d3.forceSimulation
// Phase 1: HIERARCHY_LINKS only
// Phase 3: [...HIERARCHY_LINKS, ...CROSS_LINKS_FORMATTED]
export function getLinks(phase = 1) {
  const hier = HIERARCHY_LINKS
  if (phase < 3) return hier
  const cross = CROSS_LINKS.map(l => ({ ...l, type: 'crossDomain' }))
  return [...hier, ...cross]
}
