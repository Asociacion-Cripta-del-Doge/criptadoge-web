import { useState } from 'react';
import MembershipModal from './MembershipModal';
import './membershipSection.scss';
import { useWebTexts } from '../../hooks/useWebTexts';
import type { WebTextKey } from '../../data/webTextDefaults';

const BENEFITS: {
  icon: string;
  titleKey: WebTextKey;
  descriptionKey: WebTextKey;
}[] = [
  {
    icon: '🎲',
    titleKey: 'home.membership.benefits.boardGames.title',
    descriptionKey: 'home.membership.benefits.boardGames.description',
  },
  {
    icon: '🃏',
    titleKey: 'home.membership.benefits.tcg.title',
    descriptionKey: 'home.membership.benefits.tcg.description',
  },
  {
    icon: '🐉',
    titleKey: 'home.membership.benefits.roleplay.title',
    descriptionKey: 'home.membership.benefits.roleplay.description',
  },
  {
    icon: '🕹️',
    titleKey: 'home.membership.benefits.arcade.title',
    descriptionKey: 'home.membership.benefits.arcade.description',
  },
  {
    icon: '⚔️',
    titleKey: 'home.membership.benefits.softcombat.title',
    descriptionKey: 'home.membership.benefits.softcombat.description',
  },
  {
    icon: '💻',
    titleKey: 'home.membership.benefits.creative.title',
    descriptionKey: 'home.membership.benefits.creative.description',
  },
];

export default function MembershipSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const text = useWebTexts('home.membership');

  return (
    <section className="membership-section" id="membresia">
      <div className="membership-section__container">

        <div className="membership-section__header">
          <span className="membership-section__badge">{text('home.membership.badge')}</span>
          <h2 className="membership-section__title">{text('home.membership.title')}</h2>
          <p className="membership-section__subtitle">{text('home.membership.subtitle')}</p>
        </div>

        <div className="membership-section__grid">
          {BENEFITS.map((benefit) => (
            <div key={benefit.titleKey} className="membership-section__card">
              <span className="membership-section__card-icon">{benefit.icon}</span>
              <h3 className="membership-section__card-title">{text(benefit.titleKey)}</h3>
              <p className="membership-section__card-desc">{text(benefit.descriptionKey)}</p>
            </div>
          ))}
        </div>

        <div className="membership-section__cta">
          <p className="membership-section__cta-text">{text('home.membership.ctaText')}</p>
          <button
            className="btn-pink membership-section__cta-btn"
            onClick={() => setModalOpen(true)}
          >
            {text('home.membership.ctaButton')}
          </button>
        </div>

      </div>

      {modalOpen && (
        <MembershipModal onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}
