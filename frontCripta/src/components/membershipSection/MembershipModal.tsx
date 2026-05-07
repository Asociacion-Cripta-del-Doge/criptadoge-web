import { useState } from 'react';
import { createPortal } from 'react-dom';
import './membershipSection.scss';

interface MembershipModalProps {
  onClose: () => void;
}

export default function MembershipModal({ onClose }: MembershipModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    // TODO: POST /api/membership/interest
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return createPortal(
    <div className="membership-modal__overlay" onClick={onClose}>
      <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
        <button className="membership-modal__close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {!submitted ? (
          <>
            <span className="membership-modal__hero-icon">🎮</span>
            <h3 className="membership-modal__title">¡Únete a la Cripta!</h3>
            <p className="membership-modal__text">
              Déjanos tu correo y te enviamos toda la información para hacerte socio de la asociación.
            </p>
            <input
              type="email"
              className="membership-modal__input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
            <button
              className="btn-pink membership-modal__submit"
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
            >
              {loading ? 'Enviando...' : 'Enviar información'}
            </button>
          </>
        ) : (
          <>
            <span className="membership-modal__hero-icon">✉️</span>
            <h3 className="membership-modal__title">¡Correo en camino!</h3>
            <p className="membership-modal__text">
              En breve recibirás toda la información en tu bandeja de entrada. ¡Nos vemos en la Cripta!
            </p>
            <button className="btn-outline membership-modal__submit" onClick={onClose}>
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}