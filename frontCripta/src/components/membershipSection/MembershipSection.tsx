import { useState } from 'react';
import MembershipModal from './MembershipModal';
import './membershipSection.scss';

const BENEFITS = [
  {
    icon: '🎲',
    title: 'Juegos de Mesa',
    description: 'Acceso a cientos de juegos modernos, cooperativos y de estrategia para todos los niveles.',
  },
  {
    icon: '🃏',
    title: 'TCG & Cartas',
    description: 'Torneos y partidas de Pokémon y otros juegos de cartas coleccionables.',
  },
  {
    icon: '🐉',
    title: 'Juegos de Rol',
    description: 'Sesiones inmersivas de rol de mesa con narrativa colaborativa y dungeon masters experimentados.',
  },
  {
    icon: '🕹️',
    title: 'Arcade & Retrogaming',
    description: 'Máquinas arcade originales y consolas retro para revivir los clásicos del videojuego.',
  },
  {
    icon: '⚔️',
    title: 'Softcombat',
    description: 'Talleres de esgrima acolchada y eventos de recreación histórica de forma segura y divertida.',
  },
  {
    icon: '💻',
    title: 'Talleres Creativos',
    description: 'Programación, impresión 3D y pintado de figuras guiado por expertos del club.',
  },
];

export default function MembershipSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="membership-section" id="membresia">
      <div className="membership-section__container">

        <div className="membership-section__header">
          <span className="membership-section__badge">Membresía</span>
          <h2 className="membership-section__title">Hazte Socio</h2>
          <p className="membership-section__subtitle">
            Únete a la comunidad y accede a todo lo que La Cripta de Doge tiene para ofrecerte.
            Una cuota, infinitas posibilidades.
          </p>
        </div>

        <div className="membership-section__grid">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="membership-section__card">
              <span className="membership-section__card-icon">{benefit.icon}</span>
              <h3 className="membership-section__card-title">{benefit.title}</h3>
              <p className="membership-section__card-desc">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="membership-section__cta">
          <p className="membership-section__cta-text">
            ¿Te interesa? Te enviamos toda la información directamente a tu correo.
          </p>
          <button
            className="btn-pink membership-section__cta-btn"
            onClick={() => setModalOpen(true)}
          >
            Quiero ser socio
          </button>
        </div>

      </div>

      {modalOpen && (
        <MembershipModal onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}