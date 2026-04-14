import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createNoise2D } from 'simplex-noise'
import { prefersReducedMotion, isMobileDevice } from '../../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const W = 480, H = 480

function lcg(seed = 99) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

function makeHeightFn() {
  const noise = createNoise2D()
  return (x, z) => {
    const t     = Math.max(0, (x + 2) / 13)
    const slope = Math.pow(t, 1.1) * 5.8
    const n     = noise(x * 0.38, z * 0.38) * 0.75
                + noise(x * 1.0,  z * 1.0)  * 0.28
                + noise(x * 2.6,  z * 2.6)  * 0.10
    return Math.max(0, slope + n)
  }
}

export default function MountainAnimation({ sectionRef }) {
  const containerRef = useRef(null)
  const progressRef  = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cleanup = null

    const lazyObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      lazyObserver.disconnect()
      cleanup = initScene(container, sectionRef, progressRef)
    }, { rootMargin: '200px 0px', threshold: 0 })

    lazyObserver.observe(container)
    return () => { lazyObserver.disconnect(); cleanup?.() }
  }, [])

  return <div ref={containerRef} style={{ width: W, height: H, position: 'relative', overflow: 'hidden', flexShrink: 0 }} />
}

function initScene(container, sectionRef, progressRef) {
  const mobile  = isMobileDevice()
  const reduced = prefersReducedMotion()

  // Pass 2: fewer terrain segments and trees on mobile
  const TERRAIN_SEGS = mobile ? 48 : 96
  const TREE_MAX     = mobile ? 24 : 58
  const PATH_STEPS   = 26

  const getH = makeHeightFn()
  const rand = lcg(77)

  const scene  = new THREE.Scene()
  scene.background = new THREE.Color(0x070d18)
  scene.fog = new THREE.FogExp2(0x070d18, 0.032)

  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 120)
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: false })
  renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  const cvs = renderer.domElement
  cvs.style.cssText = 'opacity:0;position:absolute;top:0;left:0;pointer-events:none;'
  container.appendChild(cvs)

  scene.add(new THREE.AmbientLight(0x2a3d6a, 0.7))
  const sun = new THREE.DirectionalLight(0xffc87a, 1.9); sun.position.set(9, 14, 5); scene.add(sun)
  const fill = new THREE.DirectionalLight(0x1a2860, 0.4); fill.position.set(-5, 4, -4); scene.add(fill)

  // Terrain
  const TERRAIN_SIZE = 24
  const planeGeo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGS, TERRAIN_SEGS)
  planeGeo.rotateX(-Math.PI / 2)
  const pos      = planeGeo.attributes.position
  const colorBuf = new Float32Array(pos.count * 3)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = getH(x, z)
    pos.setY(i, h)
    let r, g, b
    if      (h < 0.25) { r = 0.10; g = 0.24; b = 0.12 }
    else if (h < 1.2)  { r = 0.15; g = 0.34; b = 0.18 }
    else if (h < 2.5)  { r = 0.22; g = 0.40; b = 0.22 }
    else if (h < 3.8)  { r = 0.36; g = 0.30; b = 0.22 }
    else if (h < 5.0)  { r = 0.50; g = 0.46; b = 0.40 }
    else               { r = 0.68; g = 0.68; b = 0.65 }
    colorBuf[i * 3] = r; colorBuf[i * 3 + 1] = g; colorBuf[i * 3 + 2] = b
  }
  planeGeo.computeVertexNormals()
  planeGeo.setAttribute('color', new THREE.BufferAttribute(colorBuf, 3))
  scene.add(new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial({ vertexColors: true })))

  // Trail
  const pathPts = Array.from({ length: PATH_STEPS + 1 }, (_, i) => {
    const t = i / PATH_STEPS, px = -10 + t * 22
    const pz = Math.sin(t * Math.PI * 1.7) * 1.4
    return new THREE.Vector3(px, getH(px, pz) + 0.09, pz)
  })
  const pathCurve = new THREE.CatmullRomCurve3(pathPts)
  scene.add(new THREE.Mesh(
    new THREE.TubeGeometry(pathCurve, 180, 0.07, 7, false),
    new THREE.MeshLambertMaterial({ color: 0xaa8858 })
  ))

  // Trees
  const coneGeo = new THREE.ConeGeometry(0.13, 0.62, 5)
  const cylGeo  = new THREE.CylinderGeometry(0.025, 0.045, 0.20, 4)
  const treeMat = new THREE.MeshLambertMaterial({ color: 0x1c4226 })
  const trkMat  = new THREE.MeshLambertMaterial({ color: 0x3a2010 })
  const treeData = []

  for (let attempt = 0; attempt < 400 && treeData.length < TREE_MAX; attempt++) {
    const tx = -11 + rand() * 23, tz = -11 + rand() * 23
    const pz = Math.sin(((tx + 10) / 23) * Math.PI * 1.7) * 1.4
    if (Math.abs(tz - pz) < 1.1) continue
    const h = getH(tx, tz)
    if (h < 0.2 || h > 4.0) continue
    treeData.push({ x: tx, y: h, z: tz, sc: 0.65 + rand() * 0.7 })
  }

  const N = treeData.length
  const tM = new THREE.InstancedMesh(coneGeo, treeMat, N)
  const trM = new THREE.InstancedMesh(cylGeo, trkMat, N)
  const dm  = new THREE.Object3D()
  treeData.forEach((tp, i) => {
    dm.position.set(tp.x, tp.y + 0.41 * tp.sc, tp.z); dm.scale.setScalar(tp.sc); dm.updateMatrix(); tM.setMatrixAt(i, dm.matrix)
    dm.position.set(tp.x, tp.y + 0.10 * tp.sc, tp.z); dm.scale.setScalar(tp.sc * 0.85); dm.updateMatrix(); trM.setMatrixAt(i, dm.matrix)
  })
  scene.add(tM); scene.add(trM)

  // Camera spline
  const camSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 4.0, 10),
    new THREE.Vector3(-4,  3.0,  7),
    new THREE.Vector3(1,   3.5,  5),
    new THREE.Vector3(5,   6.5,  3.5),
  ])

  const setCamera = (p) => {
    camera.position.copy(camSpline.getPointAt(Math.max(0, Math.min(1, p))))
    camera.lookAt(pathCurve.getPointAt(Math.min(0.12 + p * 0.88, 1)))
  }
  setCamera(0)

  // Reduced motion: static frame at progress 0
  if (reduced) {
    renderer.render(scene, camera)
    gsap.to(cvs, { opacity: 0.8, duration: 0 })
    const st = ScrollTrigger.create({ trigger: sectionRef?.current || container, start: 'top 85%' })
    return () => {
      st.kill()
      scene.traverse(o => { o.geometry?.dispose(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose() } })
      renderer.dispose()
      if (container.contains(cvs)) container.removeChild(cvs)
    }
  }

  let rafId = null
  const loop = () => {
    setCamera(progressRef.current)
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
    start: 'top 85%', end: 'bottom 15%', scrub: 1.2,
    onUpdate: (self) => { progressRef.current = self.progress },
  })

  return () => {
    cancelAnimationFrame(rafId); rafId = null
    fadeObserver.disconnect(); st.kill()
    gsap.killTweensOf(cvs)
    scene.traverse(o => { o.geometry?.dispose(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose() } })
    renderer.dispose()
    if (container.contains(cvs)) container.removeChild(cvs)
  }
}
