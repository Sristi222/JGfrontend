"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { User, Lock, ArrowRight } from "lucide-react"
import "./auth.css"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const loginUser = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Attempting login with:", { email, password })
      const res = await axios.post("https://dineshlaalshop.onrender.com/api/login", { email, password })
      console.log("Login response:", res.data)

      if (res.data.token) {
        localStorage.setItem("token", res.data.token)

        // Save username to localStorage
        if (res.data.username) {
          localStorage.setItem("username", res.data.username)
        } else {
          // If username is not provided in response, extract from email
          const username = email.split("@")[0]
          localStorage.setItem("username", username)
        }

        // Handle cart merging if needed
        const anonymousCart = JSON.parse(localStorage.getItem("cart")) || []
        if (anonymousCart.length > 0) {
          const userCartKey = `cart_${res.data.token}`
          const userCart = JSON.parse(localStorage.getItem(userCartKey)) || []
          const mergedCart = [...userCart, ...anonymousCart]
          localStorage.setItem(userCartKey, JSON.stringify(mergedCart))
          localStorage.removeItem("cart") // Remove anonymous cart
        }

        // Check if admin
        if (email === "admin@gmail.com") {
          localStorage.setItem("isAdmin", "true")
          navigate("/add-product") // go to admin panel
        } else {
          localStorage.setItem("isAdmin", "false")
          navigate("/") // go to homepage
        }
      } else {
        setError("Invalid response from server. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data : err.message)
      setError(err.response?.data?.message || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your JG Enterprise account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={loginUser}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <User size={18} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-footer">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="auth-link">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
