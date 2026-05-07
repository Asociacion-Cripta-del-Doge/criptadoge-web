import { useState } from 'react';
import { createPortal } from 'react-dom';
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

export default function MembershipSection() 
{
    const [modalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if(!email.trim()) return;
        setLoading(true);
        //TODO
        await new Promise((res) => setTimeout(res, 800));
        setLoading(false);
        setSubmitted(true);
    }

    const handleClose = () => {
        setModalOpen(false);
        setEmail('');
        setSubmitted(false);
    }

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

            {modalOpen &&
                createPortal(
                    <div className="membership-modal__overlay" onClick={handleClose}>
                        <div 
                            className="membership-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                className="membership-modal__close"
                                onClick={handleClose}
                                aria-label="Cerrar"
                            >
                                x
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
                                    <button
                                        className="btn-outline membership-modal__submit"
                                        onClick={handleClose}
                                    >
                                        Cerrar
                                    </button>
                                </>
                            )}  
                        </div>
                    </div>,
                    document.body
                )
            }
        </section>
    )
}