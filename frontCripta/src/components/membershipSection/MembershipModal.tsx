import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWebTexts } from '../../hooks/useWebTexts';
import './membershipSection.scss';

interface MembershipModalProps {
  onClose: () => void;
}

export default function MembershipModal({ onClose }: MembershipModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const text = useWebTexts('home.membership');

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
        <button
          className="membership-modal__close"
          onClick={onClose}
          aria-label={text('home.membership.modal.close')}
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <span className="membership-modal__hero-icon">🎮</span>
            <h3 className="membership-modal__title">{text('home.membership.modal.title')}</h3>
            <p className="membership-modal__text">
              {text('home.membership.modal.body')}
            </p>
            <input
              type="email"
              className="membership-modal__input"
              placeholder={text('home.membership.modal.emailPlaceholder')}
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
              {loading
                ? text('home.membership.modal.loading')
                : text('home.membership.modal.submit')}
            </button>
          </>
        ) : (
          <>
            <span className="membership-modal__hero-icon">✉️</span>
            <h3 className="membership-modal__title">{text('home.membership.modal.successTitle')}</h3>
            <p className="membership-modal__text">
              {text('home.membership.modal.successBody')}
            </p>
            <button className="btn-outline membership-modal__submit" onClick={onClose}>
              {text('home.membership.modal.close')}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
