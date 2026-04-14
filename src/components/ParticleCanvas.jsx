import { useEffect, useRef } from 'react'

// ── Colour helpers ────────────────────────────────────────────
const AMBER = { r: 196, g: 154, b: 82  }
const GREEN = { r: 92,  g: 143, b: 106 }
const BLUE  = { r: 88,  g: 160, b: 196 }

// Linear interpolate between two RGB colours, returns css string
function lerpColor(a, b, t) {
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bl = Math.round(a.b + (b.b - a.b) * t)
  return `${r},${bl},${bl}` // fixed below
}

function mixRGB(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function rgbStr(c, alpha) {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${alpha.toFixed(3)})`
}

// ── Base particle (amber/green, colour-pulsing) ───────────────
class Particle {
  constructor(w, h) { this.reset(w, h) }

  reset(w, h) {
    this.x       = Math.random() * w
    this.y       = Math.random() * h
    this.vx      = (Math.random() - 0.5) * 0.22
    this.vy      = (Math.random() - 0.5) * 0.22
    this.r       = Math.random() * 1.5 + 0.5
    // Each particle has its own phase for both opacity and colour pulse
    this.opPhase = Math.random() * Math.PI * 2
    this.opSpeed = 0.007 + Math.random() * 0.010
    this.colPhase= Math.random() * Math.PI * 2
    this.colSpeed= 0.003 + Math.random() * 0.006  // colour changes more slowly
    this.baseAlpha = Math.random() * 0.35 + 0.12
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    this.opPhase  += this.opSpeed
    this.colPhase += this.colSpeed
    // Wrap
    if (this.x < 0) this.x = w
    if (this.x > w) this.x = 0
    if (this.y < 0) this.y = h
    if (this.y > h) this.y = 0
    // Opacity: sine pulse
    const opT = (Math.sin(this.opPhase) + 1) / 2        // 0→1
    this._alpha = Math.max(0.05, Math.min(0.65, this.baseAlpha + (opT - 0.5) * 0.28))
    // Colour: interpolate between amber and green
    const colT = (Math.sin(this.colPhase) + 1) / 2      // 0→1
    this._color = mixRGB(AMBER, GREEN, colT)
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = rgbStr(this._color, this._alpha)
    ctx.fill()
  }
}

// ── Blue particle — forms its own web, ebbs and flows ─────────
class BlueParticle {
  constructor(w, h) { this.reset(w, h); this.life = 1 }

  reset(w, h) {
    this.x       = Math.random() * w
    this.y       = Math.random() * h
    this.vx      = (Math.random() - 0.5) * 0.18
    this.vy      = (Math.random() - 0.5) * 0.18
    this.r       = Math.random() * 2.2 + 0.6   // slightly larger than base
    this.opPhase = Math.random() * Math.PI * 2
    this.opSpeed = 0.006 + Math.random() * 0.008
    this.baseAlpha = Math.random() * 0.40 + 0.15
    this.life    = 0    // starts invisible, fades in
    this.dying   = false
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    this.opPhase += this.opSpeed
    if (this.x < 0) this.x = w
    if (this.x > w) this.x = 0
    if (this.y < 0) this.y = h
    if (this.y > h) this.y = 0
    // Fade in / fade out
    if (this.dying) {
      this.life = Math.max(0, this.life - 0.008)
    } else {
      this.life = Math.min(1, this.life + 0.005)
    }
    const opT  = (Math.sin(this.opPhase) + 1) / 2
    this._alpha = this.baseAlpha * this.life * (0.7 + opT * 0.3)
  }

  draw(ctx) {
    if (this._alpha < 0.01) return
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = rgbStr(BLUE, this._alpha)
    ctx.fill()
  }
}

// ─────────────────────────────────────────────────────────────
export default function ParticleCanvas({ mouseRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let raf

    // ── Config ───────────────────────────────────────────────
    const BASE_COUNT    = 80     // amber/green particles
    const BLUE_DENSE    = 70     // blue particle high count (flood)
    const BLUE_SPARSE   = 18     // blue particle low count (ebb)
    const MAX_DIST      = 125    // connection distance for base particles
    const BLUE_DIST     = 150    // connection distance for blue web (slightly wider)
    const EBB_INTERVAL  = 6000   // ms between ebb/flow toggle
    const ATTRACT_RADIUS = 120   // px — mouse attract range
    const ATTRACT_FORCE  = 1.8   // px/frame toward mouse

    let baseParticles = []
    let blueParticles = []
    let blueTarget    = BLUE_SPARSE  // start sparse, first toggle goes dense
    let isDense       = false

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      baseParticles = Array.from({ length: BASE_COUNT },
        () => new Particle(canvas.width, canvas.height))
      // Keep blue particles on resize, just reset positions gently
      if (blueParticles.length === 0) {
        blueParticles = Array.from({ length: blueTarget },
          () => new BlueParticle(canvas.width, canvas.height))
      }
    }

    // ── Blue ebb/flow timer ───────────────────────────────────
    // Toggles between dense and sparse by marking excess particles
    // as dying and spawning new ones to reach the new target.
    const toggleBlue = () => {
      isDense    = !isDense
      blueTarget = isDense ? BLUE_DENSE : BLUE_SPARSE

      if (blueParticles.length < blueTarget) {
        // Spawn more
        const needed = blueTarget - blueParticles.length
        for (let i = 0; i < needed; i++) {
          blueParticles.push(new BlueParticle(canvas.width, canvas.height))
        }
      } else {
        // Mark excess as dying — they'll be pruned in the draw loop
        const excess = blueParticles.length - blueTarget
        let marked = 0
        for (let i = blueParticles.length - 1; i >= 0 && marked < excess; i--) {
          if (!blueParticles[i].dying) {
            blueParticles[i].dying = true
            marked++
          }
        }
      }
    }

    const ebbTimer = setInterval(toggleBlue, EBB_INTERVAL)
    // Start first flood after half an interval so it's not immediate
    const firstFlood = setTimeout(toggleBlue, EBB_INTERVAL / 2)

    // ── Draw loop ─────────────────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = mouseRef?.current?.x ?? -9999
      const my = mouseRef?.current?.y ?? -9999

      // ── Update + prune dead blue particles ──────────────────
      for (let i = blueParticles.length - 1; i >= 0; i--) {
        blueParticles[i].update(canvas.width, canvas.height)
        if (blueParticles[i].dying && blueParticles[i].life <= 0) {
          blueParticles.splice(i, 1)
        }
      }

      // ── Blue web connections ─────────────────────────────────
      for (let i = 0; i < blueParticles.length; i++) {
        for (let j = i + 1; j < blueParticles.length; j++) {
          const a = blueParticles[i], b = blueParticles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < BLUE_DIST) {
            const minLife = Math.min(a.life, b.life)
            const opacity = (1 - d / BLUE_DIST) * 0.16 * minLife
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(88,160,196,${opacity.toFixed(3)})`
            ctx.lineWidth   = 0.55
            ctx.stroke()
          }
        }
      }

      // ── Base particles: update, attract to mouse, connect ────
      for (let i = 0; i < baseParticles.length; i++) {
        const p = baseParticles[i]
        p.update(canvas.width, canvas.height)

        // Mouse attract — pull toward cursor
        const mdx = mx - p.x
        const mdy = my - p.y
        const md  = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < ATTRACT_RADIUS && md > 1) {
          const force = (1 - md / ATTRACT_RADIUS) * ATTRACT_FORCE
          p.x += (mdx / md) * force
          p.y += (mdy / md) * force
        }

        // Connections between base particles
        for (let j = i + 1; j < baseParticles.length; j++) {
          const q  = baseParticles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DIST) {
            const blendT = (Math.sin(p.opPhase + q.opPhase) + 1) / 2
            const lc     = mixRGB(AMBER, GREEN, blendT)
            const opacity = (1 - d / MAX_DIST) * 0.10
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = rgbStr(lc, opacity)
            ctx.lineWidth   = 0.5
            ctx.stroke()
          }
        }
      }

      // ── Draw blue particles on top ───────────────────────────
      for (const bp of blueParticles) bp.draw(ctx)

      // ── Draw base particles on top of blue ───────────────────
      for (const p of baseParticles) p.draw(ctx)

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(ebbTimer)
      clearTimeout(firstFlood)
      window.removeEventListener('resize', resize)
    }
  }, [mouseRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
