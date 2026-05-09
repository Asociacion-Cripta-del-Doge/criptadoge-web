import "./login.scss"
import { useState } from "react"
import toast from 'react-hot-toast'
import { useWebTexts } from "../../hooks/useWebTexts"

const API_BASE = "http://localhost:3000"

export default function Login(){
    const [mode, setMode] = useState<"login" | "register">("login")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const text = useWebTexts("auth")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(mode === "register" && password !== confirmPassword)
        {
            toast.error(text("auth.errors.passwordMismatch"))
            return
        }

        if(mode === "register" && password.length < 8)
        {
            toast.error(text("auth.errors.passwordLength"))
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
                    toast.error(data.message || text("auth.errors.invalidCredentials"))
                    return
                }

                localStorage.setItem("access_token", data.access_token)
                localStorage.setItem("token", data.access_token)
                localStorage.setItem("user", JSON.stringify(data.user))
                window.location.href = "/"
            }
            else
            {
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                })

                const data = await res.json()

                if(!res.ok)
                {
                    toast.error(data.message || text("auth.errors.createAccount"))
                    return
                }

                setMode("login")
                setEmail(email)
                setPassword("")
                toast.success(text("auth.success.accountCreated"))
            }
        } catch {
            toast.error(text("auth.errors.connection"))
        } finally {
            setLoading(false)
        }
    }

    const handleModeChange = (newMode: "login" | "register") => {
        setMode(newMode)
    }

    return(
        <div className="login-page">
            <a href="/" className="back-link">{text("auth.backHome")}</a>

            <div className="login-card">
                <div className="tabs">
                    <button
                        className={mode === "login" ? "active blue" : ""}
                        onClick={() => handleModeChange("login")}>
                            {text("auth.tabs.login")}
                    </button>
                    <button
                        className={mode === "register" ? "active pink" : ""}
                        onClick={() => handleModeChange("register")}>
                            {text("auth.tabs.register")}
                    </button>
                </div>

                <h2 className="login-title">
                    {mode === "login" ? text("auth.title.login") : text("auth.title.register")}
                </h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder={text("auth.fields.username")}
                            value={name}
                            onChange={(e) => setName(e.target.value)} required />
                    )}

                <input
                    type="email"
                    placeholder={text("auth.fields.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />

                <div className="password-header">
                    {mode === "login" && <a href="#">{text("auth.fields.forgotPassword")}</a>}
                </div>

                <div className="password-field">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder={text("auth.fields.password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</button>
                </div>

                {mode === "register" && (
                    <input
                    type="password"
                    placeholder={text("auth.fields.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required />
                )}

                <button className={`submit ${mode}`} disabled={loading}>
                    {loading
                        ? text("auth.submit.loading")
                        : mode === "login" ? text("auth.submit.login") : text("auth.submit.register")}
                </button>
            </form>

            <div className="divider">
                <span>{text("auth.divider")}</span>
            </div>

            <button className="google-btn" onClick={() => window.location.href = '/api/auth/google'}>
                {text("auth.google")}
            </button>

            <p className="register-text">
                {mode === "login" ? (
                    <>
                        {text("auth.switch.noAccount")} <span onClick={() => handleModeChange("register")}>{text("auth.switch.register")}</span>
                    </>
                ) : (
                    <>
                        {text("auth.switch.hasAccount")} <span onClick={() => handleModeChange("login")}>{text("auth.switch.login")}</span>
                    </>
                )}
            </p>
            </div>
        </div>
    )
}
