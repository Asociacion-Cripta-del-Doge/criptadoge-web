import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useWebTexts } from "../../hooks/useWebTexts"
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
    const text = useWebTexts("auth")

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const t = params.get("token")
        if(!t)
        {
            toast.error(text("auth.reset.errors.invalidToken"))
        }
        else
        {
            setToken(t)
        }
    }, [text])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(password.length < 8)
        {
            toast.error(text("auth.errors.passwordLength"))
            return
        }

        if (password !== confirmPassword)
        {
            toast.error(text("auth.errors.passwordMismatch"))
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
                toast.error(data.message || text("auth.reset.errors.invalidToken"))
                return
            }

            setDone(true)
            toast.success(text("auth.reset.successToast"))
        } catch
        {
            toast.error(text("auth.errors.connection"))
        } finally
        {
            setLoading(false)
        }
    }

    return (
        <div className="reset-page">
            <div className="reset-card">
                <h2 className="reset-title">{text("auth.reset.title")}</h2>

                {done ? (
                    <div className="reset-done">
                        <p>{text("auth.reset.doneBody")}</p>
                        <a href="/login" className="reset-back">{text("auth.reset.backLogin")}</a>
                    </div>
                ) : (
                    <form className="reset-form" onSubmit={handleSubmit}>
                        <div className="password-field">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={text("auth.reset.fields.password")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? text("auth.password.hide") : text("auth.password.show")}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>

                        <input
                            type="password"
                            placeholder={text("auth.fields.confirmPassword")}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />

                        <button className="reset-submit" disabled={loading || !token}>
                            {loading ? text("auth.reset.submit.loading") : text("auth.reset.submit.idle")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
