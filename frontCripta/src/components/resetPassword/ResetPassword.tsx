import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import "./resetPassword.scss"

const API_BASE = "/api"

export default function ResetPassword()
{
    const [token, setToken] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const t = params.get("token")
        if(!t)
        {
            toast.error("Token inválido o expirado")
        }
        else 
        {
            setToken(t)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(password.length < 8)
        {
            toast.error("La contraseña debe tener al menos 8 caracteres")
            return
        }

        if (password !== confirmPassword)
            {
            toast.error("Las contraseñas no coinciden")
            return
        }

        setLoading(true)

        try 
        {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            })

            const data = await res.json()

            if(!res.ok)
            {
                toast.error(data.message || "Token inválido o expirado")
                return
            }

            setDone(true)
            toast.success("¡Contraseña actualizada!")
        } catch
        {
            toast.error("Error de conexión. Inténtalo de nuevo")
        }finally 
        {
            setLoading(false)
        }
    }

    return (
        <div className="reset-page">
            <div className="reset-card">
                <h2 className="reset-title">NUEVA CONTRASEÑA</h2>

                {done ? (
                    <div className="reset-done">
                        <p>✅ Tu contraseña ha sido actualizada correctamente.</p>
                        <a href="/login" className="reset-back">Ir al inicio de sesión</a>
                    </div>
                ) : (
                    <form className="reset-form" onSubmit={handleSubmit}>
                        <div className="password-field">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <input  
                            type="password" 
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />

                        <button className="reset-submit" disabled={loading || !token}>
                            {loading ? "Guardando..." : "Guardar contraseña"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}