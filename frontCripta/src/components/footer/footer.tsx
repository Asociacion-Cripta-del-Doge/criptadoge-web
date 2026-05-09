import "./footer.scss"
import logo from "../../assets/logo.png"
import { useWebTexts } from "../../hooks/useWebTexts"

export const Footer = () => {
    const text = useWebTexts("footer")

    return(
        <footer className="footer">
            <div className="footer-top-line"/>
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <img src={logo} alt="logo" />
                        <span>LA CRIPTA DE DOGE</span>
                    </div>

                    <p>{text("footer.description")}</p>
                </div>

                <div className="footer-column">
                    <h4>Enlaces</h4>
                    <a href="#inicio">Inicio</a>
                    <a href="#eventos">Eventos</a>
                    <a href="#about">Nosotros</a>
                    <a href="#membresia">Únete al club</a>
                </div>

                <div className="footer-column">
                    <h4>Legal</h4>
                    <a href="#">Política de privacidad</a>
                    <a href="#">Términos y condiciones</a>
                    <a href="#">Política de cookies</a>
                </div>

                <div className="footer-column">
                    <h4>Contacto</h4>
                    <p>📍 {text("footer.contact.location")}</p>
                    <p>✉️ {text("footer.contact.email")}</p>
                    <p>🕒 {text("footer.contact.hours")}</p>
                </div>

                <div className="footer-bottom">
                    <p>{text("footer.copyright")}</p>
                    <a href="#inicio">Volver arriba</a>
                </div>
            </div>
        </footer>
    )
}
