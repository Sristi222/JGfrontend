"use client"

import { useRef, useEffect, useState } from "react"
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import "./Contact.css"

function ContactUs() {
  const contactRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash === "#contact" && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const handleWhatsAppRedirect = () => {
    window.open("https://wa.me/9779841241832", "_blank")
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const isLoggedIn = () => !!localStorage.getItem("token")
  const logout = () => localStorage.removeItem("token")

  return (
    <div className="app-container">
      {/* Header/Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            🛍️ Dinesh Laal's Shop
          </a>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="/ContactUs" className="nav-link active">
              Contact
            </a>

            <div className="auth-buttons">
              {isLoggedIn() ? (
                <button
                  className="btn logout-btn"
                  onClick={() => {
                    logout()
                    window.location.reload()
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login" className="btn login-btn">
                    Login
                  </a>
                  <a href="/register" className="btn register-btn">
                    Register
                  </a>
                </>
              )}
              <a href="/cart" className="cart-icon">
                🛒
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Contact Section */}
      <section className="contact-us" id="contact" ref={contactRef}>
        <div className="contact-container">
          <h2 className="contact-title">Get in Touch</h2>
          <p className="contact-subtitle">We're here to answer any questions you may have</p>

          <div className="contact-content">
            <div className="contact-info">
              <div className="info-group">
                <h3 className="info-title">Contact Information</h3>
                <div className="info-item">
                  <Phone size={20} />
                  <div>
                    <p>+977 9841241832</p>
                  </div>
                </div>
                <div className="info-item">
                  <Mail size={20} />
                  <a href="mailto:dineshlaal@gmail.com" className="email-link">
                    dineshlaalshrestha@gmail.com
                  </a>
                </div>
                <div className="info-item">
                  <MapPin size={20} />
                  <p>Bhedasingh, Kathmandu</p>
                </div>
              </div>
              <div className="info-group">
                <h3 className="info-title">Business Hours</h3>
                <div className="info-item">
                  <Clock size={20} />
                  <p>Saturday - Friday: 9: 00 AM - 7:00 PM</p>
                </div>
              </div>
              <button onClick={handleWhatsAppRedirect} className="whatsapp-btn">
                <MessageCircle size={20} />
                CHAT US NOW
              </button>
            </div>
            <div className="map-container">
            <iframe
  title="Shop Location"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  loading="lazy"
  allowFullScreen
  referrerPolicy="no-referrer-when-downgrade"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d299.6070777350183!2d85.30944906148522!3d27.706854062666604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19c2f7450703%3A0xfab20cf918bdf0b2!2sDapxy!5e0!3m2!1sen!2snp!4v1744653628622!5m2!1sen!2snp"></iframe>"

</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <h3>Dinesh Laal's Shop</h3>
              <p>Your one-stop destination for premium essentials.</p>
            </div>

            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                <li>
                  <a href="#">New Arrivals</a>
                </li>
                <li>
                  <a href="#">Best Sellers</a>
                </li>
                <li>
                  <a href="#">Sale</a>
                </li>
                <li>
                  <a href="#">Collections</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Help</h4>
              <ul>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">FAQs</a>
                </li>
                <li>
                  <a href="#">Shipping</a>
                </li>
                <li>
                  <a href="#">Returns</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Newsletter</h4>
              <p>Subscribe to get special offers and updates.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" />
                <button className="btn subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Dinesh Laal's Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ContactUs
