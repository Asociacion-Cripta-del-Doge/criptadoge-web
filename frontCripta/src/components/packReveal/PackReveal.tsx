import { useRef, useEffect, useState, useCallback } from 'react'
import './packReveal.scss'
import { useAuth } from '../../context/AuthContext'

declare const gsap: typeof import('gsap').gsap

/* ─── Constantes ────────────────────────────────────────────── */
const PARTICLE_COLORS = [
  '#7c74ff', '#1dc990', '#ff6b35', '#e056a0',
  '#4fa8ff', '#f0a500', '#ffd700', '#00e5ff',
]
const LEGENDARY_COLORS = [
  '#ffd700', '#ffed4a', '#fff176', '#ffe082', '#ffca28',
  '#7c74ff', '#4fa8ff', '#00e5ff',
]
const SWIPE_THRESHOLD = 90
const DOT_COUNT       = 26

/* ─── Efectos por rareza ─────────────────────────────────────── */
const RARITY_FLASH: Record<string, string> = {
  COMUN:      'radial-gradient(circle at 50% 50%, rgba(200,160,255,0.85) 0%, transparent 70%)',
  RARA:       'radial-gradient(circle at 50% 50%, rgba(100,160,255,0.92) 0%, transparent 70%)',
  EPICA:      'radial-gradient(circle at 50% 50%, rgba(200,100,255,0.92) 0%, transparent 70%)',
  LEGENDARIA: 'radial-gradient(circle at 50% 50%, rgba(255,220,0,0.96) 0%, transparent 70%)',
}
const RARITY_PARTICLE_COUNT: Record<string, number> = {
  COMUN: 37, RARA: 48, EPICA: 60, LEGENDARIA: 80,
}
const RARITY_GLOW: Record<string, { border: string; shadow: string }> = {
  COMUN:      { border: '#00e5ff', shadow: '0 0 20px rgba(0,229,255,0.5)' },
  RARA:       { border: '#4fa8ff', shadow: '0 0 28px rgba(79,168,255,0.65), 0 0 50px rgba(79,168,255,0.3)' },
  EPICA:      { border: '#c060ff', shadow: '0 0 34px rgba(192,96,255,0.75), 0 0 64px rgba(192,96,255,0.35)' },
  LEGENDARIA: { border: '#ffd700', shadow: '0 0 42px rgba(255,215,0,0.88), 0 0 84px rgba(255,215,0,0.45)' },
}

/* ─── Tipos ─────────────────────────────────────────────────── */
interface Props {
  onClose:          () => void
  onCardRevealed?:  (cardId: number) => boolean  // devuelve true si era duplicado
  onPackOpened?:    () => void                   // llamado una vez tras revelar
  packPrice?:       number
}

interface RevealedCard {
  id: number
  name: string
  imageUrl: string | null
  rarity: string
}

/* ─── Helpers ───────────────────────────────────────────────── */
function getHighestRarity(cards: RevealedCard[]): string {
  if (cards.some(c => c.rarity === 'LEGENDARIA')) return 'LEGENDARIA'
  if (cards.some(c => c.rarity === 'EPICA'))       return 'EPICA'
  if (cards.some(c => c.rarity === 'RARA'))         return 'RARA'
  return 'COMUN'
}

async function openPackWithRetry(packId: number, token: string): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`/api/packs/${packId}/open`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) return true
    } catch {}
    if (attempt < 2) await new Promise(r => setTimeout(r, 700 * (attempt + 1)))
  }
  return false
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE
   ═══════════════════════════════════════════════════════════════ */
