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
                        <span>{text("footer.brand")}</span>
                    </div>

                    <p>{text("footer.description")}</p>
                </div>

                <div className="footer-column">
                    <h4>{text("footer.linksTitle")}</h4>
                    <a href="/#inicio">{text("footer.links.home")}</a>
                    <a href="/#eventos">{text("footer.links.events")}</a>
                    <a href="/#about">{text("footer.links.about")}</a>
                    <a href="/#membresia">{text("footer.links.membership")}</a>
                </div>

                <div className="footer-column">
                    <h4>{text("footer.legalTitle")}</h4>
                    <a href="#">{text("footer.legal.privacy")}</a>
                    <a href="#">{text("footer.legal.terms")}</a>
                    <a href="#">{text("footer.legal.cookies")}</a>
                </div>

                <div className="footer-column">
                    <h4>{text("footer.contactTitle")}</h4>
                    <p>📍 {text("footer.contact.location")}</p>
                    <p>✉️ {text("footer.contact.email")}</p>
                    <p>🕒 {text("footer.contact.hours")}</p>
                </div>

                <div className="footer-bottom">
                    <p>{text("footer.copyright")}</p>
                    <a href="/#inicio">{text("footer.backToTop")}</a>
                </div>
            </div>
        </footer>
    )
}
