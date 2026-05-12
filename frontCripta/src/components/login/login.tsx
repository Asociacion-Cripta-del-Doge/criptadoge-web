import "./login.scss"
import { useState } from "react"
import toast from 'react-hot-toast'

const API_BASE = "http://localhost:3000"

export default function Login(){
    const [mode, setMode] = useState<"login" | "register" | "forgot">("login")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [forgotSent, setForgotSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(mode === "register" && password !== confirmPassword)
        {
            toast.error("Las contraseñas no coinciden")
            return
        }
        
        if(mode === "register" && password.length < 8)
        {
            toast.error("La contraseña debe tener al menos 8 caracteres")
            return
        }
            setLoading(true)

        try 
        {
            if(mode === "login")
            {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                })

                const data = await res.json()

                if(!res.ok)
                {
                    toast.error(data.message || "Credenciales incorrectas")
                    return
                }

                localStorage.setItem("access_token", data.access_token)
                localStorage.setItem("token", data.access_token)
                localStorage.setItem("user", JSON.stringify(data.user))
                window.location.href = "/"
            }
            else if (mode === "register")
            {
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                })

                const data = await res.json()

                if(!res.ok)
                {
                    toast.error(data.message || "Error al crear la cuenta")
                    return
                }

                
                setMode("login")
                setEmail(email)
                setPassword("")
                toast.success("¡Cuenta creada! Ya puedes iniciar sesión.")
            }
            else if (mode === "forgot")
            {
                const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ email })
                })

                if(!res.ok)
                {
                    toast.error("Error al enviar el email")
                    return
                }
                setForgotSent(true)
            }
        } catch {
            toast.error("Error de conexión. Inténtalo de nuevo")
        } finally {
            setLoading(false)
        }
    }

    const handleModeChange = (newMode: "login" | "register" | "forgot") => {
        setMode(newMode)
        setForgotSent(false)
    }

    return (
    <div className="login-page">
      <a href="/" className="back-link">Volver al inicio</a>

      <div className="login-card">

        {mode !== "forgot" && (
          <div className="tabs">
            <button
              className={mode === "login" ? "active blue" : ""}
              onClick={() => handleModeChange("login")}>
              Iniciar sesión
            </button>
            <button
              className={mode === "register" ? "active pink" : ""}
              onClick={() => handleModeChange("register")}>
              Registrarse
            </button>
          </div>
        )}

        <h2 className="login-title">
          {mode === "login" && "INICIAR SESIÓN"}
          {mode === "register" && "CREAR CUENTA"}
          {mode === "forgot" && "RECUPERAR CONTRASEÑA"}
        </h2>

        {mode === "forgot" && forgotSent ? (
          <div className="forgot-sent">
            <p>📧 Si el email está registrado, recibirás un enlace en breve.</p>
            <button className="back-to-login" onClick={() => handleModeChange("login")}>
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required />
            )}

            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />

            {mode === "login" && (
              <div className="password-header">
                <a onClick={() => handleModeChange("forgot")} style={{ cursor: "pointer" }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            )}

            {mode === "register" && (
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required />
            )}

            <button className={`submit ${mode === "forgot" ? "login" : mode}`} disabled={loading}>
              {loading
                ? "Cargando..."
                : mode === "login" ? "Iniciar sesión"
                : mode === "register" ? "Crear cuenta"
                : "Enviar enlace de recuperación"}
            </button>

            {mode === "forgot" && (
              <button type="button" className="back-to-login" onClick={() => handleModeChange("login")}>
                Volver al inicio de sesión
              </button>
            )}
          </form>
        )}

        {mode !== "forgot" && (
          <>
            <div className="divider">
              <span>o continúa con</span>
            </div>

            <button className="google-btn" onClick={() => window.location.href = '/api/auth/google'}>
              Continuar con Google
            </button>

            <p className="register-text">
              {mode === "login" ? (
                <>¿No tienes cuenta? <span onClick={() => handleModeChange("register")}>Regístrate</span></>
              ) : (
                <>¿Ya tienes cuenta? <span onClick={() => handleModeChange("login")}>Inicia sesión</span></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
