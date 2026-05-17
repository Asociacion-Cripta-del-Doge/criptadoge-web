import { useState } from 'react';
import MembershipModal from './MembershipModal';
import './membershipSection.scss';

const BENEFITS = [
  {
    icon: '🪑',
    title: 'Reserva de Mesa',
    description: 'Una mesa para hasta 4 personas durante una hora al día, completamente gratis.',
  },
  {
    icon: '🎉',
    title: 'Eventos Gratis',
    description: 'Accede y participa sin coste en todos los eventos organizados por la asociación.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: '🌐',
    title: 'Solicitud Online',
    description: 'Rellena el formulario web para agilizar los tiempos y luego acércate presencialmente.',
  },
  {
    number: '02',
    icon: '🏠',
    title: 'Visítanos',
    description: 'Pásate durante cualquier evento y te gestionamos el alta al momento.',
  },
  {
    number: '03',
    icon: '💬',
    title: 'WhatsApp',
    description: 'Escríbenos y organizamos un día contigo.',
  },
];

export default function MembershipSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="membership-section" id="membresia">
      <div className="membership-section__container">

        <div className="membership-section__hero">
          <span className="membership-section__badge">Membresía</span>
          <h2 className="membership-section__title">Hazte Socio</h2>
          <div className="membership-section__price">
            <span className="membership-section__price-number">5€</span>
            <span className="membership-section__price-period">al mes</span>
          </div>
          <p className="membership-section__price-note">Asociación sin ánimo de lucro</p>
        </div>

        <div className="membership-section__row">
          <div className="membership-section__label">Qué incluye</div>
          <div className="membership-section__benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className="membership-section__benefit">
                <span className="membership-section__benefit-icon">{b.icon}</span>
                <div>
                  <h3 className="membership-section__benefit-title">{b.title}</h3>
                  <p className="membership-section__benefit-desc">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="membership-section__row">
          <div className="membership-section__label">Cómo unirte</div>
          <div className="membership-section__steps">
            {STEPS.map((s, i) => (
              <div key={s.number} className="membership-section__step">
                <span className="membership-section__step-num">{s.number}</span>
                <span className="membership-section__step-icon">{s.icon}</span>
                <h3 className="membership-section__step-title">{s.title}</h3>
                <p className="membership-section__step-desc">{s.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="membership-section__step-connector" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="membership-section__cta">
          <button
            className="btn-pink membership-section__cta-btn"
            onClick={() => setModalOpen(true)}
          >
            Quiero ser socio
          </button>
          <p className="membership-section__cta-note">
            ¿Prefieres info por correo? Te escribimos todo.
          </p>
        </div>

      </div>

      {modalOpen && (
        <MembershipModal onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}