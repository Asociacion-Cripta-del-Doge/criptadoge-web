import { useState } from 'react';
import MembershipModal from './MembershipModal';
import { useWebTexts } from '../../hooks/useWebTexts';
import type { WebTextKey } from '../../data/webTextDefaults';
import './membershipSection.scss';

const BENEFITS = [
  {
    icon: '🪑',
    titleKey: 'home.membership.benefits.tableBooking.title',
    descriptionKey: 'home.membership.benefits.tableBooking.description',
  },
  {
    icon: '🎉',
    titleKey: 'home.membership.benefits.freeEvents.title',
    descriptionKey: 'home.membership.benefits.freeEvents.description',
  },
] satisfies Array<{ icon: string; titleKey: WebTextKey; descriptionKey: WebTextKey }>;

const STEPS = [
  {
    number: '01',
    icon: '🌐',
    titleKey: 'home.membership.steps.online.title',
    descriptionKey: 'home.membership.steps.online.description',
  },
  {
    number: '02',
    icon: '🏠',
    titleKey: 'home.membership.steps.visit.title',
    descriptionKey: 'home.membership.steps.visit.description',
  },
  {
    number: '03',
    icon: '💬',
    titleKey: 'home.membership.steps.whatsapp.title',
    descriptionKey: 'home.membership.steps.whatsapp.description',
  },
] satisfies Array<{ number: string; icon: string; titleKey: WebTextKey; descriptionKey: WebTextKey }>;

export default function MembershipSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const text = useWebTexts('home.membership');

  return (
    <section className="membership-section" id="membresia">
      <div className="membership-section__container">

        <div className="membership-section__hero">
          <span className="membership-section__badge">{text('home.membership.badge')}</span>
          <h2 className="membership-section__title">{text('home.membership.title')}</h2>
          <div className="membership-section__price">
            <span className="membership-section__price-number">{text('home.membership.price.amount')}</span>
            <span className="membership-section__price-period">{text('home.membership.price.period')}</span>
          </div>
          <p className="membership-section__price-note">{text('home.membership.price.note')}</p>
        </div>

        <div className="membership-section__row">
          <div className="membership-section__label">{text('home.membership.includesLabel')}</div>
          <div className="membership-section__benefits">
            {BENEFITS.map((b) => (
              <div key={b.titleKey} className="membership-section__benefit">
                <span className="membership-section__benefit-icon">{b.icon}</span>
                <div>
                  <h3 className="membership-section__benefit-title">{text(b.titleKey)}</h3>
                  <p className="membership-section__benefit-desc">{text(b.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="membership-section__row">
          <div className="membership-section__label">{text('home.membership.howToJoinLabel')}</div>
          <div className="membership-section__steps">
            {STEPS.map((s, i) => (
              <div key={s.number} className="membership-section__step">
                <span className="membership-section__step-num">{s.number}</span>
                <span className="membership-section__step-icon">{s.icon}</span>
                <h3 className="membership-section__step-title">{text(s.titleKey)}</h3>
                <p className="membership-section__step-desc">{text(s.descriptionKey)}</p>
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
            {text('home.membership.ctaButton')}
          </button>
          <p className="membership-section__cta-note">
            {text('home.membership.ctaNote')}
          </p>
        </div>

      </div>

      {modalOpen && (
        <MembershipModal onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}
