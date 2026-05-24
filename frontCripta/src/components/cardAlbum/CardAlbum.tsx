import { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback } from 'react'
import './cardAlbum.scss'
import { useWebTexts } from '../../hooks/useWebTexts'
import type { WebTextKey } from '../../data/webTextDefaults'

declare const gsap: typeof import('gsap').gsap

/* ─── Tipos ─────────────────────────────────────────────────── */
interface ApiCard {
  id: number
  name: string
  rarity: 'COMUN' | 'RARA' | 'EPICA' | 'LEGENDARIA'
  imageUrl: string | null
  collection: { id: number; name: string } | null
}

interface UserCard {
  cardId: number
  quantity: number
  card: ApiCard
}

export interface CardAlbumHandle {
  addCard:  (id: number) => void
  isOwned:  (id: number) => boolean
}

interface Props {
  onClose:     () => void
  visible:     boolean
  refreshKey?: number   // incrementar desde fuera para forzar re-fetch de /cards/my
}

/* ─── Colores por rareza ─────────────────────────────────────── */
const RARITY_GRADIENT: Record<string, string> = {
  COMUN:      'linear-gradient(145deg, #0e0e1a, #1a1a2e)',
  RARA:       'linear-gradient(145deg, #001030, #003880)',
  EPICA:      'linear-gradient(145deg, #1a0040, #5500cc)',
  LEGENDARIA: 'linear-gradient(145deg, #1a0a00, #804000, #b36200)',
}
const RARITY_BORDER: Record<string, string> = {
  COMUN:      'rgba(124, 61, 255, 0.4)',
  RARA:       'rgba(0, 120, 255, 0.6)',
  EPICA:      'rgba(160, 0, 255, 0.7)',
  LEGENDARIA: '#ffd700',
}
const RARITY_LABEL_KEY: Record<string, WebTextKey> = {
  COMUN: 'cards.rarity.common',
  RARA: 'cards.rarity.rare',
  EPICA: 'cards.rarity.epic',
  LEGENDARIA: 'cards.rarity.legendary',
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE
   ═══════════════════════════════════════════════════════════════ */
const CardAlbum = forwardRef<CardAlbumHandle, Props>(({ onClose, visible, refreshKey = 0 }, ref) => {
  const text = useWebTexts('cards')

  const [allCards,  setAllCards]  = useState<ApiCard[]>([])
  const [ownedMap,  setOwnedMap]  = useState<Map<number, UserCard>>(new Map())
  const [loading,   setLoading]   = useState(true)
  const [detail,    setDetail]    = useState<ApiCard | null>(null)

  /* Refs siempre actualizados — evitan stale closures en addCard / isOwned */
  const allCardsRef  = useRef<ApiCard[]>([])
  const ownedMapRef  = useRef<Map<number, UserCard>>(new Map())
  const hasLoadedRef = useRef(false)   // evita spinner en reaperturas del álbum
  useEffect(() => { allCardsRef.current = allCards }, [allCards])
  useEffect(() => { ownedMapRef.current = ownedMap }, [ownedMap])

  const slotRefs      = useRef<Map<number, HTMLDivElement>>(new Map())
  const detailCardRef = useRef<HTMLDivElement>(null)

  /* ── Carga de todas las cartas al montar (independiente del visible)
     Necesario para que addCard funcione aunque el álbum nunca se haya
     abierto antes de revelar el sobre.                               */
  useEffect(() => {
    fetch('/api/cards')
      .then(r => r.json())
      .then((all: ApiCard[]) => setAllCards(all ?? []))
      .catch(() => {})
  }, [])

  /* ── Carga de cartas del usuario:
     - Al abrir el álbum (visible true)
     - Cuando refreshKey cambia (después de abrir un sobre) */
  useEffect(() => {
    if (!visible) return

    const token = sessionStorage.getItem('access_token')
    /* Solo mostrar spinner la primera vez — reaperturas son silenciosas */
    if (!hasLoadedRef.current) setLoading(true)

    const fetchMy = token
      ? fetch('/api/cards/my', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : []) as Promise<UserCard[]>
      : Promise.resolve([])

    fetchMy
      .then(my => {
        const map = new Map<number, UserCard>()
        ;(my ?? []).forEach(uc => map.set(uc.cardId, uc))
        setOwnedMap(map)
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        hasLoadedRef.current = true
      })
  }, [visible, refreshKey])

  /* ── addCard / isOwned ── actualización en tiempo real al abrir un sobre */
  useImperativeHandle(ref, () => ({
    isOwned(id: number): boolean {
      return ownedMapRef.current.has(id)
    },
    addCard(id: number) {
      setOwnedMap(prev => {
        const next = new Map(prev)
        const existing = next.get(id)
        if (existing) {
          next.set(id, { ...existing, quantity: existing.quantity + 1 })
        } else {
          /* La carta completa se cargará en el siguiente fetch,
             pero marcamos como owned con quantity 1 inmediatamente */
          const card = allCardsRef.current.find(c => c.id === id)
          if (card) next.set(id, { cardId: id, quantity: 1, card })
        }
        return next
      })

      requestAnimationFrame(() => {
        const slotEl = slotRefs.current.get(id)
        if (!slotEl) return
        gsap.fromTo(slotEl,
          { scale: 0, rotateZ: -8, opacity: 0 },
          { scale: 1, rotateZ: 0,  opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        )
      })
    },
  }))

  /* ── Tilt 3D en el modal de detalle ──────────────────────── */
  useEffect(() => {
    const card = detailCardRef.current
    if (!detail || !card) return

    let tiltAnim: gsap.core.Tween | null = null
    const onMove = (e: MouseEvent) => {
      const r  = card.getBoundingClientRect()
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2)
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2)
      tiltAnim?.kill()
      tiltAnim = gsap.to(card, { rotateY: dx * 22, rotateX: -dy * 15, duration: 0.08, overwrite: true })
    }
    const onLeave = () => {
      tiltAnim?.kill()
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)', overwrite: true })
    }
    card.addEventListener('mousemove',  onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mousemove',  onMove)
      card.removeEventListener('mouseleave', onLeave)
      tiltAnim?.kill()
    }
  }, [detail])

  /* ── Escape ──────────────────────────────────────────────── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (detail !== null) setDetail(null)
    else onClose()
  }, [detail, onClose])

  useEffect(() => {
    if (!visible) return
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown, visible])

  if (!visible) return null

  const ownedCount = ownedMap.size
  const total      = allCards.length

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="card-album" onClick={onClose}>
      <div className="card-album__panel" onClick={e => e.stopPropagation()}>

        {/* Cabecera */}
        <div className="card-album__header">
          <div className="card-album__title-wrap">
            <h2 className="card-album__title">{text('cards.album.title')}</h2>
            <span className="card-album__count">
              {loading ? text('cards.album.loadingShort') : `${ownedCount} / ${total}`}
            </span>
          </div>
          <button className="card-album__close" onClick={onClose} aria-label={text('cards.actions.close')}>✕</button>
        </div>

        {/* Barra de progreso */}
        <div className="card-album__progress-track">
          <div
            className="card-album__progress-fill"
            style={{ width: total > 0 ? `${(ownedCount / total) * 100}%` : '0%' }}
          />
        </div>

        {/* Cargando */}
        {loading && (
          <div className="card-album__loading">{text('cards.album.loading')}</div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="card-album__grid">
            {allCards.map(card => {
              const uc      = ownedMap.get(card.id)
              const isOwned = !!uc
              const rarity  = card.rarity ?? 'COMUN'

              return (
                <div
                  key={card.id}
                  className={`card-album__slot ${isOwned ? 'is-owned' : 'is-empty'}`}
                  style={isOwned ? { borderColor: RARITY_BORDER[rarity] } : undefined}
                  ref={el => {
                    if (el) slotRefs.current.set(card.id, el)
                    else    slotRefs.current.delete(card.id)
                  }}
                  onClick={() => isOwned && setDetail(card)}
                  role={isOwned ? 'button' : undefined}
                  tabIndex={isOwned ? 0 : undefined}
                  onKeyDown={e => e.key === 'Enter' && isOwned && setDetail(card)}
                >
                  <span className="card-album__slot-number">#{card.id}</span>

                  {isOwned ? (
                    <>
                      {card.imageUrl
                        ? <img src={card.imageUrl} alt={card.name} className="card-album__slot-art-img" />
                        : <div className="card-album__slot-art" style={{ background: RARITY_GRADIENT[rarity] }}>
                            <span className="card-album__slot-rarity">{text(RARITY_LABEL_KEY[rarity])}</span>
                          </div>
                      }
                      <div className="card-album__slot-name-overlay">{card.name}</div>
                      {(uc?.quantity ?? 0) > 1 && (
                        <span className="card-album__slot-qty">×{uc!.quantity}</span>
                      )}
                    </>
                  ) : (
                    <div className="card-album__slot-empty">
                      <span className="card-album__slot-empty-name">{card.name}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ── Modal de detalle ─────────────────────────────────── */}
      {detail !== null && (
        <div className="card-album__detail-overlay" onClick={() => setDetail(null)}>
          <div
            className="card-album__detail-card"
            ref={detailCardRef}
            onClick={e => e.stopPropagation()}
          >
            {detail.imageUrl
              ? <img src={detail.imageUrl} alt={detail.name} className="card-album__detail-img" />
              : <div className="card-album__detail-art" style={{ background: RARITY_GRADIENT[detail.rarity] }}>
                  <span className="card-album__detail-art-label">
                    {text('cards.album.imagePlaceholderLine1')}
                    <br />
                    {text('cards.album.imagePlaceholderLine2')}
                  </span>
                </div>
            }
            <div className="card-album__detail-footer">
              <span className="card-album__detail-rarity" style={{ color: RARITY_BORDER[detail.rarity] }}>
                {text(RARITY_LABEL_KEY[detail.rarity])}
              </span>
              <span className="card-album__detail-name">{detail.name}</span>
              {detail.collection && (
                <span className="card-album__detail-collection">{detail.collection.name}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

CardAlbum.displayName = 'CardAlbum'
export { CardAlbum }
