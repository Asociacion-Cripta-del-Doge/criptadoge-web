import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useWebTexts } from '../../hooks/useWebTexts';
import './membershipSection.scss';

interface MembershipModalProps {
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  howDidYouKnow: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  howDidYouKnow: '',
};

export default function MembershipModal({ onClose }: MembershipModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const text = useWebTexts('home.membership');

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = text('home.membership.request.errors.name');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = text('home.membership.request.errors.email');
    if (!form.phone.trim() || !/^\+?[\d\s\-]{9,}$/.test(form.phone))
      newErrors.phone = text('home.membership.request.errors.phone');
    if (!form.birthdate)
      newErrors.birthdate = text('home.membership.request.errors.birthdate');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/membership/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error(text('home.membership.request.errors.submit'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="membership-modal__overlay" onClick={onClose}>
      <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
        <button className="membership-modal__close" onClick={onClose} aria-label={text('home.membership.modal.close')}>
          ✕
        </button>

        {!submitted ? (
          <>
            <span className="membership-modal__hero-icon">🎮</span>
            <h3 className="membership-modal__title">{text('home.membership.request.title')}</h3>
            <p className="membership-modal__text">
              {text('home.membership.request.body')}
            </p>

            <div className="membership-modal__form">

              <div className="membership-modal__field">
                <label className="membership-modal__label">{text('home.membership.request.fields.name')}</label>
                <input
                  type="text"
                  className={`membership-modal__input ${errors.name ? 'membership-modal__input--error' : ''}`}
                  placeholder={text('home.membership.request.fields.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={loading}
                  maxLength={60}
                />
                {errors.name && <span className="membership-modal__error">{errors.name}</span>}
              </div>

              <div className="membership-modal__field">
                <label className="membership-modal__label">{text('home.membership.request.fields.email')}</label>
                <input
                  type="email"
                  className={`membership-modal__input ${errors.email ? 'membership-modal__input--error' : ''}`}
                  placeholder={text('home.membership.request.fields.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={loading}
                />
                {errors.email && <span className="membership-modal__error">{errors.email}</span>}
              </div>

              <div className="membership-modal__row">
                <div className="membership-modal__field">
                  <label className="membership-modal__label">{text('home.membership.request.fields.phone')}</label>
                  <input
                    type="tel"
                    className={`membership-modal__input ${errors.phone ? 'membership-modal__input--error' : ''}`}
                    placeholder={text('home.membership.request.fields.phonePlaceholder')}
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading}
                    maxLength={15}
                  />
                  {errors.phone && <span className="membership-modal__error">{errors.phone}</span>}
                </div>

                <div className="membership-modal__field">
                  <label className="membership-modal__label">{text('home.membership.request.fields.birthdate')}</label>
                  <input
                    type="date"
                    className={`membership-modal__input ${errors.birthdate ? 'membership-modal__input--error' : ''}`}
                    value={form.birthdate}
                    onChange={(e) => handleChange('birthdate', e.target.value)}
                    disabled={loading}
                  />
                  {errors.birthdate && <span className="membership-modal__error">{errors.birthdate}</span>}
                </div>
              </div>

              <div className="membership-modal__field">
                <label className="membership-modal__label">
                  {text('home.membership.request.fields.howDidYouKnow')}{' '}
                  <span className="membership-modal__optional">{text('home.membership.request.fields.optional')}</span>
                </label>
                <input
                  type="text"
                  className="membership-modal__input"
                  placeholder={text('home.membership.request.fields.howDidYouKnowPlaceholder')}
                  value={form.howDidYouKnow}
                  onChange={(e) => handleChange('howDidYouKnow', e.target.value)}
                  disabled={loading}
                  maxLength={100}
                />
              </div>

            </div>

            <button
              className="btn-pink membership-modal__submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? text('home.membership.request.submit.loading') : text('home.membership.request.submit.idle')}
            </button>
          </>
        ) : (
          <>
            <span className="membership-modal__hero-icon">✅</span>
            <h3 className="membership-modal__title">{text('home.membership.request.successTitle')}</h3>
            <p className="membership-modal__text">
              {text('home.membership.request.successBody')}
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
