"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  ChevronUp,
  Filter,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Truck,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react"
import "./Home.css"

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

  useEffect(() => {
    setLoading(true)
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        setProducts(res.data)
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
      e.stopPropagation()
    }

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
    setCartCount(newCart.length)

    // Show success message instead of navigating
    alert(`${product.name} added to cart!`)
  }

  const toggleWishlist = (product, e) => {
    // Prevent event bubbling
    if (e) {
      e.stopPropagation()
    }

    const token = isLoggedIn()
    if (!token) {
      alert("Please log in to add items to your wishlist.")
      navigate("/login")
      return
    }

    const productId = product._id || product.name
    const wishlistKey = `wishlist_${token}`

    // Check if product is already in wishlist
    const isInWishlist = wishlist.some((item) => (item._id || item.name) === productId)

    let newWishlist
    if (isInWishlist) {
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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const toggleMobileFilter = () => setMobileFilterOpen(!mobileFilterOpen)
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen)
  const handlePriceChange = (e) => setPriceRange(e.target.value)

  return (
    <div className="app-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-contact">
            <div className="top-bar-item">
              <Phone size={14} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="top-bar-item">
              <Mail size={14} />
              <span>support@jgenterprise.com</span>
            </div>
          </div>
          <div className="top-bar-info">
            <div className="top-bar-item">
              <MapPin size={14} />
              <span>Store Locator</span>
            </div>
            <div className="top-bar-item">
              <Truck size={14} />
              <span>Free delivery on orders over ₹500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="navbar">
        <div className="navbar-container">
          <a href="/" className="logo">
            <span>JG Enterprise</span>
          </a>

          <div className="desktop-nav">
            <nav className="nav-links">
              <a href="/" className="nav-link">
                Home
              </a>
              <a href="/about" className="nav-link">
                About
              </a>
              <a href="/contact" className="nav-link">
                Contact
              </a>
            </nav>
          </div>

          <div className="header-actions">
            <div className="user-menu-container">
              {isLoggedIn() ? (
                <>
                  <button className="header-action-btn" onClick={toggleUserMenu}>
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
                        onClick={() => {
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
                  <a href="/login" className="auth-nav-btn login-nav-btn">
                    <LogIn size={16} />
                    <span>Login</span>
                  </a>
                  <a href="/register" className="auth-nav-btn register-nav-btn">
                    <UserPlus size={16} />
                    <span>Register</span>
                  </a>
                </div>
              )}
            </div>
            <a href="/favorites" className="header-action-btn">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
            </a>
            <a href="/cart" className="header-action-btn cart-icon-container">
              <ShoppingCart size={20} />
              <span className="cart-badge">{cartCount}</span>
            </a>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
          <nav className="mobile-nav-links">
            <a href="/" className="mobile-nav-link">
              Home
            </a>
            <a href="/about" className="mobile-nav-link">
              About
            </a>
            <a href="/contact" className="mobile-nav-link">
              Contact
            </a>
          </nav>
          <div className="mobile-auth">
            {isLoggedIn() ? (
              <>
                <div className="mobile-user-greeting">Hello, {getUserName()}</div>
                <button
                  className="btn logout-btn"
                  onClick={() => {
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
                <a href="/login" className="btn login-btn">
                  <LogIn size={16} />
                  Login
                </a>
                <a href="/register" className="btn register-btn">
                  <UserPlus size={16} />
                  Register
                </a>
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
            <h1>Fresh Groceries Delivered To Your Door</h1>
            <p>
              Discover our wide selection of fresh produce, pantry staples, and household essentials from your local
              kirana store.
            </p>
            <a href="/shop" className="btn shop-now-btn">
              Shop Now
            </a>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"
              alt="Fresh groceries"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop By Category</h2>
            <p>Find everything you need for your home</p>
          </div>
          <div className="categories-grid">
            <a href="/category/fruits-vegetables" className="category-card">
              <div className="category-image">
                <img
                  src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1970&auto=format&fit=crop"
                  alt="Fruits & Vegetables"
                />
              </div>
              <h3>Fruits & Vegetables</h3>
            </a>
            <a href="/category/dairy-eggs" className="category-card">
              <div className="category-image">
                <img
                  src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1974&auto=format&fit=crop"
                  alt="Dairy & Eggs"
                />
              </div>
              <h3>Dairy & Eggs</h3>
            </a>
            <a href="/category/pantry" className="category-card">
              <div className="category-image">
                <img
                  src="https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop"
                  alt="Pantry Staples"
                />
              </div>
              <h3>Pantry Staples</h3>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content - Products */}
      <main className="main-content">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Quality products for your daily needs</p>
          </div>

          <div className="products-container">
            <button className="mobile-filter-toggle" onClick={toggleMobileFilter}>
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
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Fruits & Vegetables</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Dairy & Eggs</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Meat & Seafood</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Bakery</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Pantry & Staples</span>
                    </label>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Dietary Preferences</h4>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Organic</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Vegetarian</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Vegan</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Gluten-Free</span>
                    </label>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Price Range</h4>
                  <div className="price-slider">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange}
                      onChange={handlePriceChange}
                      className="range-slider"
                    />
                    <div className="price-labels">
                      <span>₹0</span>
                      <span className="current-price">₹{priceRange}</span>
                      <span>₹1000</span>
                    </div>
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Brand</h4>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Amul</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Patanjali</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Nestle</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" />
                      <span className="checkbox-custom"></span>
                      <span>Britannia</span>
                    </label>
                  </div>
                </div>

                <button className="btn apply-filter-btn">Apply Filters</button>
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
                  {products.length > 0 ? (
                    products.map((product) => (
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
                          {/* Add a more visible wishlist button */}
                          <button
                            
                            title={isInWishlist(product) ? "Remove from Wishlist" : "Add to Wishlist"}
                            onClick={(e) => toggleWishlist(product, e)}
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
                              <button className="add-to-cart-btn" onClick={(e) => addToCart(product, e)}>
                                Add to Cart
                              </button>
                              <button
                                className={`wishlist-btn-small ${isInWishlist(product) ? "active" : ""}`}
                                onClick={(e) => toggleWishlist(product, e)}
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
                      <p>No products found.</p>
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
              <h3>JG Enterprise</h3>
              <p>Your local kirana store with everything you need for your home and family.</p>
              <div className="social-icons">
                <a href="#" className="social-icon">
                  <Facebook size={18} />
                </a>
                <a href="#" className="social-icon">
                  <Instagram size={18} />
                </a>
                <a href="#" className="social-icon">
                  <Twitter size={18} />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                <li>
                  <a href="#">Fruits & Vegetables</a>
                </li>
                <li>
                  <a href="#">Dairy & Eggs</a>
                </li>
                <li>
                  <a href="#">Meat & Seafood</a>
                </li>
                <li>
                  <a href="#">Bakery</a>
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
                  <span>123 Market Street, Fresh District, City</span>
                </li>
                <li>
                  <Phone size={16} />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li>
                  <Mail size={16} />
                  <span>support@jgenterprise.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} JG Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
