import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GRAPH_CONFIG, NODES, DOMAIN_MAP, WEIGHT_MAP, getLinks } from '../data/mindmap'
import { prefersReducedMotion } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

// ── Flat-top hexagon centred at 0,0 ──────────────────────────
function hexPoints(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180)
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

// ── Skill node visual props ───────────────────────────────────
function skillStyle(domainId, weight) {
  const dc  = DOMAIN_MAP[domainId] || {}
  const wc  = WEIGHT_MAP[weight]   || {}
  const fills = [dc.ultraLight, dc.ultraLight, dc.light, dc.accent, dc.solid]
  return {
    fill:      fills[weight - 1] || dc.solid    || '#7F77DD',
    fillOp:    wc.fillOpacity  ?? 0.5,
    stroke:    weight >= 4 ? (dc.solid || dc.hexFill) : (dc.accent || dc.hexFill) || '#555',
    strokeW:   wc.strokeWidth ?? 1.2,
    dash:      wc.hasDash ? '3 2' : null,
    hasHalo:   !!wc.hasHalo,
    halo:      dc.halo  || dc.hexFill || '#888',
    textIn:    weight >= 4 ? (dc.textLight || '#fff') : (dc.textDark || '#888'),
    textOut:   dc.textDark || dc.hexFill || '#888',
    inside:    weight >= 3,
    fontSize:  wc.radius >= 24 ? 11 : wc.radius >= 19 ? 10 : 9,
  }
}

// ── ZoomControls ──────────────────────────────────────────────
function ZoomControls({ onIn, onOut, onReset }) {
  const s = {
    all: 'unset', cursor: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', width: '32px', height: '32px',
    fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--fg-muted)',
    border: '1px solid var(--border)', borderRadius: '3px',
    background: 'rgba(7,8,8,0.88)', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
  }
  const hi = e => { e.currentTarget.style.color = 'var(--fg)';       e.currentTarget.style.borderColor = 'var(--border-hover)' }
  const lo = e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }
  return (
    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
      {[['+ ', onIn], ['⊙', onReset], ['−', onOut]].map(([lbl, fn]) => (
        <button key={lbl} style={s} onClick={fn} onMouseEnter={hi} onMouseLeave={lo}>{lbl}</button>
      ))}
    </div>
  )
}

