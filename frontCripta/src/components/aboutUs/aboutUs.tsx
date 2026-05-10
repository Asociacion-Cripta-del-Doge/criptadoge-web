import './aboutUs.scss';
import { useWebTexts } from '../../hooks/useWebTexts';
import type { WebTextKey } from '../../data/webTextDefaults';

const activities: { icon: string; labelKey: WebTextKey }[] = [
    { icon: '🎲', labelKey: 'home.about.activities.boardGames' },
    { icon: '🃏', labelKey: 'home.about.activities.tcg' },
    { icon: '🐉', labelKey: 'home.about.activities.roleplay' },
    { icon: '🕹️', labelKey: 'home.about.activities.arcade' },
    { icon: '⚔️', labelKey: 'home.about.activities.softcombat' },
    { icon: '💻', labelKey: 'home.about.activities.it' },
    { icon: '🖨️', labelKey: 'home.about.activities.print3d' },
    { icon: '🎨', labelKey: 'home.about.activities.painting' },
];

const pillars: {
    icon: string;
    titleKey: WebTextKey;
    descriptionKey: WebTextKey;
    modifier: string;
}[] = [
    {
        icon: '👥',
        titleKey: 'home.about.pillars.community.title',
        descriptionKey: 'home.about.pillars.community.description',
        modifier: 'blue',
    },
    {
        icon: '💡',
        titleKey: 'home.about.pillars.creativity.title',
        descriptionKey: 'home.about.pillars.creativity.description',
        modifier: 'pink',
    },
    {
        icon: '📖',
        titleKey: 'home.about.pillars.culture.title',
        descriptionKey: 'home.about.pillars.culture.description',
        modifier: 'yellow',
    },
];

const AboutUs = () => {
    const text = useWebTexts('home.about');

    return (
        <section className="about-us" id="about">
            <div className="about-us__container">

                <div className="about-us__left">
                    <span className="about-us__badge">{text('home.about.badge')}</span>
                    <h2 className="about-us__title">{text('home.about.title')}</h2>
                    <p className="about-us__description">{text('home.about.body')}</p>
                    <div className="about-us__pillars">
                        {pillars.map((pillar) => (
                            <div key={pillar.titleKey} className={`about-us__pillar about-us__pillar--${pillar.modifier}`}>
                                <span className="about-us__pillar-icon">{pillar.icon}</span>
                                <div>
                                    <p className="about-us__pillar-title">{text(pillar.titleKey)}</p>
                                    <p className="about-us__pillar-desc">{text(pillar.descriptionKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="about-us__right">
                    <div className="about-us__stats">
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">8+</span>
                            <span className="about-us__stat-label">{text('home.about.stats.activities')}</span>
                        </div>
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">100%</span>
                            <span className="about-us__stat-label">{text('home.about.stats.nonProfit')}</span>
                        </div>
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">Puer.</span>
                            <span className="about-us__stat-label">{text('home.about.stats.location')}</span>
                        </div>
                    </div>
                    <p className="about-us__activities-title">{text('home.about.activitiesTitle')}</p>
                    <div className="about-us__activities">
                        {activities.map((activity) => (
                            <div key={activity.labelKey} className="about-us__activity">
                                <span className="about-us__activity-icon">{activity.icon}</span>
                                <span className="about-us__activity-label">{text(activity.labelKey)}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
export default AboutUs;
