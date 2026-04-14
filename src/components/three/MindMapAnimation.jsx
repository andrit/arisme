import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, isMobileDevice } from '../../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const W = 480, H = 480
const GREEN_HEX = '#5c8f6a'
const AMBER_HEX = '#c49a52'
const GREEN_RGB = 0x5c8f6a
const FG_HEX    = '#f0ead8'
const RADIUS    = 2.35
const EDGE_SEGS = 52

const CENTER_WORD = 'Narrative'
const OUTER_WORDS = ['World', 'Voice', 'Arc', 'Theme', 'Conflict', 'Character']

function drawNode(cnv, word, { isCenter = false, charProgress = 0 } = {}) {
  cnv.width = cnv.height = 256
  const ctx = cnv.getContext('2d')
  ctx.clearRect(0, 0, 256, 256)
  const cx = 128, cy = 128, r = 108

  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2)
  ctx.strokeStyle = isCenter ? 'rgba(196,154,82,0.14)' : 'rgba(92,143,106,0.10)'
  ctx.lineWidth = 10; ctx.stroke()

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = isCenter ? 'rgba(196,154,82,0.13)' : 'rgba(92,143,106,0.10)'
  ctx.fill()

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = isCenter ? AMBER_HEX : GREEN_HEX
  ctx.lineWidth = 2.5; ctx.stroke()

  const display = word ? word.slice(0, Math.ceil(word.length * charProgress)) : ''
  if (display.length) {
    ctx.fillStyle = FG_HEX
    ctx.font = `${isCenter ? '600 ' : ''}${isCenter ? 26 : 21}px Georgia, serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(display, cx, cy)
  }
  if (charProgress > 0 && charProgress < 1 && display.length) {
    const tw = ctx.measureText(display).width
    ctx.fillStyle = isCenter ? AMBER_HEX : GREEN_HEX
    ctx.fillRect(cx + tw / 2 + 3, cy - 12, 2, 22)
  }
}

export default function MindMapAnimation({ sectionRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = null

    // ── Pass 2: lazy init — wait until section is within 200px ──
    const lazyObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      lazyObserver.disconnect()
      cleanup = initScene(container, sectionRef)
    }, { rootMargin: '200px 0px', threshold: 0 })

    lazyObserver.observe(container)

    return () => {
      lazyObserver.disconnect()
      cleanup?.()
    }
  }, [])

  return <div ref={containerRef} style={{ width: W, height: H, position: 'relative', overflow: 'hidden', flexShrink: 0 }} />
}

function initScene(container, sectionRef) {
  const mobile = isMobileDevice()
  const reduced = prefersReducedMotion()

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
  camera.position.set(0, 0, 4.8)

  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true })
  // Pass 2: cap DPR at 1 on mobile
  renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.setClearColor(0x000000, 0)
  const cvs = renderer.domElement
  cvs.style.cssText = 'opacity:0;position:absolute;top:-200px;left:-200px;pointer-events:none;'
  container.appendChild(cvs)

  scene.add(new THREE.AmbientLight(0xffffff, 1))

  const centerCnv = document.createElement('canvas')
  drawNode(centerCnv, CENTER_WORD, { isCenter: true, charProgress: reduced ? 1 : 0 })
  const centerTex  = new THREE.CanvasTexture(centerCnv)
  const centerMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.60, 64),
    new THREE.MeshBasicMaterial({ map: centerTex, transparent: true })
  )
  scene.add(centerMesh)

  const outerNodes = OUTER_WORDS.map((word, i) => {
    const angle = (i / OUTER_WORDS.length) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * RADIUS
    const y = Math.sin(angle) * RADIUS
    const cnv = document.createElement('canvas')
    drawNode(cnv, word, { charProgress: reduced ? 1 : 0 })
    const tex  = new THREE.CanvasTexture(cnv)
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.47, 64),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: reduced ? 1 : 0 })
    )
    mesh.position.set(x, y, 0)
    scene.add(mesh)
    return { word, x, y, mesh, tex, cnv }
  })

  const edges = outerNodes.map(({ x, y }) => {
    const pts = Array.from({ length: EDGE_SEGS + 1 }, (_, s) => {
      const t = s / EDGE_SEGS
      return new THREE.Vector3(t * x, t * y, 0.01)
    })
    const geo  = new THREE.BufferGeometry().setFromPoints(pts)
    geo.setDrawRange(0, reduced ? EDGE_SEGS + 1 : 0)
    const line = new THREE.Line(geo,
      new THREE.LineBasicMaterial({ color: GREEN_RGB, transparent: true, opacity: 0.45 })
    )
    scene.add(line)
    return { geo }
  })

  // Reduced motion: render final state, no animation loop
  if (reduced) {
    camera.position.z = 9.8
    renderer.render(scene, camera)
    gsap.to(cvs, { opacity: 0.8, duration: 0 })

    const st = ScrollTrigger.create({ trigger: sectionRef?.current || container, start: 'top 72%' })
    return () => {
      st.kill()
      scene.traverse(o => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose() } })
      renderer.dispose()
      if (container.contains(cvs)) container.removeChild(cvs)
    }
  }

  const state = { phase: 'idle', phaseStart: 0, currentEdge: 0, edgeStart: 0 }
  let started = false
  const EDGE_DUR  = 0.44
  const TYPE_DUR  = 0.54
  const NODE_STEP = EDGE_DUR + TYPE_DUR + 0.06

  const startAnim = () => {
    if (started) return
    started = true
    state.phase = 'type_center'
    state.phaseStart = performance.now()
  }

  let rafId = null
  const loop = () => {
    const now     = performance.now()
    const elapsed = (now - state.phaseStart) / 1000

    if (state.phase === 'type_center') {
      const p = Math.min(elapsed / 0.85, 1)
      drawNode(centerCnv, CENTER_WORD, { isCenter: true, charProgress: p })
      centerTex.needsUpdate = true
      if (p >= 1) {
        state.phase = 'zoom_out'; state.phaseStart = now
        gsap.to(camera.position, { z: 9.8, duration: 1.1, ease: 'power2.inOut' })
      }
    }

    if (state.phase === 'zoom_out' && elapsed >= 1.1) {
      state.phase = 'draw_edges'; state.phaseStart = now
      state.currentEdge = 0; state.edgeStart = now
    }

    if (state.phase === 'draw_edges') {
      const ei = state.currentEdge
      if (ei < outerNodes.length) {
        const et = (now - state.edgeStart) / 1000
        edges[ei].geo.setDrawRange(0, Math.floor(Math.min(et / EDGE_DUR, 1) * (EDGE_SEGS + 1)))
        if (et > EDGE_DUR * 0.55)
          outerNodes[ei].mesh.material.opacity = Math.min((et - EDGE_DUR * 0.55) / 0.25, 1)
        if (et > EDGE_DUR) {
          const p = Math.min((et - EDGE_DUR) / TYPE_DUR, 1)
          drawNode(outerNodes[ei].cnv, outerNodes[ei].word, { charProgress: p })
          outerNodes[ei].tex.needsUpdate = true
        }
        if (et >= NODE_STEP) {
          edges[ei].geo.setDrawRange(0, EDGE_SEGS + 1)
          drawNode(outerNodes[ei].cnv, outerNodes[ei].word, { charProgress: 1 })
          outerNodes[ei].tex.needsUpdate = true
          state.currentEdge++
          state.edgeStart = now
          if (state.currentEdge >= outerNodes.length) state.phase = 'done'
        }
      }
    }

    if (state.phase === 'done') scene.rotation.z += 0.00022

    renderer.render(scene, camera)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)

  // Fade-to-pause
  const fadeObserver = new IntersectionObserver(([entry]) => {
    gsap.killTweensOf(cvs)
    if (entry.isIntersecting) {
      if (!rafId) rafId = requestAnimationFrame(loop)
      gsap.to(cvs, { opacity: 0.8, duration: 0.5, ease: 'power2.out' })
    } else {
      gsap.to(cvs, {
        opacity: 0, duration: 0.6, ease: 'power2.in',
        onComplete: () => { cancelAnimationFrame(rafId); rafId = null },
      })
    }
  }, { threshold: 0.05 })
  fadeObserver.observe(container)

  const st = ScrollTrigger.create({
    trigger: sectionRef?.current || container,
    start: 'top 72%',
    onEnter: startAnim,
  })

  return () => {
    cancelAnimationFrame(rafId); rafId = null
    fadeObserver.disconnect(); st.kill()
    gsap.killTweensOf(cvs); gsap.killTweensOf(camera.position)
    scene.traverse(o => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose() } })
    renderer.dispose()
    if (container.contains(cvs)) container.removeChild(cvs)
  }
}
