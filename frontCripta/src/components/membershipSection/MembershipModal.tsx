import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
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

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = 'Introduce tu nombre completo';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email no válido';
    if (!form.phone.trim() || !/^\+?[\d\s\-]{9,}$/.test(form.phone))
      newErrors.phone = 'Teléfono no válido';
    if (!form.birthdate)
      newErrors.birthdate = 'Introduce tu fecha de nacimiento';
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
      toast.error('Error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
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
            <h3 className="membership-modal__title">Solicitud de Membresía</h3>
            <p className="membership-modal__text">
              Rellena el formulario y nos pondremos en contacto contigo para completar el alta presencialmente.
            </p>

            <div className="membership-modal__form">

              <div className="membership-modal__field">
                <label className="membership-modal__label">Nombre completo *</label>
                <input
                  type="text"
                  className={`membership-modal__input ${errors.name ? 'membership-modal__input--error' : ''}`}
                  placeholder="Tu nombre y apellidos"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={loading}
                  maxLength={60}
                />
                {errors.name && <span className="membership-modal__error">{errors.name}</span>}
              </div>

              <div className="membership-modal__field">
                <label className="membership-modal__label">Email *</label>
                <input
                  type="email"
                  className={`membership-modal__input ${errors.email ? 'membership-modal__input--error' : ''}`}
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={loading}
                />
                {errors.email && <span className="membership-modal__error">{errors.email}</span>}
              </div>

              <div className="membership-modal__row">
                <div className="membership-modal__field">
                  <label className="membership-modal__label">Teléfono *</label>
                  <input
                    type="tel"
                    className={`membership-modal__input ${errors.phone ? 'membership-modal__input--error' : ''}`}
                    placeholder="600 000 000"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading}
                    maxLength={15}
                  />
                  {errors.phone && <span className="membership-modal__error">{errors.phone}</span>}
                </div>

                <div className="membership-modal__field">
                  <label className="membership-modal__label">Fecha de nacimiento *</label>
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
                  ¿Cómo nos conociste?{' '}
                  <span className="membership-modal__optional">(opcional)</span>
                </label>
                <input
                  type="text"
                  className="membership-modal__input"
                  placeholder="Redes sociales, un amigo, un evento..."
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
              {loading ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>
          </>
        ) : (
          <>
            <span className="membership-modal__hero-icon">✅</span>
            <h3 className="membership-modal__title">¡Solicitud recibida!</h3>
            <p className="membership-modal__text">
              Nos pondremos en contacto contigo en breve para completar el proceso. ¡Nos vemos en la Cripta!
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