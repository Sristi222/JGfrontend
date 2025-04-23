"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Menu, X, ShoppingCart, User, Heart, ChevronDown, ChevronUp, Filter, Facebook, Instagram, Twitter, MapPin, Phone, Mail, Truck, LogOut, LogIn, UserPlus } from 'lucide-react'
import "./Home.css"
import "./Contact"

const isLoggedIn = () => {
  const token = localStorage.getItem("token")
  return token && token !== "undefined" && token !== "null" ? token : false
}

const getUserName = () => {
  return localStorage.getItem("username") || "User"
}

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  localStorage.removeItem("isAdmin")
  // Clear user-specific cart
  const token = localStorage.getItem("token")
  if (token) {
    localStorage.removeItem(`cart_${token}`)
  }
}

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState(500)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [username, setUsername] = useState("")
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()
  const [productDataSample, setProductDataSample] = useState(null) // Initialize state for product data sample
  const [selectedCategories, setSelectedCategories] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [availableCategories, setAvailableCategories] = useState([])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const mobileMenuRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    axios
      .get("https://dineshlaalshop.onrender.com/api/products")
      .then((res) => {
        const productsData = res.data
        setProducts(productsData)
        setFilteredProducts(productsData)

        // Find the highest price for the range slider
        const highestPrice = Math.max(...productsData.map((product) => Number(product.price || 0)))
        setMaxPrice(highestPrice > 0 ? Math.ceil(highestPrice) : 1000)
        setPriceRange(highestPrice > 0 ? Math.ceil(highestPrice) : 500)

        // Extract unique categories from products
        const categories = new Set()
        productsData.forEach((product) => {
          if (product.category) {
            categories.add(product.category)
          } else {
            categories.add("Grocery") // Add default category
          }
        })
        setAvailableCategories(Array.from(categories))
        console.log("Available categories:", Array.from(categories))

        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching products:", err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // Check if token exists and is valid
    const token = localStorage.getItem("token")
    if (token && (token === "undefined" || token === "null")) {
      console.log("Invalid token found, clearing...")
      localStorage.removeItem("token")
    }

    // Get username from localStorage
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    // Update cart count based on user-specific cart
    if (token && token !== "undefined" && token !== "null") {
      const cartKey = `cart_${token}`
      const cart = JSON.parse(localStorage.getItem(cartKey)) || []
      setCartCount(cart.length)

      // Load wishlist
      const wishlistKey = `wishlist_${token}`
      const storedWishlist = JSON.parse(localStorage.getItem(wishlistKey)) || []
      setWishlist(storedWishlist)
    } else {
      setCartCount(0)
      setWishlist([])
    }
  }, [])

  // Move this useEffect outside the product-grid section to avoid conditional hook call
  useEffect(() => {
    if (products.length > 0) {
      setProductDataSample(products[0])
      console.log("Product data sample:", products[0])
    }
  }, [products])

  const addToCart = (product, e) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const token = isLoggedIn()
    if (!token) {
      // Instead of redirecting, show login prompt
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }

    // Create a copy of the product with properly formatted image path
    const productToAdd = {
      ...product,
      image: product.image?.startsWith("/uploads")
        ? `https://dineshlaalshop.onrender.com${product.image}`
        : product.image ||
          "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop",
    }

    // Use a user-specific cart key
    const cartKey = `cart_${token}`
    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || []
    const newCart = [...existingCart, productToAdd]
    localStorage.setItem(cartKey, JSON.stringify(newCart))
    setCartCount(newCart.length)

    // Show success message instead of navigating
    alert(`${product.name} added to cart!`)
  }

  const toggleWishlist = (product, e) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const token = isLoggedIn()
    if (!token) {
      // Instead of redirecting, show login prompt
      setShowLoginPrompt(true)
      setTimeout(() => setShowLoginPrompt(false), 3000)
      return
    }

    const productId = product._id || product.name
    const wishlistKey = `wishlist_${token}`

    // Check if product is already in wishlist
    const isProductInWishlist = wishlist.some((item) => (item._id || item.name) === productId)

    let newWishlist
    if (isProductInWishlist) {
      // Remove from wishlist
      newWishlist = wishlist.filter((item) => (item._id || item.name) !== productId)
      alert(`${product.name} removed from wishlist!`)
    } else {
      // Add to wishlist
      const productToAdd = {
        ...product,
        image: product.image?.startsWith("/uploads")
          ? `http://localhost:5000${product.image}`
          : product.image ||
            "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop",
      }
      newWishlist = [...wishlist, productToAdd]
      alert(`${product.name} added to wishlist!`)
    }

    // Update state and localStorage
    setWishlist(newWishlist)
    localStorage.setItem(wishlistKey, JSON.stringify(newWishlist))
  }

  const isInWishlist = (product) => {
    const productId = product._id || product.name
    return wishlist.some((item) => (item._id || item.name) === productId)
  }

  const toggleMobileFilter = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setMobileFilterOpen(!mobileFilterOpen)
  }

  const toggleUserMenu = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setUserMenuOpen(!userMenuOpen)
  }

  const handlePriceChange = (e) => setPriceRange(e.target.value)

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const applyFilters = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Applying filters...")
    console.log("Original products count:", products.length)
    console.log("Selected categories:", selectedCategories)
    console.log("Price range:", priceRange)

    let filtered = [...products]

    // Filter by selected categories (case-insensitive)
    if (selectedCategories.length > 0) {
      console.log("Filtering by categories...")
      filtered = filtered.filter((product) => {
        const productCategory = product.category || "Grocery"
        const isIncluded = selectedCategories.some((cat) => cat.toLowerCase() === productCategory.toLowerCase())
        console.log(`Product ${product.name}, category: ${productCategory}, included: ${isIncluded}`)
        return isIncluded
      })
    }

    // Filter by price range
    console.log("Filtering by price...")
    filtered = filtered.filter((product) => {
      const price = Number(product.price || 0)
      const isIncluded = price <= Number(priceRange)
      console.log(`Product ${product.name}, price: ${price}, max: ${priceRange}, included: ${isIncluded}`)
      return isIncluded
    })

    console.log("Filtered products result count:", filtered.length)
    setFilteredProducts(filtered)
    // Close mobile filter on apply
    setMobileFilterOpen(false)
  }

  const resetFilters = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Resetting filters")
    setSelectedCategories([])
    setPriceRange(maxPrice)
    setFilteredProducts(products)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest(".user-menu-container")) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  // Handle hamburger menu click
  const handleMobileMenuToggle = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Toggle mobile menu clicked, current state:", mobileMenuOpen)
    setMobileMenuOpen(!mobileMenuOpen)

    // Toggle body scroll when menu is open
    if (!mobileMenuOpen) {
      document.body.style.overflow = "hidden"
      setUserMenuOpen(false)
      setMobileFilterOpen(false)
    } else {
      document.body.style.overflow = ""
    }
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Handle direct navigation to login/register
  const goToLogin = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    navigate("/login")
  }

  const goToRegister = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    navigate("/register")
  }

  return (
    <div className="app-container">
      {/* Mobile Menu Backdrop */}
      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? "active" : ""}`} onClick={handleMobileMenuToggle}></div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="login-prompt">
          <p>Please log in to continue</p>
          <div className="login-prompt-actions">
            <button onClick={goToLogin} className="login-prompt-btn">
              Login
            </button>
            <button onClick={goToRegister} className="register-prompt-btn">
              Register
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-contact">
            <div className="top-bar-item">
              <Phone size={14} />
              <span>+977 9841241832</span>
            </div>
            <div className="top-bar-item">
              <Mail size={14} />
              <span>support@jgenterprise.com</span>
            </div>
          </div>
          <div className="top-bar-info">
            <div className="top-bar-item">
              <Truck size={14} />
              <span>Delivery service available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            <span>Dinesh Laal's Shop</span>
          </a>

          <div className="desktop-nav">
            <nav className="nav-links">
              <a href="/" className="nav-link">
                Home
              </a>
              <a href="/contactUs" className="nav-link">
                Contact
              </a>
            </nav>
          </div>

          <div className="header-actions">
            <div className="user-menu-container">
              {isLoggedIn() ? (
                <>
                  <button className="header-action-btn" onClick={toggleUserMenu} aria-label="User menu">
                    <User size={20} />
                  </button>
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <div className="dropdown-user-info">
                        <User size={16} />
                        <span>{getUserName()}</span>
                      </div>
                      <a href="/account" className="dropdown-item">
                        <User size={16} />
                        <span>My Account</span>
                      </a>
                      <a href="/orders" className="dropdown-item">
                        <Truck size={16} />
                        <span>My Orders</span>
                      </a>
                      <button
                        className="dropdown-item logout-item"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          logout()
                          window.location.reload()
                        }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="auth-nav-buttons">
                  <a href="/login" className="auth-nav-btn login-nav-btn" onClick={goToLogin}>
                    <LogIn size={16} />
                    <span>Login</span>
                  </a>
                  <a href="/register" className="auth-nav-btn register-nav-btn" onClick={goToRegister}>
                    <UserPlus size={16} />
                    <span>Register</span>
                  </a>
                </div>
              )}
            </div>
            <button
              className="header-action-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isLoggedIn()) {
                  setShowLoginPrompt(true)
                  setTimeout(() => setShowLoginPrompt(false), 3000)
                } else {
                  navigate("/favorites")
                }
              }}
              aria-label="Favorites"
            >
              <Heart size={20} />
              {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
            </button>
            <button
              className="header-action-btn cart-icon-container"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isLoggedIn()) {
                  setShowLoginPrompt(true)
                  setTimeout(() => setShowLoginPrompt(false), 3000)
                } else {
                  navigate("/cart")
                }
              }}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <span className="cart-badge">{cartCount}</span>
            </button>
            <button
              ref={hamburgerRef}
              className="mobile-menu-toggle"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle menu"
              type="button"
              style={{
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                zIndex: 1000,
                position: "relative",
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div ref={mobileMenuRef} className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <div className="mobile-menu-title">Dinesh Laal's Shop</div>
            
            </div>

          <nav className="mobile-nav-links">
            <a
              href="/"
              className="mobile-nav-link"
              onClick={(e) => {
                e.preventDefault()
                setMobileMenuOpen(false)
                navigate("/")
              }}
            >
              Home
            </a>
            <a
              href="/contactUs"
              className="mobile-nav-link"
              onClick={(e) => {
                e.preventDefault()
                setMobileMenuOpen(false)
                navigate("/contactUs")
              }}
            >
              Contact
            </a>
          </nav>

          <div className="mobile-auth">
            {isLoggedIn() ? (
              <>
                <div className="mobile-user-greeting">Hello, {getUserName()}</div>
                <button
                  className="btn logout-btn"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    logout()
                    window.location.reload()
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <button className="btn login-btn" onClick={goToLogin}>
                  <LogIn size={16} />
                  Login
                </button>
                <button className="btn register-btn" onClick={goToRegister}>
                  <UserPlus size={16} />
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="offer-badge">Special Offer</span>
            <h1>Shop premium quality essentials</h1>
            <p>
              Explore our handpicked collection of everyday essentials — from chiura, daal, and cooking oils to premium
              flours, pulses, and more. Shop local, eat better.
            </p>
            <a href="#featured-products" className="btn shop-now-btn">
              Shop Now
            </a>
          </div>
          <div className="hero-image">
            <img
              src="https://s.yimg.com/ny/api/res/1.2/UkNv97.Zymn6YPWv8c_ywg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://s.yimg.com/os/creatr-uploaded-images/2025-02/40106400-f3de-11ef-ae42-a01caf20d14d"
              alt="Fresh groceries"
            />
          </div>
        </div>
      </section>

      {/* Main Content - Products */}
      <main className="main-content" id="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Quality products for your daily needs</p>
          </div>

          <div className="products-container">
            <button className="mobile-filter-toggle" onClick={toggleMobileFilter} aria-expanded={mobileFilterOpen}>
              <Filter size={16} />
              <span>Filters</span>
              {mobileFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <aside className={`sidebar ${mobileFilterOpen ? "active" : ""}`}>
              <div className="filter-section">
                <h3>Filters</h3>

                <div className="filter-group">
                  <h4>Categories</h4>
                  <div className="checkbox-group">
                    {/* Default Grocery category */}
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={selectedCategories.includes("Grocery")}
                        onChange={() => handleCategoryChange("Grocery")}
                      />
                      <span className="checkbox-custom"></span>
                      <span>Grocery</span>
                    </label>

                    {/* Dynamic categories from products */}
                    {availableCategories
                      .filter((cat) => cat !== "Grocery") // Skip Grocery as it's already added above
                      .map((category) => (
                        <label className="checkbox-label" key={category}>
                          <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                          />
                          <span className="checkbox-custom"></span>
                          <span>{category}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Price Range</h4>
                  <div className="price-slider">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange}
                      onChange={handlePriceChange}
                      className="range-slider"
                    />
                    <div className="price-range-values">
                      <span>₹0</span>
                      <span>₹{priceRange}</span>
                    </div>
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="btn apply-filter-btn" onClick={applyFilters}>
                    Apply Filters
                  </button>
                  <button className="btn reset-filter-btn" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </div>
              </div>
            </aside>

            <section className="product-grid">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div className="product-card" key={product._id || product.name}>
                        <div className="product-image">
                          <img
                            src={
                              product.image?.startsWith("/uploads")
                                ? `http://localhost:5000${product.image}`
                                : product.image ||
                                  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
                            }
                            alt={product.name}
                            onError={(e) => {
                              console.log("Image failed to load:", e.target.src)
                              e.target.onerror = null
                              e.target.src =
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
                            }}
                          />
                          {/* Wishlist button */}
                          <button
                            className={`wishlist-btn-main ${isInWishlist(product) ? "active" : ""}`}
                            title={isInWishlist(product) ? "Remove from Wishlist" : "Add to Wishlist"}
                            onClick={(e) => toggleWishlist(product, e)}
                            aria-label={isInWishlist(product) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart size={18} />
                          </button>
                          {product.isOrganic && <span className="product-badge organic">Organic</span>}
                          {product.discount && <span className="product-badge sale">Sale</span>}
                        </div>
                        <div className="product-details">
                          <div className="product-category">{product.category || "Grocery"}</div>
                          <h3 className="product-name">{product.name}</h3>
                          <div className="product-meta"></div>
                          <div className="product-price-row">
                            <div className="product-price">
                              {product.oldPrice && (
                                <span className="old-price">₹{Number(product.oldPrice).toLocaleString()}</span>
                              )}
                              <span className="current-price">₹{Number(product.price).toLocaleString()}</span>
                            </div>
                            <div className="product-buttons">
                              <button
                                className="add-to-cart-btn"
                                onClick={(e) => addToCart(product, e)}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                Add to Cart
                              </button>
                              <button
                                className={`wishlist-btn-small ${isInWishlist(product) ? "active" : ""}`}
                                onClick={(e) => toggleWishlist(product, e)}
                                aria-label={isInWishlist(product) ? "Remove from Wishlist" : "Add to Wishlist"}
                              >
                                <Heart size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">
                      <p>No products found matching your filters.</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <h3>Dinesh Laal's Shop</h3>
              <p>Your local kirana store with everything you need for your home and family.</p>
              <div className="social-icons">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                <li>
                  <a href="#">Grains</a>
                </li>
                <li>
                  <a href="#">Rice</a>
                </li>
                <li>
                  <a href="#">Oil</a>
                </li>
                <li>
                  <a href="#">Bitten Rice</a>
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
                  <a href="#">Delivery Information</a>
                </li>
                <li>
                  <a href="#">Return Policy</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <ul className="contact-info">
                <li>
                  <MapPin size={16} />
                  <span>Bhedasingh, Kathmandu</span>
                </li>
                <li>
                  <Phone size={16} />
                  <span>+977 9841241832</span>
                </li>
                <li>
                  <Mail size={16} />
                  <span>support@jgenterprise.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Dinesh Lal's Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
