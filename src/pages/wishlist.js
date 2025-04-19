"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Trash2, ArrowLeft, X } from "lucide-react"
import "./wishlist.css"

const isLoggedIn = () => {
  const token = localStorage.getItem("token")
  return token && token !== "undefined" && token !== "null" ? token : false
}

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const token = isLoggedIn()

    if (!token) {
      navigate("/login")
      return
    }

    // Load wishlist from localStorage
    const wishlistKey = `wishlist_${token}`
    const storedWishlist = JSON.parse(localStorage.getItem(wishlistKey)) || []
    setWishlist(storedWishlist)
    setLoading(false)
  }, [navigate])

  const removeFromWishlist = (product) => {
    const token = isLoggedIn()
    if (!token) return

    const productId = product._id || product.name
    const wishlistKey = `wishlist_${token}`

    // Remove from wishlist
    const newWishlist = wishlist.filter((item) => (item._id || item.name) !== productId)

    // Update state and localStorage
    setWishlist(newWishlist)
    localStorage.setItem(wishlistKey, JSON.stringify(newWishlist))
  }

  const addToCart = (product) => {
    const token = isLoggedIn()
    if (!token) {
      alert("Please log in to add items to your cart.")
      navigate("/login")
      return
    }

    // Create a copy of the product with properly formatted image path
    const productToAdd = {
      ...product,
      image: product.image?.startsWith("/uploads")
        ? `http://localhost:5000${product.image}`
        : product.image ||
          "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop",
    }

    // Use a user-specific cart key
    const cartKey = `cart_${token}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || []
    const newCart = [...existingCart, productToAdd]
    localStorage.setItem(cartKey, JSON.stringify(newCart))

    // Show success message
    alert(`${product.name} added to cart!`)
  }

  const moveToCart = (product) => {
    addToCart(product)
    removeFromWishlist(product)
  }

  return (
    <div className="app-container">
      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="wishlist-header">
            <button className="back-button" onClick={() => navigate("/")}>
              <ArrowLeft size={18} />
              <span>Back to Shopping</span>
            </button>
            <h1 className="wishlist-title">My Wishlist</h1>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading wishlist...</p>
            </div>
          ) : (
            <>
              {wishlist.length > 0 ? (
                <div className="wishlist-grid">
                  {wishlist.map((product) => (
                    <div className="wishlist-card" key={product._id || product.name}>
                      <button
                        className="remove-wishlist-btn"
                        onClick={() => removeFromWishlist(product)}
                        aria-label="Remove from wishlist"
                      >
                        <X size={18} />
                      </button>

                      <div className="wishlist-image">
                        <img
                          src={
                            product.image?.startsWith("/uploads")
                              ? `http://localhost:5000${product.image}`
                              : product.image ||
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src =
                              "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
                          }}
                        />
                      </div>

                      <div className="wishlist-details">
                        <div className="wishlist-category">{product.category || "Grocery"}</div>
                        <h3 className="wishlist-name">{product.name}</h3>

                        <div className="wishlist-price-row">
                          <div className="wishlist-price">
                            {product.oldPrice && (
                              <span className="old-price">₹{Number(product.oldPrice).toLocaleString()}</span>
                            )}
                            <span className="current-price">₹{Number(product.price).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="wishlist-actions">
                          <button className="move-to-cart-btn" onClick={() => moveToCart(product)}>
                            <ShoppingCart size={16} />
                            Move to Cart
                          </button>
                          <button className="remove-btn" onClick={() => removeFromWishlist(product)}>
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-wishlist">
                  <div className="empty-wishlist-icon">
                    <Heart size={64} />
                  </div>
                  <h2>Your wishlist is empty</h2>
                  <p>Add items you love to your wishlist. Review them anytime and easily move them to the cart.</p>
                  <button className="continue-shopping-btn" onClick={() => navigate("/")}>
                    Continue Shopping
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Wishlist