export const PackReveal = ({ onClose, onCardRevealed, onPackOpened, packPrice = 100 }: Props) => {
  const onCloseRef        = useRef(onClose)
  const onCardRevealedRef = useRef(onCardRevealed)
  const onPackOpenedRef   = useRef(onPackOpened)
  useEffect(() => { onCloseRef.current        = onClose        }, [onClose])
  useEffect(() => { onCardRevealedRef.current = onCardRevealed }, [onCardRevealed])
  useEffect(() => { onPackOpenedRef.current   = onPackOpened   }, [onPackOpened])

  const { user, refreshUser } = useAuth()
  const refreshUserRef = useRef(refreshUser)
  useEffect(() => { refreshUserRef.current = refreshUser }, [refreshUser])

  const [phase, setPhase]               = useState<'buy' | 'animating'>('buy')
  const [buying, setBuying]             = useState(false)
  const [coinsError, setCoinsError]     = useState('')
  const [openError, setOpenError]       = useState(false)
  const [revealedCards, setRevealedCards] = useState<RevealedCard[]>([])
  const [duplicates, setDuplicates]     = useState<boolean[]>([])

  const revealedCardsRef = useRef<RevealedCard[]>([])
  const packIdRef        = useRef<number | null>(null)
  const packReadyRef     = useRef(false)
  const step             = useRef(0)

  /* ── DOM refs ─────────────────────────────────────────────── */
  const sceneRef     = useRef<HTMLDivElement>(null)
  const packRef      = useRef<HTMLDivElement>(null)
  const packTopRef   = useRef<HTMLDivElement>(null)
  const packBotRef   = useRef<HTMLDivElement>(null)
  const packGlareRef = useRef<HTMLDivElement>(null)
  const perfZoneRef  = useRef<HTMLDivElement>(null)
  const perfFillRef  = useRef<HTMLDivElement>(null)
  const cardWrapRef  = useRef<HTMLDivElement>(null)
  const card1Ref     = useRef<HTMLDivElement>(null)
  const card2Ref     = useRef<HTMLDivElement>(null)
  const flashRef     = useRef<HTMLDivElement>(null)
  const swipeHintRef = useRef<HTMLDivElement>(null)
  const resetHintRef = useRef<HTMLDivElement>(null)

  /* ── Interaction refs ─────────────────────────────────────── */
  const idleTweenRef = useRef<gsap.core.Tween | null>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tiltActive   = useRef(false)
  const tiltStart    = useRef({ x: 0, y: 0 })
  const swipeActive  = useRef(false)
  const swipeStartX  = useRef(0)
  const cardTilt     = useRef(false)
  const cardTiltSt   = useRef({ x: 0, y: 0 })

  /* ── Compra ───────────────────────────────────────────────── */
  const buyPack = useCallback(async () => {
    packReadyRef.current = false
    packIdRef.current    = null
    setCoinsError('')
    setOpenError(false)

    const token = sessionStorage.getItem('access_token')
    try {
      const res = await fetch('/api/packs/buy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setCoinsError(data.message ?? 'Monedas insuficientes')
        return
      }
      const pack = await res.json()
      packIdRef.current    = pack.id
      packReadyRef.current = true

      const cards: RevealedCard[] = (pack.cards ?? []).map((pc: any) => pc.card ?? pc)
      revealedCardsRef.current = cards
      setRevealedCards(cards)
      refreshUserRef.current()
    } catch {
      setCoinsError('Error de conexión')
    }
  }, [])

  const handleBuyClick = async () => {
    setBuying(true)
    setDuplicates([])
    await buyPack()
    setBuying(false)
    if (packIdRef.current) setPhase('animating')
  }

  /* ── Asequibilidad calculada en tiempo real ───────────────── */
  const coins        = user?.coins ?? 0
  const canAfford    = coins >= packPrice
  const packsCanBuy  = Math.floor(coins / packPrice)

  /* ══════════════════════════════════════════════════════════
     EFECTO PRINCIPAL
     ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (phase !== 'animating') return

    document.body.style.overflow = 'hidden'

    const scene     = sceneRef.current!
    const pack      = packRef.current!
    const packTop   = packTopRef.current!
    const packBot   = packBotRef.current!
    const packGlare = packGlareRef.current!
    const perfZone  = perfZoneRef.current!
    const perfFill  = perfFillRef.current!
    const cardWrap  = cardWrapRef.current!
    const card1     = card1Ref.current!
    const card2     = card2Ref.current!
    const flash     = flashRef.current!
    const swipeHint = swipeHintRef.current!
    const resetHint = resetHintRef.current!

    gsap.set(cardWrap, { xPercent: -50, yPercent: -50, opacity: 0 })

    function startIdleAnimation() {
      if (idleTweenRef.current) idleTweenRef.current.kill()
      idleTweenRef.current = gsap.to(pack, {
        y: -8, rotateZ: 0.7, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, overwrite: true,
      })
    }
    function stopIdleAnimation() { idleTweenRef.current?.kill(); idleTweenRef.current = null }

    function scheduleHint() {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      hintTimerRef.current = setTimeout(() => gsap.to(swipeHint, { opacity: 1, duration: 0.4 }), 3000)
    }
    function hideHint() {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      gsap.to(swipeHint, { opacity: 0, duration: 0.2 })
    }

    function particleBurst(count: number, colors = PARTICLE_COLORS) {
      const rect = scene.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      for (let i = 0; i < count; i++) {
        const p     = document.createElement('div')
        const size  = 3 + Math.random() * 9
        const color = colors[Math.floor(Math.random() * colors.length)]
        Object.assign(p.style, {
          position: 'fixed', left: `${cx}px`, top: `${cy}px`,
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: color, boxShadow: `0 0 6px ${color}, 0 0 14px ${color}`,
          pointerEvents: 'none', zIndex: '1200', transform: 'translate(-50%,-50%)',
        })
        document.body.appendChild(p)
        const angle = (2 * Math.PI / count) * i + (Math.random() - 0.5) * 0.6
        const dist  = 55 + Math.random() * 145
        gsap.fromTo(p, { x: 0, y: 0, opacity: 1, scale: 1 }, {
          x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
          opacity: 0, scale: 0,
          duration: 0.5 + Math.random() * 0.5, ease: 'power2.out',
          onComplete: () => p.remove(),
        })
      }
    }

    /* ── Tilt sobre ─────────────────────────────────────────── */
    function onPackMouseDown(e: MouseEvent) {
      if (step.current !== 0) return
      if ((e.target as Element).closest('.perf-zone')) return
      tiltActive.current = true; tiltStart.current = { x: e.clientX, y: e.clientY }
      stopIdleAnimation(); gsap.killTweensOf(pack, 'rotateX,rotateY')
    }
    function onPackTouchStart(e: TouchEvent) {
      if (step.current !== 0) return
      if ((e.target as Element).closest('.perf-zone')) return
      tiltActive.current = true; tiltStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      stopIdleAnimation(); gsap.killTweensOf(pack, 'rotateX,rotateY')
    }
    function applyPackTilt(clientX: number, clientY: number) {
      const dx   = clientX - tiltStart.current.x
      const dy   = clientY - tiltStart.current.y
      const rotY = Math.max(-28, Math.min(28,  dx * 0.28))
      const rotX = Math.max(-18, Math.min(18, -dy * 0.22))
      gsap.to(pack, { rotateY: rotY, rotateX: rotX, duration: 0.08, overwrite: true })
      const r = pack.getBoundingClientRect()
      packGlare.style.background = `radial-gradient(circle at ${((clientX-r.left)/r.width)*100}% ${((clientY-r.top)/r.height)*100}%, rgba(255,255,255,0.18) 0%, transparent 65%)`
    }
    function releasePackTilt() {
      if (!tiltActive.current) return
      tiltActive.current = false
      gsap.to(pack, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)', overwrite: true })
      packGlare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 65%)'
      startIdleAnimation()
    }
    function onPackMouseMove(e: MouseEvent) {
      if (step.current !== 0 || tiltActive.current) return
      const r = pack.getBoundingClientRect()
      packGlare.style.background = `radial-gradient(circle at ${((e.clientX-r.left)/r.width)*100}% ${((e.clientY-r.top)/r.height)*100}%, rgba(255,255,255,0.14) 0%, transparent 65%)`
    }
    function onPackMouseLeave() {
      if (step.current !== 0) return
      packGlare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 65%)'
    }

    /* ── Swipe ──────────────────────────────────────────────── */
    function onPerfMouseDown(e: MouseEvent) {
      if (step.current !== 0) return
      e.stopPropagation(); swipeActive.current = true; swipeStartX.current = e.clientX
      hideHint(); stopIdleAnimation()
    }
    function onPerfTouchStart(e: TouchEvent) {
      if (step.current !== 0) return
      e.stopPropagation(); swipeActive.current = true; swipeStartX.current = e.touches[0].clientX
      hideHint(); stopIdleAnimation()
    }
    function applySwipe(clientX: number) {
      const pct = Math.min(Math.max(0, clientX - swipeStartX.current) / SWIPE_THRESHOLD, 1)
      perfFill.style.width = `${pct * 100}%`
      if (pct >= 1) { swipeActive.current = false; openPack() }
    }
    function releaseSwipe() {
      if (!swipeActive.current) return
      swipeActive.current = false
      gsap.to(perfFill, { width: '0%', duration: 0.3, ease: 'power2.out' })
      startIdleAnimation(); scheduleHint()
    }

    /* ── Tilt cartas ────────────────────────────────────────── */
    function onCardMouseDown(e: MouseEvent) {
      if (step.current !== 2) return
      cardTilt.current = true; cardTiltSt.current = { x: e.clientX, y: e.clientY }
      gsap.killTweensOf([card1, card2], 'rotateX,rotateY')
    }
    function onCardTouchStart(e: TouchEvent) {
      if (step.current !== 2) return
      cardTilt.current = true; cardTiltSt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      gsap.killTweensOf([card1, card2], 'rotateX,rotateY')
    }
    function applyCardTilt(clientX: number, clientY: number) {
      if (!cardTilt.current) return
      const rotY = 180 + Math.max(-22, Math.min(22, (clientX - cardTiltSt.current.x) * 0.22))
      const rotX =       Math.max(-15, Math.min(15, -(clientY - cardTiltSt.current.y) * 0.18))
      gsap.to([card1, card2], { rotateY: rotY, rotateX: rotX, duration: 0.08, overwrite: true })
    }
    function releaseCardTilt() {
      if (!cardTilt.current) return
      cardTilt.current = false
      gsap.to([card1, card2], { rotateY: 180, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)', overwrite: true })
    }
    function startCardIdle() {
      gsap.fromTo(card1, { rotateY: 177 }, { rotateY: 183, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.fromTo(card2, { rotateY: 177 }, { rotateY: 183, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4 })
    }

    /* ── Flip individual + glow por rareza ──────────────────── */
    function flipCard(card: HTMLDivElement, rarity: string, delay: number, onDone: () => void) {
      gsap.to(card, { rotateY: 90, duration: 0.34, ease: 'power2.in', delay,
        onComplete: () => {
          /* Aplicar glow de rareza al frente justo cuando se voltea */
          const frontEl = card.querySelector('.pack-reveal__c-front') as HTMLElement | null
          if (frontEl) {
            const fx = RARITY_GLOW[rarity] ?? RARITY_GLOW.COMUN
            gsap.to(frontEl, { borderColor: fx.border, boxShadow: fx.shadow, duration: 0.35 })
          }
          gsap.to(card, { rotateY: 180, duration: 0.44, ease: 'back.out(1.4)',
            onComplete: () => {
              gsap.to(card, { scale: 1.05, duration: 0.15, ease: 'power2.out',
                onComplete: () => {
                  gsap.to(card, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)', onComplete: onDone })
                }
              })
            },
          })
        },
      })
    }

    /* ── Revelación de ambas cartas ─────────────────────────── */
    async function onAllFlipsDone() {
      step.current = 2
      cardWrap.style.pointerEvents = 'auto'
      startCardIdle()
      gsap.to(resetHint, { opacity: 1, duration: 0.5, delay: 0.4 })

      /* Notificar álbum: isOwned antes de addCard → detecta duplicados */
      const dups = revealedCardsRef.current.map(c =>
        onCardRevealedRef.current?.(c.id) ?? false,
      )
      setDuplicates(dups)
      onPackOpenedRef.current?.()

      /* Abrir sobre en backend con reintentos */
      const packId = packIdRef.current
      const token  = sessionStorage.getItem('access_token')
      if (packId && token) {
        const opened = await openPackWithRetry(packId, token)
        if (!opened) setOpenError(true)
      }
      refreshUserRef.current()
    }

    function revealBothCards() {
      const r1 = revealedCardsRef.current[0]?.rarity ?? 'COMUN'
      const r2 = revealedCardsRef.current[1]?.rarity ?? 'COMUN'
      let done = 0
      const onDone = () => { if (++done < 2) return; onAllFlipsDone() }
      flipCard(card1, r1, 0.1, onDone)
      flipCard(card2, r2, 0.35, onDone)
    }

    /* ── Apertura del sobre ─────────────────────────────────── */
    function openPack() {
      if (step.current !== 0 || !packReadyRef.current) return
      step.current = 1
      stopIdleAnimation(); hideHint()
      gsap.set(perfFill, { width: '0%' })
      gsap.set(perfZone, { opacity: 0 })

      /* Efectos visuales según la rareza más alta del sobre */
      const tier          = getHighestRarity(revealedCardsRef.current)
      const particleCount = RARITY_PARTICLE_COUNT[tier] ?? 37
      const particleColors = tier === 'LEGENDARIA' ? LEGENDARY_COLORS : PARTICLE_COLORS
      flash.style.background = RARITY_FLASH[tier]

      const packH = pack.offsetHeight
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete: revealBothCards })

      tl.set(pack, { x: 0, y: 0, rotateZ: 0, rotateX: 0, rotateY: 0 })
      tl.to(pack, { scaleY: 0.97, scaleX: 1.01, duration: 0.13 })
        .to(pack, { scaleY: 1,    scaleX: 1,    duration: 0.13 })
      tl.to(pack, { keyframes: { x: [-4, 4, -3, 3, 0] }, duration: 0.22 })

      tl.to(packTop, { y: -(packH * 0.82 + 60), rotateX: -12, duration: 0.7, ease: 'power3.inOut', transformOrigin: '50% 100%' }, '<')
      tl.to(packBot, { y:  (packH * 0.18 + 60), rotateX:  8,  duration: 0.7, ease: 'power3.inOut', transformOrigin: '50% 0%'   }, '<')

      tl.to(flash, { opacity: 1, duration: 0.08 }, '-=0.48')
      tl.call(() => particleBurst(particleCount, particleColors))
      tl.to(flash, { opacity: 0, duration: tier === 'LEGENDARIA' ? 0.7 : 0.45 }, '<')

      tl.to(packTop, { y: -560, opacity: 0, duration: 0.4, ease: 'power2.in' })
      tl.to(packBot, { y:  560, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')

      tl.set(cardWrap, { opacity: 1 })
      tl.fromTo([card1, card2],
        { y: 60, opacity: 0, scale: 0.82 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.14, duration: 0.5, ease: 'back.out(1.5)' },
      )

      /* Para legendaria: segundo burst dorado después de la entrada */
      if (tier === 'LEGENDARIA') {
        tl.call(() => particleBurst(40, LEGENDARY_COLORS), undefined, '+=0.1')
      }
    }

    /* ── Reset ──────────────────────────────────────────────── */
    function resetPack() {
      if (step.current !== 2) return
      step.current = 3
      gsap.killTweensOf([card1, card2, cardWrap])
      cardWrap.style.pointerEvents = 'none'
      gsap.to(resetHint, { opacity: 0, duration: 0.2 })
      gsap.to(cardWrap, {
        opacity: 0, scale: 0.9, y: 30, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          step.current = 0
          setPhase('buy')
          setRevealedCards([])
          setDuplicates([])
          revealedCardsRef.current = []
        },
      })
    }

    /* ── Listeners ──────────────────────────────────────────── */
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
    const onSceneClick = () => { if (step.current === 2) resetPack() }
    const onKeyDown    = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }

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

    startIdleAnimation()
    scheduleHint()

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
      gsap.killTweensOf([pack, packTop, packBot, card1, card2, cardWrap, flash, swipeHint, resetHint])
      idleTweenRef.current?.kill()
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="pack-reveal">
      <button className="pack-reveal__close" onClick={onClose} aria-label="Cerrar">✕</button>

      {/* ── Pantalla de compra ───────────────────────────────── */}
      {phase === 'buy' && (
        <div className="pack-reveal__buy-screen">
          <div className="pack-reveal__buy-pack-icon" />

          <h2 className="pack-reveal__buy-title">Sobre de Cartas</h2>
          <p className="pack-reveal__buy-subtitle">2 cartas aleatorias · sorteo ponderado por rareza</p>

          {/* Saldo del usuario */}
          <div className="pack-reveal__buy-balance">
            <span className="pack-reveal__buy-balance-coins">{coins} 🪙</span>
            {canAfford && packsCanBuy > 1 && (
              <span className="pack-reveal__buy-balance-hint">
                puedes comprar {packsCanBuy} sobres
              </span>
            )}
            {!canAfford && (
              <span className="pack-reveal__buy-balance-short">
                te faltan {packPrice - coins} 🪙
              </span>
            )}
          </div>

          {coinsError && <p className="pack-reveal__buy-error">{coinsError}</p>}

          {/* Error de apertura (reintentos fallidos) */}
          {openError && (
            <p className="pack-reveal__buy-error">
              Error al registrar las cartas. Contacta con un administrador.
            </p>
          )}

          <button
            className="pack-reveal__buy-btn"
            onClick={handleBuyClick}
            disabled={buying || !canAfford}
          >
            {buying ? 'Comprando…' : `Comprar sobre — ${packPrice} 🪙`}
          </button>
        </div>
      )}

      {/* ── Animación del sobre ──────────────────────────────── */}
      {phase === 'animating' && (
        <>
          <div className="pack-reveal__flash" ref={flashRef} />

          <p className="pack-reveal__reset-hint" ref={resetHintRef}>
            Haz clic para abrir otro sobre
          </p>

          <div className="pack-reveal__scene" ref={sceneRef}>
            <div className="pack-reveal__stack">

              <div className="pack-reveal__card-wrap" ref={cardWrapRef}>

                {/* Carta 1 */}
                <div className="pack-reveal__card" ref={card1Ref}>
                  <div className="pack-reveal__c-back"><div className="pack-reveal__c-back-img" /></div>
                  <div className="pack-reveal__c-front">
                    {revealedCards[0]?.imageUrl
                      ? <img src={revealedCards[0].imageUrl} alt={revealedCards[0].name} className="pack-reveal__c-img" />
                      : <div className={`pack-reveal__c-placeholder pack-reveal__c-placeholder--${(revealedCards[0]?.rarity ?? 'comun').toLowerCase()}`}>
                          <span>{revealedCards[0]?.name}</span>
                        </div>
                    }
                    {duplicates[0] && (
                      <div className="pack-reveal__dupe-badge">¡Ya la tienes!</div>
                    )}
                  </div>
                </div>

                {/* Carta 2 */}
                <div className="pack-reveal__card" ref={card2Ref}>
                  <div className="pack-reveal__c-back"><div className="pack-reveal__c-back-img" /></div>
                  <div className="pack-reveal__c-front">
                    {revealedCards[1]?.imageUrl
                      ? <img src={revealedCards[1].imageUrl} alt={revealedCards[1].name} className="pack-reveal__c-img" />
                      : <div className={`pack-reveal__c-placeholder pack-reveal__c-placeholder--${(revealedCards[1]?.rarity ?? 'comun').toLowerCase()}`}>
                          <span>{revealedCards[1]?.name}</span>
                        </div>
                    }
                    {duplicates[1] && (
                      <div className="pack-reveal__dupe-badge">¡Ya la tienes!</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sobre */}
              <div className="pack-reveal__pack" ref={packRef}>
                <div className="pack-reveal__pack-back">
                  <div className="pack-reveal__pack-back-img">ESPALDA<br />DEL SOBRE</div>
                </div>
                <div className="pack-reveal__pack-top" ref={packTopRef}>
                  <div className="pack-reveal__pack-top-img">CRIPTA DE DOGE<br />ASOCIACION</div>
                </div>
                <div className="pack-reveal__perf-zone perf-zone" ref={perfZoneRef}>
                  <div className="pack-reveal__perf-fill" ref={perfFillRef} />
                  <div className="pack-reveal__perf-dots">
                    {Array.from({ length: DOT_COUNT }, (_, i) => (
                      <span key={i} className="pack-reveal__perf-dot" />
                    ))}
                  </div>
                </div>
                <div className="pack-reveal__pack-bot" ref={packBotRef}>
                  <div className="pack-reveal__pack-bot-img">
                    FRENTE SOBRE<br />IMAGEN PRINCIPAL<br />85-90% ALTURA
                  </div>
                  <div className="pack-reveal__pack-glare" ref={packGlareRef} />
                </div>
              </div>

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
        </>
      )}
    </div>
  )
}
