import "./footer.scss"
import logo from "../../assets/logo.png"


export const Footer = () => {
    return(
        <footer className="footer">
            <div className="footer-top-line"/>
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <img src={logo} alt="logo" />
                        <span>LA CRIPTA DE DOGE</span>
                    </div>

                    <p>
                        Asociación sin ánimo de lucro dedicada al ocio alternativo para jóvenes en Puertollano.
                    </p>
                </div>

                <div className="footer-column">
                    <h4>Enlaces</h4>
                    <a href="#inicio">Inicio</a>
                    <a href="#">Eventos</a>
                    <a href="#">Nosotros</a>
                    <a href="#">Únete al club</a>
                </div>

                <div className="footer-column">
                    <h4>Legal</h4>
                    <a href="#">Política de privacidad</a>
                    <a href="#">Términos y condiciones</a>
                    <a href="#">Política de cookies</a>
                </div>

                <div className="footer-column">
                    <h4>Contacto</h4>
                    <p>📍 Puertollano </p>
                    <p>✉️ info@criptadeldoge.es</p>
                    <p>🕒 Lun - Vie 17:00 - 22:00</p>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 La Cripta de Doge Club. Todos los derechos reservados.</p>
                    <a href="#inicio">Volver arriba</a>
                </div>
            </div>
        </footer>
    )
}