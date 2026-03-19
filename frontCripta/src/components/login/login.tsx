import "./login.scss"

export default function Login(){
    return(
        <div className="login-page">
            <a href="/" className="back-link">Volver al inicio</a>

            <div className="login-card">
                <div className="tabs">
                    <button className="active blue">Iniciar sesión</button>
                    <button>Registrarse</button>
                </div>

                <h2 className="login-title">INICIAR SESIÓN</h2>

                <form className="login-form">
                <label>Email</label>
                <input type="email" placeholder="tu@email.com" />

                <div className="password-header">
                    <label>Contraseña</label>
                    <a href="#">¿Olvidaste tu contraseña?</a>
                </div>

                <div className="password-field">
                    <input type="password" />
                    <button type="button">👁️</button>
                </div>

                <button className="submit login">Iniciar sesión</button>
            </form>

            <div className="divider">
                <span>o continúa con</span>
            </div>

            <button className="google-btn">
                Continuar con Google
            </button>

            <p className="register-text">
                ¿No tienes cuenta?
                <a href="#"> Regístrate</a>    
            </p>

            </div>
        </div>
    )
}