import "./login.scss"
import { useState } from "react"

export default function Login(){
    const [mode, setMode] = useState<"login" | "register">("login")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(mode === "register" && password !== confirmPassword)
        {
            alert("Las contraseñas no coinciden")
            return
        }

        try 
        {
            const endpoint = 
                mode === "login"
                    ?  "http://localhost:8080/api/login"
                    : "http://localhost:8080/api/register"

                    const res = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                            password,
                            username
                        })
                    })

            const data = await res.json()
            console.log(data)
        } catch(error)
        {
            console.error("Error:", error)
        }
    }

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

                <form className="login-form" onSubmit={handleSubmit}>
                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} />
                    )}

                <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />

                <div className="password-header">
                    {mode === "login" && <a href="#">¿Olvidaste tu contraseña?</a>}
                </div>

                <div className="password-field">
                    <input
                        type="password"
                        placeholder="Contarseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    <button type="button">👁️</button>
                </div>

                {mode === "register" && (
                    <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required />
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