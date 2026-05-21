import { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback } from 'react'
import './cardAlbum.scss'

/* GSAP cargado desde CDN en index.html */
declare const gsap: typeof import('gsap').gsap

/* ─── Datos de las 10 cartas ────────────────────────────────── */
const CARDS = [
  { id: 1,  name: 'Doge Entrenador'            },
  { id: 2,  name: 'Doge Hechicero'             },
  { id: 3,  name: 'Doge Guerrero Maker'         },
  { id: 4,  name: 'Doge Destellante'            },
  { id: 5,  name: 'Doge Luchador de Softcombat' },
  { id: 6,  name: 'Doge Minero de Cripto'       },
  { id: 7,  name: 'Doge Programador Codi'       },
  { id: 8,  name: 'Doge Maestro Retro'          },
  { id: 9,  name: 'Doge Pintor de Miniaturas'   },
  { id: 10, name: 'Doge Director de Eventos'    },
]

/* Gradiente placeholder por carta (hasta tener imágenes reales) */
const CARD_GRADIENTS = [
  'linear-gradient(145deg, #1a0f40, #0a1f60, #0d3060)',
  'linear-gradient(145deg, #0a2840, #0a5040, #0a3860)',
  'linear-gradient(145deg, #2a0a20, #501040, #3a0860)',
  'linear-gradient(145deg, #1a2800, #2a4800, #1a3a00)',
  'linear-gradient(145deg, #400a0a, #601820, #401028)',
  'linear-gradient(145deg, #0a1a40, #1828a0, #0a1060)',
  'linear-gradient(145deg, #280a40, #500a80, #380860)',
  'linear-gradient(145deg, #1a1a00, #383800, #282800)',
  'linear-gradient(145deg, #001820, #003040, #004060)',
  'linear-gradient(145deg, #280000, #500010, #380020)',
]

/* ─── Tipos públicos ────────────────────────────────────────── */
export interface CardAlbumHandle {
  addCard: (id: number) => void
}

interface Props {
  onClose: () => void
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE (forwardRef para exponer addCard a Navbar)
   ═══════════════════════════════════════════════════════════════ */
const CardAlbum = forwardRef<CardAlbumHandle, Props>(({ onClose }, ref) => {
  const [owned, setOwned]   = useState<Set<number>>(new Set())
  const [detail, setDetail] = useState<number | null>(null)

  /* Refs de cada slot para animar la entrada de carta */
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  /* Ref de la carta en el modal de detalle (tilt 3D) */
  const detailCardRef = useRef<HTMLDivElement>(null)

  /* ── API pública — llamada desde Navbar ───────────────────── */
  useImperativeHandle(ref, () => ({
    addCard(id: number) {
      setOwned(prev => {
        if (prev.has(id)) return prev
        const next = new Set(prev)
        next.add(id)
        return next
      })
      /* Animamos el slot en el siguiente frame (cuando React
         ya habrá pintado el estado "owned")                   */
      requestAnimationFrame(() => {
        const slotEl = slotRefs.current.get(id)
        if (!slotEl) return
        gsap.fromTo(slotEl,
          { scale: 0, rotateZ: -8, opacity: 0 },
          { scale: 1, rotateZ: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        )
      })
    },
  }))

  /* ── Tilt 3D en el modal de detalle ─────────────────────── */
  useEffect(() => {
    const card = detailCardRef.current
    if (!detail || !card) return

    let tiltAnim: gsap.core.Tween | null = null

    const onMove = (e: MouseEvent) => {
      const r   = card.getBoundingClientRect()
      const dx  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2)
      const dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2)
      tiltAnim?.kill()
      tiltAnim = gsap.to(card, {
        rotateY:  dx * 22,
        rotateX: -dy * 15,
        duration: 0.08,
        overwrite: true,
      })
    }

    const onLeave = () => {
      tiltAnim?.kill()
      gsap.to(card, {
        rotateY: 0, rotateX: 0,
        duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: true,
      })
    }

    card.addEventListener('mousemove',  onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mousemove',  onMove)
      card.removeEventListener('mouseleave', onLeave)
      tiltAnim?.kill()
    }
  }, [detail])

  /* ── Escape cierra el modal o el álbum ──────────────────── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (detail !== null) setDetail(null)
    else onClose()
  }, [detail, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const ownedCount = owned.size

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="card-album" onClick={onClose}>

      {/* Panel interior — detiene la propagación del clic */}
      <div className="card-album__panel" onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="card-album__header">
          <div className="card-album__title-wrap">
            <h2 className="card-album__title">ÁLBUM DE CARTAS</h2>
            <span className="card-album__count">
              {ownedCount} / {CARDS.length}
            </span>
          </div>
          <button className="card-album__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Barra de progreso */}
        <div className="card-album__progress-track">
          <div
            className="card-album__progress-fill"
            style={{ width: `${(ownedCount / CARDS.length) * 100}%` }}
          />
        </div>

        {/* Grid de huecos */}
        <div className="card-album__grid">
          {CARDS.map(card => {
            const isOwned = owned.has(card.id)
            return (
              <div
                key={card.id}
                className={`card-album__slot ${isOwned ? 'is-owned' : 'is-empty'}`}
                ref={el => {
                  if (el) slotRefs.current.set(card.id, el)
                  else    slotRefs.current.delete(card.id)
                }}
                onClick={() => isOwned && setDetail(card.id)}
                role={isOwned ? 'button' : undefined}
                tabIndex={isOwned ? 0 : undefined}
                onKeyDown={e => e.key === 'Enter' && isOwned && setDetail(card.id)}
              >
                {/* Número de la carta */}
                <span className="card-album__slot-number">{card.id}</span>

                {isOwned ? (
                  /* Carta obtenida — gradiente placeholder */
                  <>
                    <div
                      className="card-album__slot-art"
                      style={{ background: CARD_GRADIENTS[card.id - 1] }}
                    >
                      <span className="card-album__slot-art-label">
                        IMAGEN<br />CARTA
                      </span>
                    </div>
                    <div className="card-album__slot-name-overlay">
                      {card.name}
                    </div>
                  </>
                ) : (
                  /* Hueco vacío */
                  <div className="card-album__slot-empty">
                    <span className="card-album__slot-empty-name">{card.name}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Modal de detalle ─────────────────────────────────── */}
      {detail !== null && (() => {
        const card = CARDS.find(c => c.id === detail)!
        return (
          <div
            className="card-album__detail-overlay"
            onClick={() => setDetail(null)}
          >
            <div
              className="card-album__detail-card"
              ref={detailCardRef}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="card-album__detail-art"
                style={{ background: CARD_GRADIENTS[card.id - 1] }}
              >
                <span className="card-album__detail-art-label">
                  IMAGEN<br />CARTA
                </span>
              </div>
              <div className="card-album__detail-footer">
                <span className="card-album__detail-number">#{card.id}</span>
                <span className="card-album__detail-name">{card.name}</span>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
})

CardAlbum.displayName = 'CardAlbum'
export { CardAlbum }
