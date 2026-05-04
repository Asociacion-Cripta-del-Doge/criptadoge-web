import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./profileModal.scss";

interface Props {
    onClose: () => void;
}

const getRemainingDays = (expirationDate: string | null): number | null => {
    if (!expirationDate) return null;
    const diff = new Date(expirationDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getInitials = (name: string) =>
    name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const STATUS_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
    Activo: { label: "Activo", color: "#4ade80", glow: "#4ade8066" },
    Pendiente: { label: "Pendiente de activación", color: "#eab308", glow: "#eab30866"},
    Expirado: { label: "Expirado", color: "#ef4444", glow: "#ef444466" },
    Cancelado: { label: "Cancelado", color: "#94a3b8", glow: "#94a3b833" },
};

export const ProfileModal = ({ onClose }: Props) => {
    const { user, logout, refreshUser } = useAuth();
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(user?.name ?? "")
    const [saving, setSaving] = useState(false)
    const [nameError, setNameError] = useState("")
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    if (!user) return null;

    const daysLeft = getRemainingDays(user.expirationDate);
    const hasMembership = user.status === "Activo" && daysLeft !== null && daysLeft > 0;
    const isExpiringSoon = hasMembership && daysLeft !== null && daysLeft <= 7;
    const statusCfg = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.Pendiente;
    const memberPercent = daysLeft !== null ? Math.min(100, Math.round((daysLeft / 30) * 100)) : 0;

    const handleSaveName = async () => {
        if(nameValue.trim().length < 2) {
            setNameError("Mínimo 2 caracteres")
            return
        }
        setSaving(true)
        setNameError("")
        try {
            const token = localStorage.getItem("access_token")
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: nameValue.trim() })
            })
            if(!res.ok) throw new Error()
            await refreshUser()
            setEditingName(false)
        } catch {
            setNameError("Error al guardar, inténtalo de nuevo")
        } finally {
            setSaving(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === "Enter") handleSaveName()
        if(e.key === "Escape") {
            setEditingName(false)
            setNameValue(user.name)
            setNameError("")
        }
    }

    return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>

        <div className="profile-modal__scanlines" />

        {showLogoutConfirm && (
          <div className="profile-modal__confirm-overlay">
            <div className="profile-modal__confirm-box">
              <span className="profile-modal__confirm-icon">⚠️</span>
              <p className="profile-modal__confirm-title">¿Cerrar sesión?</p>
              <p className="profile-modal__confirm-sub">Tendrás que volver a iniciar sesión para acceder.</p>
              <div className="profile-modal__confirm-actions">
                <button
                  className="profile-modal__confirm-btn profile-modal__confirm-btn--cancel"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="profile-modal__confirm-btn profile-modal__confirm-btn--confirm"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="profile-modal__header">
          <div className="profile-modal__avatar-wrap">
            <div className="profile-modal__avatar">
              {getInitials(user.name)}
            </div>
            <div
              className="profile-modal__status-bubble"
              style={{ "--bubble-color": statusCfg.color, "--bubble-glow": statusCfg.glow } as React.CSSProperties}
            >
              <span className="profile-modal__status-dot" />
              {statusCfg.label}
            </div>
          </div>

          <div className="profile-modal__info">
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
                  <button
                    className="profile-modal__name-btn profile-modal__name-btn--save"
                    onClick={handleSaveName}
                    disabled={saving}
                  >
                    {saving ? "..." : "✓"}
                  </button>
                  <button
                    className="profile-modal__name-btn profile-modal__name-btn--cancel"
                    onClick={() => { setEditingName(false); setNameValue(user.name); setNameError("") }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="profile-modal__name">{user.name}</h2>
                  <button
                    className="profile-modal__edit-btn"
                    onClick={() => { setEditingName(true); setNameValue(user.name) }}
                    title="Editar nombre"
                  >
                    ✏️
                  </button>
                </>
              )}
              {user.role === "ADMIN" && !editingName && (
                <span className="profile-modal__badge">ADMIN</span>
              )}
            </div>
            {nameError && <span className="profile-modal__name-error">{nameError}</span>}
            <span className="profile-modal__email">{user.email}</span>
            <span className="profile-modal__since">
              Miembro desde {new Date(user.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </span>
          </div>

          <button className="profile-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-modal__section">
          <div className="profile-modal__section-header">
            <span className="profile-modal__section-icon">⚔️</span>
            <h3 className="profile-modal__section-title">Membresía</h3>
          </div>

          {hasMembership ? (
            <div className="profile-modal__membership">
              <div className="profile-modal__membership-rows">
                {user.lastRenewal && (
                  <div className="profile-modal__row">
                    <span className="profile-modal__label">Último pago</span>
                    <span className="profile-modal__value">
                      {new Date(user.lastRenewal).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
                {user.expirationDate && (
                  <div className="profile-modal__row">
                    <span className="profile-modal__label">Expira el</span>
                    <span className="profile-modal__value">
                      {new Date(user.expirationDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
              </div>

              <div className="profile-modal__bar-wrap">
                <div className="profile-modal__bar-label">
                  <span>{isExpiringSoon ? "⚠️ Expira pronto" : "Tiempo restante"}</span>
                  <span className={isExpiringSoon ? "profile-modal__bar-days--warn" : ""}>
                    {daysLeft}d
                  </span>
                </div>
                <div className="profile-modal__bar-track">
                  <div
                    className={`profile-modal__bar-fill ${isExpiringSoon ? "profile-modal__bar-fill--warn" : ""}`}
                    style={{ width: `${memberPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <a href="/membresia" className="profile-modal__cta" onClick={onClose}>
                Hazte miembro
            </a>
          )}
        </div>

        <div className="profile-modal__footer">
          <button
            className="profile-modal__logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>
  )
};