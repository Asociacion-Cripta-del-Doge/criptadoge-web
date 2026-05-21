import { useRef, useEffect } from 'react'
import './packReveal.scss'

/* GSAP se carga desde CDN en index.html — declaramos el global para TypeScript */
declare const gsap: typeof import('gsap').gsap

/* ─── Constantes ────────────────────────────────────────────── */
const PARTICLE_COLORS = [
  '#7c74ff', '#1dc990', '#ff6b35', '#e056a0',
  '#4fa8ff', '#f0a500', '#ffd700', '#00e5ff',
]
const SWIPE_THRESHOLD = 90  // px para abrir el sobre
const DOT_COUNT       = 26  // puntos de perforación

/* ─── Tipos ─────────────────────────────────────────────────── */
interface Props {
  onClose: () => void
  onCardRevealed?: (cardId: number) => void
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE
   ═══════════════════════════════════════════════════════════════ */
export const PackReveal = ({ onClose, onCardRevealed }: Props) => {

  /* ── Refs estables para callbacks (evita re-runs en useEffect) ── */
  const onCloseRef         = useRef(onClose)
  const onCardRevealedRef  = useRef(onCardRevealed)
  useEffect(() => { onCloseRef.current        = onClose        }, [onClose])
  useEffect(() => { onCardRevealedRef.current = onCardRevealed }, [onCardRevealed])

  /* ── Estado de la máquina ───────────────────────────────────
     0 = idle  1 = opening  2 = revealed  3 = resetting
     Usamos useRef en lugar de useState para evitar closures
     obsoletos dentro de los callbacks de GSAP.             ── */
  const step = useRef(0)

  /* ── Referencias al DOM ─────────────────────────────────── */
  const sceneRef     = useRef<HTMLDivElement>(null)
  const packRef      = useRef<HTMLDivElement>(null)
  const packTopRef   = useRef<HTMLDivElement>(null)
  const packBotRef   = useRef<HTMLDivElement>(null)
  const packGlareRef = useRef<HTMLDivElement>(null)
  const perfZoneRef  = useRef<HTMLDivElement>(null)
  const perfFillRef  = useRef<HTMLDivElement>(null)
  const cardWrapRef  = useRef<HTMLDivElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const flashRef     = useRef<HTMLDivElement>(null)
  const swipeHintRef = useRef<HTMLDivElement>(null)
  const resetHintRef = useRef<HTMLDivElement>(null)

  /* ── Refs de animación ───────────────────────────────────── */
  const idleTweenRef = useRef<gsap.core.Tween | null>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Refs de interacción (no disparan re-renders) ────────── */
  const tiltActive  = useRef(false)
  const tiltStart   = useRef({ x: 0, y: 0 })
  const swipeActive = useRef(false)
  const swipeStartX = useRef(0)
  const cardTilt    = useRef(false)
  const cardTiltSt  = useRef({ x: 0, y: 0 })

  /* ══════════════════════════════════════════════════════════
     EFECTO PRINCIPAL — toda la lógica de animación e input
     ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    /* Bloquear scroll del body mientras el overlay está abierto */
    document.body.style.overflow = 'hidden'

    /* Shortcuts a los elementos DOM (ya están montados) */
    const scene     = sceneRef.current!
    const pack      = packRef.current!
    const packTop   = packTopRef.current!
    const packBot   = packBotRef.current!
    const packGlare = packGlareRef.current!
    const perfZone  = perfZoneRef.current!
    const perfFill  = perfFillRef.current!
    const cardWrap  = cardWrapRef.current!
    const card      = cardRef.current!
    const flash     = flashRef.current!
    const swipeHint = swipeHintRef.current!
    const resetHint = resetHintRef.current!

    /* ── Entrada de puntos ──────────────────────────────────── */
    function getPoint(e: MouseEvent | TouchEvent) {
      return (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0]
        : (e as MouseEvent)
    }

    /* ── Idle animation del sobre ───────────────────────────── */
    function startIdleAnimation() {
      if (idleTweenRef.current) idleTweenRef.current.kill()
      idleTweenRef.current = gsap.to(pack, {
        y:        -8,
        rotateZ:  0.7,
        duration: 2.4,
        ease:     'sine.inOut',
        yoyo:     true,
        repeat:   -1,
        overwrite: true,
      })
    }

    function stopIdleAnimation() {
      idleTweenRef.current?.kill()
      idleTweenRef.current = null
    }

    /* ── Hint de swipe (aparece a los 3 s sin tocar) ────────── */
    function scheduleHint() {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      hintTimerRef.current = setTimeout(() => {
        gsap.to(swipeHint, { opacity: 1, duration: 0.4 })
      }, 3000)
    }

    function hideHint() {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      gsap.to(swipeHint, { opacity: 0, duration: 0.2 })
    }

    /* ── Burst de partículas en el flash de revelación ──────── */
    function particleBurst() {
      const rect  = scene.getBoundingClientRect()
      const cx    = rect.left + rect.width  / 2
      const cy    = rect.top  + rect.height / 2
      const count = 37

      for (let i = 0; i < count; i++) {
        const p     = document.createElement('div')
        const size  = 3 + Math.random() * 9
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]

        Object.assign(p.style, {
          position:      'fixed',
          left:          `${cx}px`,
          top:           `${cy}px`,
          width:         `${size}px`,
          height:        `${size}px`,
          borderRadius:  '50%',
          background:    color,
          boxShadow:     `0 0 6px ${color}, 0 0 14px ${color}`,
          pointerEvents: 'none',
          zIndex:        '1200',
          transform:     'translate(-50%, -50%)',
        })
        document.body.appendChild(p)

        const angle = (2 * Math.PI / count) * i + (Math.random() - 0.5) * 0.6
        const dist  = 55 + Math.random() * 145

        gsap.fromTo(p,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x:        Math.cos(angle) * dist,
            y:        Math.sin(angle) * dist,
            opacity:  0,
            scale:    0,
            duration: 0.5 + Math.random() * 0.5,
            ease:     'power2.out',
            onComplete: () => p.remove(),
          }
        )
      }
    }

    /* ── Tilt 3D del sobre ──────────────────────────────────── */
    function onPackMouseDown(e: MouseEvent) {
      if (step.current !== 0) return
      if ((e.target as Element).closest('.perf-zone')) return
      tiltActive.current = true
      tiltStart.current  = { x: e.clientX, y: e.clientY }
      stopIdleAnimation()
      gsap.killTweensOf(pack, 'rotateX,rotateY')
    }

    function onPackTouchStart(e: TouchEvent) {
      if (step.current !== 0) return
      if ((e.target as Element).closest('.perf-zone')) return
      tiltActive.current = true
      tiltStart.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      stopIdleAnimation()
      gsap.killTweensOf(pack, 'rotateX,rotateY')
    }

    function applyPackTilt(clientX: number, clientY: number) {
      const dx   = clientX - tiltStart.current.x
      const dy   = clientY - tiltStart.current.y
      const rotY = Math.max(-28, Math.min(28,  dx * 0.28))
      const rotX = Math.max(-18, Math.min(18, -dy * 0.22))
      gsap.to(pack, { rotateY: rotY, rotateX: rotX, duration: 0.08, overwrite: true })

      const r  = pack.getBoundingClientRect()
      const gx = ((clientX - r.left) / r.width)  * 100
      const gy = ((clientY - r.top)  / r.height) * 100
      packGlare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, transparent 65%)`
    }

    function releasePackTilt() {
      if (!tiltActive.current) return
      tiltActive.current = false
      gsap.to(pack, {
        rotateY: 0, rotateX: 0,
        duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: true,
      })
      packGlare.style.background =
        'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 65%)'
      startIdleAnimation()
    }

    /* ── Hover glare (sin drag) ──────────────────────────────── */
    function onPackMouseMove(e: MouseEvent) {
      if (step.current !== 0 || tiltActive.current) return
      const r  = pack.getBoundingClientRect()
      const gx = ((e.clientX - r.left) / r.width)  * 100
      const gy = ((e.clientY - r.top)  / r.height) * 100
      packGlare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.14) 0%, transparent 65%)`
    }

    function onPackMouseLeave() {
      if (step.current !== 0) return
      packGlare.style.background =
        'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 65%)'
    }

    /* ── Swipe horizontal en la zona de perforación ─────────── */
    function onPerfMouseDown(e: MouseEvent) {
      if (step.current !== 0) return
      e.stopPropagation()
      swipeActive.current = true
      swipeStartX.current  = e.clientX
      hideHint()
      stopIdleAnimation()
    }

    function onPerfTouchStart(e: TouchEvent) {
      if (step.current !== 0) return
      e.stopPropagation()
      swipeActive.current = true
      swipeStartX.current  = e.touches[0].clientX
      hideHint()
      stopIdleAnimation()
    }

    function applySwipe(clientX: number) {
      const dx  = Math.max(0, clientX - swipeStartX.current)
      const pct = Math.min(dx / SWIPE_THRESHOLD, 1)
      perfFill.style.width = `${pct * 100}%`
      if (pct >= 1) {
        swipeActive.current = false
        openPack()
      }
    }

    function releaseSwipe() {
      if (!swipeActive.current) return
      swipeActive.current = false
      gsap.to(perfFill, { width: '0%', duration: 0.3, ease: 'power2.out' })
      startIdleAnimation()
      scheduleHint()
    }

    /* ── Tilt de la carta revelada ───────────────────────────── */
    function onCardMouseDown(e: MouseEvent) {
      if (step.current !== 2) return
      cardTilt.current   = true
      cardTiltSt.current = { x: e.clientX, y: e.clientY }
      gsap.killTweensOf(card, 'rotateX,rotateY')
    }

    function onCardTouchStart(e: TouchEvent) {
      if (step.current !== 2) return
      cardTilt.current   = true
      cardTiltSt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      gsap.killTweensOf(card, 'rotateX,rotateY')
    }

    function applyCardTilt(clientX: number, clientY: number) {
      if (!cardTilt.current) return
      const dx   = clientX - cardTiltSt.current.x
      const dy   = clientY - cardTiltSt.current.y
      const rotY = 180 + Math.max(-22, Math.min(22,  dx * 0.22))
      const rotX =       Math.max(-15, Math.min(15, -dy * 0.18))
      gsap.to(card, { rotateY: rotY, rotateX: rotX, duration: 0.08, overwrite: true })
    }

    function releaseCardTilt() {
      if (!cardTilt.current) return
      cardTilt.current = false
      gsap.to(card, {
        rotateY: 180, rotateX: 0,
        duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: true,
      })
    }

    function startCardIdle() {
      gsap.fromTo(card,
        { rotateY: 177 },
        { rotateY: 183, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }
      )
    }

    /* ── Apertura del sobre — timeline GSAP ─────────────────── */
    function openPack() {
      if (step.current !== 0) return
      step.current = 1
      stopIdleAnimation()
      hideHint()
      gsap.set(perfFill, { width: '0%' })

      // Ocultar zona de perforación antes de animar
      gsap.set(perfZone, { opacity: 0 })

      const packH = pack.offsetHeight

      const tl = gsap.timeline({
        defaults:   { overwrite: 'auto' },
        onComplete: () => {
          step.current = 2
          cardWrap.style.pointerEvents = 'auto'
          startCardIdle()
          gsap.to(resetHint, { opacity: 1, duration: 0.5, delay: 0.6 })
          /* Notificar al álbum con una carta aleatoria (1-10) */
          const cardId = Math.ceil(Math.random() * 10)
          onCardRevealedRef.current?.(cardId)
        },
      })

      // 1. Reset de posición
      tl.set(pack, { x: 0, y: 0, rotateZ: 0, rotateX: 0, rotateY: 0 })

      // 2. Tensión (~260 ms)
      tl.to(pack, { scaleY: 0.97, scaleX: 1.01, duration: 0.13 })
        .to(pack, { scaleY: 1,    scaleX: 1,    duration: 0.13 })

      // 3. Vibración (~220 ms)
      tl.to(pack, { keyframes: { x: [-4, 4, -3, 3, 0] }, duration: 0.22 })

      // 4. Carta preparada entre las mitades
      tl.set(cardWrap, { opacity: 1, y: 0, rotateY: 0 })

      // 5. Separación simultánea (700 ms)
      tl.to(packTop, {
        y: -(packH * 0.82 + 60), rotateX: -12,
        duration: 0.7, ease: 'power3.inOut', transformOrigin: '50% 100%',
      }, '<')
      tl.to(packBot, {
        y:  (packH * 0.18 + 60), rotateX:  8,
        duration: 0.7, ease: 'power3.inOut', transformOrigin: '50% 0%',
      }, '<')

      // 6. Flash + partículas (offset −0.48 s dentro de la separación)
      tl.to(flash, { opacity: 1, duration: 0.08 }, '-=0.48')
      tl.call(particleBurst)
      tl.to(flash, { opacity: 0, duration: 0.45 }, '<')

      // 7. Carta sube (offset −0.52 s)
      tl.to(cardWrap, { y: -18, duration: 0.55, ease: 'back.out(1.4)' }, '-=0.52')

      // 8. Mitades salen de pantalla
      tl.to(packTop, { y: -560, opacity: 0, duration: 0.4, ease: 'power2.in' })
      tl.to(packBot, { y:  560, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')

      // 9. Carta se centra
      tl.to(cardWrap, { y: 0, duration: 0.32, ease: 'power2.out' })

      // 10. Flip dorso → frente (0° → 90° → 180°)
      tl.to(card, { rotateY: 90,  duration: 0.34, ease: 'power2.in',      delay: 0.42 })
      tl.to(card, { rotateY: 180, duration: 0.44, ease: 'back.out(1.4)' })

      // 11. Bounce de revelación
      tl.to(card, { scale: 1.05, duration: 0.15, ease: 'power2.out' })
      tl.to(card, { scale: 1,    duration: 0.6,  ease: 'elastic.out(1, 0.5)' })
    }

    /* ── Reset — vuelve al sobre cerrado ─────────────────────── */
    function resetPack() {
      if (step.current !== 2) return
      step.current = 3
      gsap.killTweensOf([card, cardWrap])
      cardWrap.style.pointerEvents = 'none'
      gsap.to(resetHint, { opacity: 0, duration: 0.2 })

      const tl = gsap.timeline({
        onComplete: () => {
          step.current = 0
          startIdleAnimation()
          scheduleHint()
        },
      })

      tl.to(cardWrap, { opacity: 0, scale: 0.9, y: 30, duration: 0.35, ease: 'power2.in' })
      tl.set(card, { rotateY: 0, rotateX: 0, scale: 1 })
      tl.set(packTop, { y: 0, rotateX: 0, opacity: 1 })
      tl.set(packBot,  { y: 0, rotateX: 0, opacity: 1 })
      tl.set(perfFill, { width: '0%' })
      tl.set(perfZone, { opacity: 1 })
      tl.set(pack, { opacity: 0, scale: 0.9 })
      tl.to(pack, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' })
    }

    /* ── Listeners unificados en window ────────────────────────
       Necesitamos referencias estables para poder eliminarlos
       en el cleanup.                                        ── */
    const onWindowMouseMove = (e: MouseEvent) => {
      if (tiltActive.current)  applyPackTilt(e.clientX, e.clientY)
      if (swipeActive.current) applySwipe(e.clientX)
      if (cardTilt.current)    applyCardTilt(e.clientX, e.clientY)
    }

    const onWindowMouseUp = () => {
      if (tiltActive.current)  releasePackTilt()
      if (swipeActive.current) releaseSwipe()
      if (cardTilt.current)    releaseCardTilt()
    }

    const onWindowTouchMove = (e: TouchEvent) => {
      const { clientX, clientY } = e.touches[0]
      if (tiltActive.current)  applyPackTilt(clientX, clientY)
      if (swipeActive.current) { e.preventDefault(); applySwipe(clientX) }
      if (cardTilt.current)    applyCardTilt(clientX, clientY)
    }

    const onWindowTouchEnd = () => {
      if (tiltActive.current)  releasePackTilt()
      if (swipeActive.current) releaseSwipe()
      if (cardTilt.current)    releaseCardTilt()
    }

    const onSceneClick = () => {
      if (step.current === 2) resetPack()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }

    /* ── Registro de listeners ───────────────────────────────── */
    pack.addEventListener('mousedown',  onPackMouseDown)
    pack.addEventListener('touchstart', onPackTouchStart, { passive: true })
    pack.addEventListener('mousemove',  onPackMouseMove)
    pack.addEventListener('mouseleave', onPackMouseLeave)

    perfZone.addEventListener('mousedown',  onPerfMouseDown)
    perfZone.addEventListener('touchstart', onPerfTouchStart, { passive: false })

    cardWrap.addEventListener('mousedown',  onCardMouseDown)
    cardWrap.addEventListener('touchstart', onCardTouchStart, { passive: true })

    scene.addEventListener('click', onSceneClick)

    window.addEventListener('mousemove',  onWindowMouseMove)
    window.addEventListener('mouseup',    onWindowMouseUp)
    window.addEventListener('touchmove',  onWindowTouchMove, { passive: false })
    window.addEventListener('touchend',   onWindowTouchEnd)
    window.addEventListener('keydown',    onKeyDown)

    /* ── Arranque ────────────────────────────────────────────── */
    startIdleAnimation()
    scheduleHint()

    /* ── Cleanup al desmontar ────────────────────────────────── */
    return () => {
      document.body.style.overflow = ''

      pack.removeEventListener('mousedown',  onPackMouseDown)
      pack.removeEventListener('touchstart', onPackTouchStart)
      pack.removeEventListener('mousemove',  onPackMouseMove)
      pack.removeEventListener('mouseleave', onPackMouseLeave)

      perfZone.removeEventListener('mousedown',  onPerfMouseDown)
      perfZone.removeEventListener('touchstart', onPerfTouchStart)

      cardWrap.removeEventListener('mousedown',  onCardMouseDown)
      cardWrap.removeEventListener('touchstart', onCardTouchStart)

      scene.removeEventListener('click', onSceneClick)

      window.removeEventListener('mousemove',  onWindowMouseMove)
      window.removeEventListener('mouseup',    onWindowMouseUp)
      window.removeEventListener('touchmove',  onWindowTouchMove)
      window.removeEventListener('touchend',   onWindowTouchEnd)
      window.removeEventListener('keydown',    onKeyDown)

      gsap.killTweensOf([pack, packTop, packBot, card, cardWrap, flash, swipeHint, resetHint])
      idleTweenRef.current?.kill()
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="pack-reveal">
      {/* Botón cerrar */}
      <button className="pack-reveal__close" onClick={onClose} aria-label="Cerrar">✕</button>

      {/* Flash de revelación */}
      <div className="pack-reveal__flash" ref={flashRef} />

      {/* Hint de reset */}
      <p className="pack-reveal__reset-hint" ref={resetHintRef}>
        Haz clic para abrir otro sobre
      </p>

      {/* Escena principal */}
      <div className="pack-reveal__scene" ref={sceneRef}>
        <div className="pack-reveal__stack">

          {/* CARTA — detrás del sobre (z-index inferior) */}
          <div className="pack-reveal__card-wrap" ref={cardWrapRef}>
            <div className="pack-reveal__card" ref={cardRef}>
              <div className="pack-reveal__c-back">
                <div className="pack-reveal__c-back-img">
                  ESPALDA<br />CARTA
                </div>
              </div>
              <div className="pack-reveal__c-front">
                <div className="pack-reveal__c-front-img">
                  FRENTE<br />CARTA
                </div>
              </div>
            </div>
          </div>

          {/* SOBRE — delante de la carta (z-index superior) */}
          <div className="pack-reveal__pack" ref={packRef}>
            {/* Cara trasera (visible en tilt extremo) */}
            <div className="pack-reveal__pack-back">
              <div className="pack-reveal__pack-back-img">ESPALDA<br />DEL SOBRE</div>
            </div>

            {/* Mitad superior — 18% */}
            <div className="pack-reveal__pack-top" ref={packTopRef}>
              <div className="pack-reveal__pack-top-img">
                CRIPTA DE DOGE<br />ASOCIACION
              </div>
            </div>

            {/* Zona de perforación */}
            <div className="pack-reveal__perf-zone perf-zone" ref={perfZoneRef}>
              <div className="pack-reveal__perf-fill" ref={perfFillRef} />
              <div className="pack-reveal__perf-dots">
                {Array.from({ length: DOT_COUNT }, (_, i) => (
                  <span key={i} className="pack-reveal__perf-dot" />
                ))}
              </div>
            </div>

            {/* Mitad inferior — 82% */}
            <div className="pack-reveal__pack-bot" ref={packBotRef}>
              <div className="pack-reveal__pack-bot-img">
                FRENTE SOBRE<br />IMAGEN PRINCIPAL<br />85-90% ALTURA
              </div>
              {/* Glare reactivo al cursor */}
              <div className="pack-reveal__pack-glare" ref={packGlareRef} />
            </div>
          </div>

          {/* Hint de swipe (aparece tras 3 s de inactividad) */}
          <div className="pack-reveal__swipe-hint" ref={swipeHintRef}>
            <span className="pack-reveal__hint-text">Desliza para abrir</span>
            <div className="pack-reveal__hint-dots">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="pack-reveal__hint-dot" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
