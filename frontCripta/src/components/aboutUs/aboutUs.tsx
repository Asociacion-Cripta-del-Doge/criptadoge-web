import './aboutUs.scss';
import { useWebTexts } from '../../hooks/useWebTexts';

const activities = [
    { icon: '🎲', label: 'Juegos de mesa' },
    { icon: '🃏', label: 'TCG' },
    { icon: '🐉', label: 'Rol de mesa' },
    { icon: '🕹️', label: 'Arcade & Retro' },
    { icon: '⚔️', label: 'Softcombat' },
    { icon: '💻', label: 'Informática' },
    { icon: '🖨️', label: 'Impresión 3D' },
    { icon: '🎨', label: 'Pintado figuras' },
];

const pillars = [
    {
    icon: '👥',
    title: 'Comunidad',
    description: 'Un punto de encuentro real para la juventud de Puertollano.',
    modifier: 'blue',
    },
    {
        icon: '💡',
        title: 'Creatividad',
        description: 'Fomentamos habilidades, pensamiento estratégico e imaginación.',
        modifier: 'pink',
    },
    {
        icon: '📖',
        title: 'Cultura',
        description: 'Ocio alternativo y enriquecedor al alcance de todos.',
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
                            <div key={pillar.title} className={`about-us__pillar about-us__pillar--${pillar.modifier}`}>
                                <span className="about-us__pillar-icon">{pillar.icon}</span>
                                <div>
                                    <p className="about-us__pillar-title">{pillar.title}</p>
                                    <p className="about-us__pillar-desc">{pillar.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="about-us__right">
                    <div className="about-us__stats">
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">8+</span>
                            <span className="about-us__stat-label">Actividades</span>
                        </div>
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">100%</span>
                            <span className="about-us__stat-label">Sin ánimo de lucro</span>
                        </div>
                        <div className="about-us__stat">
                            <span className="about-us__stat-number">Puer.</span>
                            <span className="about-us__stat-label">Puertollano</span>
                        </div>
                    </div>
                    <p className="about-us__activities-title">Nuestras actividades</p>
                    <div className="about-us__activities">
                        {activities.map((activity) => (
                            <div key={activity.label} className="about-us__activity">
                                <span className="about-us__activity-icon">{activity.icon}</span>
                                <span className="about-us__activity-label">{activity.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
export default AboutUs;
