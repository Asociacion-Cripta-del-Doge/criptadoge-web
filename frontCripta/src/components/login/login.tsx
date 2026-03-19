import "./login.scss"
import { useState } from "react"

export default function Login(){
    const [mode, setMode] = useState<"login" | "register">("login")

    return(
        <div className="login-page">
            <a href="/" className="back-link">Volver al inicio</a>

            <div className="login-card">
                <div className="tabs">
                    <button
                        className={mode === "login" ? "active blue" : ""}
                        onClick={() => setMode("login")}>
                            Iniciar sesión
                    </button>
                    <button
                        className={mode === "register" ? "active pink" : ""}
                        onClick={() => setMode("register")}>
                            Registrarse
                    </button>
                </div>

                <h2 className="login-title">
                    {mode === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}
                </h2>

                <form className="login-form">
                    {mode === "register" && (
                        <input type="text" placeholder="Nombre de usuario" />
                    )}
                <label>Email</label>
                <input type="email" placeholder="tu@email.com" />

                <div className="password-header">
                    <label>Contraseña</label>
                    {mode === "login" && <a href="#">¿Olvidaste tu contraseña?</a>}
                </div>

                <div className="password-field">
                    <input type="password" />
                    <button type="button">👁️</button>
                </div>

                {mode === "register" && (
                    <input type="password" placeholder="Confirmar contraseña" />
                )}

                <button className={`submit ${mode}`}>
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
            </form>

            <div className="divider">
                <span>o continúa con</span>
            </div>

            <button className="google-btn">
                Continuar con Google
            </button>

            <p className="register-text">
                {mode === "login" ? (
                    <>
                        ¿No tienes cuenta? <span onClick={() => setMode("register")}>Regístrate</span>
                    </>
                ) : (
                    <>
                        ¿Ya tienes cuenta? <span onClick={() => setMode("login")}>Inicia sesión</span>
                    </>
                )}  
            </p>
            </div>
        </div>
    )
}