// ── WeightLegend ──────────────────────────────────────────────
function WeightLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 10,
      background: 'rgba(7,8,8,0.88)', backdropFilter: 'blur(10px)',
      border: '1px solid var(--border)', borderRadius: '4px', padding: '0.8rem 1rem',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.6rem' }}>Experience</div>
      {GRAPH_CONFIG.weights.map(w => (
        <div key={w.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <svg width={w.radius * 2 + 12} height={w.radius * 2 + 12} style={{ flexShrink: 0, overflow: 'visible' }}>
            {w.hasHalo && <circle cx={w.radius + 6} cy={w.radius + 6} r={w.radius + 4} fill="none" stroke="var(--fg-dim)" strokeWidth="0.5" />}
            <circle cx={w.radius + 6} cy={w.radius + 6} r={w.radius}
              fill={w.fillOpacity === 0 ? 'none' : 'var(--fg-muted)'} fillOpacity={w.fillOpacity * 0.55}
              stroke="var(--fg-muted)" strokeWidth={w.strokeWidth} strokeDasharray={w.hasDash ? '3 2' : undefined} />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
            {w.value} · {w.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export default function SkillMap() {
  const mountRef   = useRef(null)
  const sectionRef = useRef(null)
  const zoomRef    = useRef(null)
  const svgSelRef  = useRef(null)
  const simRef     = useRef(null)

  const zoomIn    = useCallback(() => svgSelRef.current?.transition().duration(300).call(zoomRef.current.scaleBy, 1.5), [])
  const zoomOut   = useCallback(() => svgSelRef.current?.transition().duration(300).call(zoomRef.current.scaleBy, 0.67), [])
  const zoomReset = useCallback(() => {
    const W = mountRef.current?.clientWidth || 960
    svgSelRef.current?.transition().duration(480).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(W / 2, 340).scale(GRAPH_CONFIG.zoom.defaultScale).translate(-W / 2, -340)
    )
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth || 960
    const H = 680
    const cfg  = GRAPH_CONFIG
    const RING = Math.min(W * 0.34, 220) // domain ring radius

    // ── Build node data — domain config embedded ──────────────
    const domainNodes = cfg.domains.map((dc, i) => {
      const angle = (i / cfg.domains.length) * Math.PI * 2 - Math.PI / 2
      return {
        id:        dc.id,
        label:     dc.label,
        type:      'domain',
        domain:    dc.id,
        radius:    cfg.domainNode.radius,
        // Colours live on the datum — no external lookup needed at render time
        fill:      dc.hexFill,
        stroke:    dc.hexStroke,
        textFill:  dc.textLight,
        edgeColor: dc.hexFill,
        x: W / 2 + Math.cos(angle) * RING,
        y: H / 2 + Math.sin(angle) * RING,
      }
    })

    const skillNodes = NODES.map((n, i) => {
      const parent = domainNodes.find(d => d.id === n.domain)
      const angle  = (i * 2.39996) % (Math.PI * 2) // golden angle
      const dist   = 70 + (WEIGHT_MAP[n.weight]?.radius || 14) * 3
      const s      = skillStyle(n.domain, n.weight)
      return {
        ...n,
        type:   'skill',
        radius: WEIGHT_MAP[n.weight]?.radius || 14,
        style:  s,
        edgeColor: domainNodes.find(d => d.id === n.domain)?.fill || '#888',
        x: (parent?.x || W / 2) + Math.cos(angle) * dist,
        y: (parent?.y || H / 2) + Math.sin(angle) * dist,
      }
    })

    const allNodes = [...domainNodes, ...skillNodes]
    const links    = getLinks(1)

    // ── SVG ───────────────────────────────────────────────────
    const svg = d3.select(mount).append('svg')
      .attr('width', '100%').attr('height', H)
      .style('display', 'block').style('opacity', 0).style('cursor', 'grab')

    svgSelRef.current = svg

    // Forward wheel events from the SVG to window so Lenis intercepts them.
    // Without this the SVG swallows wheel events and the page feels stuck
    // when the cursor is over the graph.
    svg.node().addEventListener('wheel', (e) => {
      window.dispatchEvent(new WheelEvent('wheel', {
        deltaX:    e.deltaX,
        deltaY:    e.deltaY,
        deltaMode: e.deltaMode,
        ctrlKey:   e.ctrlKey,
        bubbles:   true,
        cancelable: true,
      }))
    }, { passive: true })

    const g = svg.append('g')

    // ── Edges ─────────────────────────────────────────────────
    const edgeSel = g.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke-width', cfg.edges.hierarchy.strokeWidth)
      .attr('stroke-opacity', cfg.edges.hierarchy.opacity)
      .attr('stroke', d => {
        // d.source is the domain id string at creation time
        const src = domainNodes.find(n => n.id === d.source)
        return src?.fill || '#7F77DD'
      })

    // ── Domain hexagons ───────────────────────────────────────
    const HEX = hexPoints(cfg.domainNode.radius)

    const domainSel = g.append('g').selectAll('g')
      .data(domainNodes).join('g')
      .call(drag(simRef))
      .on('mouseenter', (_, d) => highlight(d.id, 'domain', g, edgeSel, cfg))
      .on('mouseleave', () => clearHighlight(g, edgeSel, cfg))

    // Polygon — direct attr setters on the d3 selection
    domainSel.append('polygon')
      .attr('points', HEX)
      .attr('fill',         d => d.fill)
      .attr('stroke',       d => d.stroke)
      .attr('stroke-width', cfg.domainNode.strokeWidth)

    // Labels
    domainSel.each(function(d) {
      const words  = d.label.split(' ')
      const lines  = []
      let cur      = ''
      for (const w of words) {
        const t = cur ? `${cur} ${w}` : w
        if (t.length > 9 && cur) { lines.push(cur); cur = w } else cur = t
      }
      if (cur) lines.push(cur)

      const sz  = lines.length >= 3 ? 9 : lines.length === 2 ? 11 : 12
      const lh  = lines.length >= 3 ? 11 : 13
      const top = -(((lines.length - 1) * lh) / 2)

      const txt = d3.select(this).append('text')
        .attr('text-anchor', 'middle').style('pointer-events', 'none')
        .attr('font-family', 'var(--font-body,system-ui,sans-serif)')
        .attr('font-size', sz).attr('font-weight', '500')
        .attr('fill', d.textFill || '#ffffff')

      lines.forEach((line, i) =>
        txt.append('tspan').attr('x', 0).attr('y', top + i * lh)
          .attr('dominant-baseline', 'central').text(line)
      )
    })

    // ── Skill nodes ───────────────────────────────────────────
    const skillSel = g.append('g').selectAll('g')
      .data(skillNodes).join('g')
      .call(drag(simRef))
      .on('mouseenter', (_, d) => highlight(d.id, 'skill', g, edgeSel, cfg))
      .on('mouseleave', () => clearHighlight(g, edgeSel, cfg))

    skillSel.each(function(d) {
      const s  = d.style
      const el = d3.select(this)
      const r  = d.radius

      if (s.hasHalo)
        el.append('circle').attr('r', r + 5)
          .attr('fill', 'none').attr('stroke', s.halo)
          .attr('stroke-width', 0.6).attr('opacity', 0.35)

      el.append('circle').attr('r', r)
        .attr('fill', s.fill).attr('fill-opacity', s.fillOp)
        .attr('stroke', s.stroke).attr('stroke-width', s.strokeW)
        .attr('stroke-dasharray', s.dash)

      el.append('text')
        .text(d.label)
        .attr('text-anchor', 'middle')
        .attr('y', s.inside ? 0 : r + 12)
        .attr('dominant-baseline', s.inside ? 'central' : 'auto')
        .attr('font-family', 'var(--font-body,system-ui,sans-serif)')
        .attr('font-size', s.fontSize)
        .attr('fill', s.inside ? s.textIn : s.textOut)
        .style('pointer-events', 'none')
    })

    // ── Force simulation ──────────────────────────────────────
    // Per-node home targets — each skill node is gently attracted
    // toward its parent domain's seeded position. Prevents nodes
    // drifting off-screen when the global centering force isn't enough.
    const homeX = new Map(allNodes.map(n => [n.id, n.x]))
    const homeY = new Map(allNodes.map(n => [n.id, n.y]))

    const sim = d3.forceSimulation(allNodes)
      .force('link',
        d3.forceLink(links).id(d => d.id)
          .distance(d => d.type === 'hierarchy' ? 105 : 65)
          .strength(0.6)
      )
      .force('charge',
        d3.forceManyBody()
          .strength(d => d.type === 'domain' ? -420 : -110)
          .distanceMax(260)
      )
      // Global centering — pulls everything toward canvas centre
      .force('x', d3.forceX(W / 2).strength(0.07))
      .force('y', d3.forceY(H / 2).strength(0.07))
      // Per-node home attraction — gentle pull toward seeded neighbourhood
      .force('homeX', d3.forceX().x(d => homeX.get(d.id) || W / 2).strength(d => d.type === 'skill' ? 0.018 : 0))
      .force('homeY', d3.forceY().y(d => homeY.get(d.id) || H / 2).strength(d => d.type === 'skill' ? 0.018 : 0))
      .force('collide', d3.forceCollide().radius(d => d.radius + 10).strength(0.88))
      .alphaDecay(0.020)
      .velocityDecay(0.42)

    simRef.current = sim

    // Padding: keep nodes inside the visible canvas
    const PAD = 50

    // Edge shortening helper — offset endpoint to node boundary.
    // Circles:  offset = circumradius (exact boundary)
    // Hexagons: offset = inradius = R * cos(30°) ≈ 0.866 * R
    //           The inradius is the perpendicular distance from centre to
    //           a flat face — always the minimum clearance, so edges never
    //           terminate short of the shape regardless of approach angle.
    const COS30 = Math.cos(Math.PI / 6)

    function edgeOffset(node) {
      const r = node.radius || 14
      return node.type === 'domain' ? r * COS30 : r + 2
    }

    function edgePt(from, to) {
      const dx = to.x - from.x, dy = to.y - from.y
      const d  = Math.sqrt(dx * dx + dy * dy) || 1
      const r  = edgeOffset(from)
      return { x: from.x + (dx / d) * r, y: from.y + (dy / d) * r }
    }

    sim.on('tick', () => {
      // Clamp nodes inside canvas
      allNodes.forEach(n => {
        n.x = Math.max(PAD, Math.min(W - PAD, n.x))
        n.y = Math.max(PAD, Math.min(H - PAD, n.y))
      })

      // Edges: each endpoint offset to its node's visual boundary
      edgeSel.each(function(d) {
        const p1 = edgePt(d.source, d.target)
        const p2 = edgePt(d.target, d.source)
        d3.select(this)
          .attr('x1', p1.x).attr('y1', p1.y)
          .attr('x2', p2.x).attr('y2', p2.y)
      })

      domainSel.attr('transform', d => `translate(${d.x},${d.y})`)
      skillSel .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // ── Zoom ──────────────────────────────────────────────────
    const zoom = d3.zoom()
      .scaleExtent([cfg.zoom.min, cfg.zoom.max])
      .on('zoom', e => { g.attr('transform', e.transform); svg.style('cursor', e.transform.k > 1 ? 'move' : 'grab') })

    zoomRef.current = zoom
    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(cfg.zoom.defaultScale).translate(-W / 2, -H / 2))

    // ── ScrollTrigger ─────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: sectionRef.current, start: 'top 75%', once: true,
      onEnter: () => {
        gsap.to(svg.node(), { opacity: 1, duration: 0.8, ease: 'power2.out' })
        sim.alpha(0.5).restart()
      },
    })

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      const nW = mount.clientWidth
      svg.attr('width', nW)
      sim.force('x', d3.forceX(nW / 2).strength(0.06)).alpha(0.1).restart()
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      sim.stop(); st.kill()
      window.removeEventListener('resize', onResize)
      d3.select(mount).select('svg').remove()
    }
  }, [])

  return (
    <section id="craft" ref={sectionRef} style={{ padding: 'var(--sp-section-y) var(--sp-section-x)', background: 'var(--bg-1)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', marginBottom: '2.5rem' }}>
        <div className="section-label">Skills &amp; Craft</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,5vw,4.5rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1rem' }}>
          A map of <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>everything</span>
        </h2>
        <p style={{ color: 'var(--fg-muted)', maxWidth: '480px', lineHeight: 1.8, fontSize: '1rem' }}>
          Drag nodes to rearrange. Use + / − to zoom. Hover a domain to illuminate its cluster.
        </p>
      </div>
      <div style={{ position: 'relative', height: '680px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <WeightLegend />
        <ZoomControls onIn={zoomIn} onOut={zoomOut} onReset={zoomReset} />
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-dim)', pointerEvents: 'none' }}>
          {GRAPH_CONFIG.domains.length} domains · {NODES.length} skills
        </div>
      </div>
    </section>
  )
}

// ── Drag ──────────────────────────────────────────────────────
function drag(simRef) {
  return d3.drag()
    .on('start', (e, d) => { if (!e.active) simRef.current?.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
    .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
    .on('end',   (e, d) => { if (!e.active) simRef.current?.alphaTarget(0); d.fx = null; d.fy = null })
}

// ── Hover ─────────────────────────────────────────────────────
function highlight(nodeId, type, g, edgeSel, cfg) {
  const keep = new Set([nodeId])
  edgeSel.each(d => {
    const s = typeof d.source === 'object' ? d.source.id : d.source
    const t = typeof d.target === 'object' ? d.target.id : d.target
    if (s === nodeId || t === nodeId) { keep.add(s); keep.add(t) }
  })

  g.selectAll('g g')
    .filter(d => d && d.id)
    .transition().duration(cfg.animation.hover)
    .style('opacity', d => keep.has(d.id) ? 1 : 0.15)

  edgeSel.transition().duration(cfg.animation.hover)
    .attr('stroke-opacity', d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source
      const t = typeof d.target === 'object' ? d.target.id : d.target
      return keep.has(s) && keep.has(t) ? 0.75 : 0.04
    })
}

function clearHighlight(g, edgeSel, cfg) {
  g.selectAll('g g').filter(d => d && d.id)
    .transition().duration(cfg.animation.hover).style('opacity', 1)
  edgeSel.transition().duration(cfg.animation.hover)
    .attr('stroke-opacity', cfg.edges.hierarchy.opacity)
}
