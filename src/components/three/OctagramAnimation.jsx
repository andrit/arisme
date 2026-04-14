import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, isMobileDevice } from '../../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const W = 480, H = 480

function lcg(seed = 42) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

function makeOctagonGeo(r = 0.38) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8
    i === 0 ? shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
             : shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

export default function OctagramAnimation({ sectionRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cleanup = null

    const lazyObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      lazyObserver.disconnect()
      cleanup = initScene(container, sectionRef)
    }, { rootMargin: '200px 0px', threshold: 0 })

    lazyObserver.observe(container)
    return () => { lazyObserver.disconnect(); cleanup?.() }
  }, [])

  return <div ref={containerRef} style={{ width: W, height: H, position: 'relative', overflow: 'hidden', flexShrink: 0 }} />
}

function initScene(container, sectionRef) {
  const mobile  = isMobileDevice()
  const reduced = prefersReducedMotion()

  // Pass 2: fewer pieces on mobile
  const PIECE_COUNT = mobile ? 24 : 64
  const R_MIN  = 0.3
  const R_MAX  = 4.8
  const Z_NEAR = 3.2
  const Z_FAR  = -5.0
  const SPEED  = 0.008

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(0, 0, 7.5)

  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true })
  renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.setClearColor(0x000000, 0)
  const cvs = renderer.domElement
  cvs.style.cssText = 'opacity:0;position:absolute;top:0;left:0;pointer-events:none;'
  container.appendChild(cvs)

  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const key = new THREE.PointLight(0x7dba8e, 4.5, 28); key.position.set(4, 5, 7); scene.add(key)
  const fill = new THREE.PointLight(0x5c8f6a, 2.0, 22); fill.position.set(-5, -3, 4); scene.add(fill)

  const geo = makeOctagonGeo(0.38)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x4a7a58, emissive: 0x1a3a24, emissiveIntensity: 0.55,
    metalness: 0.18, roughness: 0.52, side: THREE.DoubleSide,
  })

  const mesh = new THREE.InstancedMesh(geo, mat, PIECE_COUNT)
  mesh.frustumCulled = false
  scene.add(mesh)

  const rand   = lcg(77)
  const pieces = Array.from({ length: PIECE_COUNT }, () => {
    const angle = rand() * Math.PI * 2
    const r     = R_MIN + rand() * (R_MAX - R_MIN)
    const z     = Z_FAR + rand() * (Z_NEAR - Z_FAR)
    return {
      angle, r,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      z, rot: rand() * Math.PI * 2,
      rotSpeed: (rand() - 0.5) * 0.006,
      scale: 0.55 + rand() * 0.7,
      speed: SPEED * (0.7 + rand() * 0.6),
    }
  })

  const dummy = new THREE.Object3D()
  let snapped = false, started = false

  const syncMeshes = () => {
    pieces.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.z = p.rot
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  // Reduced motion: snap to final state, static render
  if (reduced) {
    pieces.forEach(p => { p.z = 0 })
    syncMeshes()
    renderer.render(scene, camera)
    gsap.to(cvs, { opacity: 0.8, duration: 0 })
    const st = ScrollTrigger.create({ trigger: sectionRef?.current || container, start: 'top 72%' })
    return () => {
      st.kill(); geo.dispose(); mat.dispose(); renderer.dispose()
      if (container.contains(cvs)) container.removeChild(cvs)
    }
  }

  syncMeshes()

  const startAnim = () => {
    if (started) return
    started = true
    const rand2 = lcg(33)
    pieces.forEach((p, i) => {
      const finalX = p.x, finalY = p.y
      p.x = (rand2() - 0.5) * 18; p.y = (rand2() - 0.5) * 18; p.z = (rand2() - 0.5) * 10
      gsap.to(p, {
        x: finalX, y: finalY, z: 0,
        duration: 0.9, ease: 'back.out(1.5)', delay: i * 0.018,
      })
    })
    setTimeout(() => { snapped = true }, (PIECE_COUNT * 0.018 + 1.0) * 1000)
  }

  let rafId = null
  const loop = () => {
    pieces.forEach((p, i) => {
      p.rot += p.rotSpeed
      if (snapped) {
        p.z += p.speed
        if (p.z > Z_NEAR) { p.z = Z_FAR; p.scale = 0.3 + Math.random() * 0.4 }
        const tDepth = (p.z - Z_FAR) / (Z_NEAR - Z_FAR)
        dummy.scale.setScalar(p.scale * (0.35 + tDepth * 0.85))
      } else {
        dummy.scale.setScalar(p.scale)
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.z = p.rot
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (snapped) mesh.rotation.z += 0.00035
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)

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
    gsap.killTweensOf(cvs)
    geo.dispose(); mat.dispose(); renderer.dispose()
    if (container.contains(cvs)) container.removeChild(cvs)
  }
}
