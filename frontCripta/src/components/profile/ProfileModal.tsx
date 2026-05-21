import { useAuth } from "../../context/AuthContext"
import { useState } from "react"
import MembershipModal from "../membershipSection/MembershipModal";
import { useWebTexts } from "../../hooks/useWebTexts"
import type { WebTextKey } from "../../data/webTextDefaults"
import "./profileModal.scss"

interface Props {
  onClose: () => void
}

const getRemainingDays = (expirationDate: string | null): number | null => {
  if (!expirationDate) return null
  const diff = new Date(expirationDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

const STATUS_CONFIG: Record<string, { labelKey: WebTextKey; color: string; glow: string }> = {
  Activo: { labelKey: "profile.status.active", color: "#4ade80", glow: "#4ade8066" },
  Pendiente: { labelKey: "profile.status.pending", color: "#eab308", glow: "#eab30866" },
  Expirado: { labelKey: "profile.status.expired", color: "#ef4444", glow: "#ef444466" },
  Cancelado: { labelKey: "profile.status.cancelled", color: "#94a3b8", glow: "#94a3b833" },
}

export const ProfileModal = ({ onClose }: Props) => {
  const { user, logout, refreshUser } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const text = useWebTexts("profile")

  if (!user) return null

  const daysLeft = getRemainingDays(user.expirationDate)
  const hasMembership = user.status === "Activo" && daysLeft !== null && daysLeft > 0
  const isExpiringSoon = hasMembership && daysLeft !== null && daysLeft <= 7
  const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.Pendiente
  const memberPercent = daysLeft !== null ? Math.min(100, Math.round((daysLeft / 30) * 100)) : 0
  const joinYear = new Date(user.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const token = sessionStorage.getItem("access_token")
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const res = await fetch("/api/auth/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ base64 }),
      })
      if (!res.ok) throw new Error()
      await refreshUser()
    } catch {
      console.error(text("profile.errors.uploadAvatar"))
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveName = async () => {
    if (nameValue.trim().length < 2) { setNameError(text("profile.errors.nameMin")); return }
    setSaving(true)
    setNameError("")
    try {
      const token = sessionStorage.getItem("access_token")
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: nameValue.trim() }),
      })
      if (!res.ok) throw new Error()
      await refreshUser()
      setEditingName(false)
    } catch {
      setNameError(text("profile.errors.saveName"))
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName()
    if (e.key === "Escape") { setEditingName(false); setNameValue(user.name); setNameError("") }
  }

  return (
    <>
  <div className="profile-overlay" onClick={onClose}>
    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
      <div className="profile-modal__scanlines" />

      <div className="profile-modal__hero">
        <div className="profile-modal__hero-bg" />
        <button className="profile-modal__close" onClick={onClose}>✕</button>

        <div className="profile-modal__avatar-wrap">
          <div className="profile-modal__avatar" onClick={() => document.getElementById("avatar-input")?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-modal__avatar-img" />
            ) : (
              getInitials(user.name)
            )}
            <div className="profile-modal__avatar-overlay">
              {uploadingAvatar ? "⏳" : "📷"}
            </div>
          </div>
          <input id="avatar-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          <div
            className="profile-modal__status-bubble"
            style={{ "--bubble-color": statusCfg.color, "--bubble-glow": statusCfg.glow } as React.CSSProperties}
          >
            <span className="profile-modal__status-dot" />
            {text(statusCfg.labelKey)}
          </div>
        </div>

        <div className="profile-modal__hero-info">
          <div className="profile-modal__name-row">
            {editingName ? (
              <div className="profile-modal__name-edit">
                <input
                  className={`profile-modal__name-input ${nameError ? "profile-modal__name-input--error" : ""}`}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  maxLength={32}
                />
                <button className="profile-modal__name-btn profile-modal__name-btn--save" onClick={handleSaveName} disabled={saving}>
                  {saving ? "..." : "✓"}
                </button>
                <button className="profile-modal__name-btn profile-modal__name-btn--cancel" onClick={() => { setEditingName(false); setNameValue(user.name); setNameError("") }}>
                  ✕
                </button>
              </div>
            ) : (
              <>
                <h2 className="profile-modal__name">{user.name}</h2>
                <button className="profile-modal__edit-btn" onClick={() => { setEditingName(true); setNameValue(user.name) }}>✏️</button>
              </>
            )}
            {user.role === "ADMIN" && !editingName && <span className="profile-modal__badge">{text("profile.badge.admin")}</span>}
          </div>
          {nameError && <span className="profile-modal__name-error">{nameError}</span>}
          <span className="profile-modal__email">{user.email}</span>
        </div>
      </div>

      <div className="profile-modal__stats">
        <div className="profile-modal__stat">
          <span className="profile-modal__stat-value">0</span>
          <span className="profile-modal__stat-label">{text("profile.stats.events")}</span>
        </div>
        <div className="profile-modal__stat-divider" />
        <div className="profile-modal__stat">
          <span className="profile-modal__stat-value">{joinYear}</span>
          <span className="profile-modal__stat-label">{text("profile.stats.memberSince")}</span>
        </div>
        <div className="profile-modal__stat-divider" />
        <div className="profile-modal__stat">
          <span className="profile-modal__stat-value" style={{ color: statusCfg.color }}>
            {text(statusCfg.labelKey)}
          </span>
          <span className="profile-modal__stat-label">{text("profile.stats.status")}</span>
        </div>
      </div>

      <div className="profile-modal__section">
        <div className="profile-modal__section-header">
          <span className="profile-modal__section-icon">⚔️</span>
          <h3 className="profile-modal__section-title">{text("profile.membership.title")}</h3>
        </div>

        {hasMembership ? (
          <div className="profile-modal__membership">
            <div className="profile-modal__membership-rows">
              {user.lastRenewal && (
                <div className="profile-modal__row">
                  <span className="profile-modal__label">{text("profile.membership.lastPayment")}</span>
                  <span className="profile-modal__value">{new Date(user.lastRenewal).toLocaleDateString("es-ES")}</span>
                </div>
              )}
              {user.expirationDate && (
                <div className="profile-modal__row">
                  <span className="profile-modal__label">{text("profile.membership.expiresAt")}</span>
                  <span className="profile-modal__value">{new Date(user.expirationDate).toLocaleDateString("es-ES")}</span>
                </div>
              )}
            </div>
            <div className="profile-modal__bar-wrap">
              <div className="profile-modal__bar-label">
                <span>{isExpiringSoon ? text("profile.membership.expiringSoon") : text("profile.membership.remainingTime")}</span>
                <span className={isExpiringSoon ? "profile-modal__bar-days--warn" : ""}>{daysLeft}d</span>
              </div>
              <div className="profile-modal__bar-track">
                <div className={`profile-modal__bar-fill ${isExpiringSoon ? "profile-modal__bar-fill--warn" : ""}`} style={{ width: `${memberPercent}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <button className="profile-modal__cta" onClick={() => setShowMembershipModal(true)}>
            {text("profile.membership.becomeMember")}
          </button>
        )}
      </div>

      <div className="profile-modal__footer">
        {confirmLogout ? (
          <div className="profile-modal__logout-confirm">
            <span className="profile-modal__logout-text">{text("profile.logout.confirm")}</span>
            <div className="profile-modal__logout-actions">
              <button className="profile-modal__logout-yes" onClick={logout}>
                {text("profile.logout.yes")}
              </button>
              <button className="profile-modal__logout-no" onClick={() => setConfirmLogout(false)}>
                {text("profile.logout.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button className="profile-modal__logout" onClick={() => setConfirmLogout(true)}>
            {text("profile.logout.button")}
          </button>
        )}
      </div>

    </div>
  </div>

  {showMembershipModal && (
    <MembershipModal onClose={() => setShowMembershipModal(false)} />
  )}
  </>
  )
}
