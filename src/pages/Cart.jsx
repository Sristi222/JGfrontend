"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  X,
  ArrowLeft,
  ShoppingBag,
  Truck,
  AlertCircle,
  Trash2,
  Send,
  Plus,
  Minus,
  Home,
  PhoneIcon,
} from "lucide-react"
import "./Cart.css"

const Cart = () => {
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token && token !== "undefined" && token !== "null") {
      const cartKey = `cart_${token}`
      const stored = JSON.parse(localStorage.getItem(cartKey)) || []

      // Group items by product ID and add quantity
      const groupedCart = stored.reduce((acc, item) => {
        // Create a unique key for each product
        const productKey = item._id || item.name

        if (!acc[productKey]) {
          // If this product isn't in our accumulator yet, add it with quantity 1
          acc[productKey] = { ...item, quantity: 1 }
        } else {
          // If it is, just increment the quantity
          acc[productKey].quantity += 1
        }
        return acc
      }, {})

      // Convert back to array
      const cartWithQuantities = Object.values(groupedCart)

      console.log("Cart items loaded with quantities:", cartWithQuantities)
      setCart(cartWithQuantities)
    } else {
      setCart([])
    }
  }, [])

  const validateForm = () => {
    const errors = {}
    if (!customerName.trim()) {
      errors.name = "Name is required"
    }
    if (!customerPhone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, ""))) {
      errors.phone = "Please enter a valid 10-digit phone number"
    }
    if (!customerAddress.trim()) {
      errors.address = "Address is required"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const sendToWhatsApp = () => {
    if (!validateForm()) {
      return
    }

    // Format the product list with quantities
    const msg = cart.map((p) => `- ${p.name} x${p.quantity} (Rs. ${p.price * p.quantity})`).join("%0A")
    const total = calculateTotal()

    // Format the customer details
    const customerInfo = `%0A%0A[Customer Details]%0AName: ${customerName}%0APhone: ${customerPhone}%0AAddress: ${customerAddress}`

    // Combine everything into the final message
    const fullMessage = `Order:%0A${msg}%0A%0ATotal: Rs.${total}${customerInfo}`

    // Open WhatsApp with the formatted message
    window.open(`https://wa.me/9779813244622?text=${fullMessage}`, "_blank")
  }

  const clearCart = () => {
    const token = localStorage.getItem("token")
    if (token && token !== "undefined" && token !== "null") {
      const cartKey = `cart_${token}`
      localStorage.removeItem(cartKey)
      setCart([])
    }
  }

  const removeItem = (index) => {
    const token = localStorage.getItem("token")
    if (token && token !== "undefined" && token !== "null") {
      const cartKey = `cart_${token}`
      const newCart = [...cart]
      newCart.splice(index, 1)
      setCart(newCart)

      // Update localStorage with the new cart
      // We need to "flatten" the cart to maintain compatibility with the existing code
      const flattenedCart = newCart.flatMap((item) =>
        Array(item.quantity)
          .fill()
          .map(() => {
            const { quantity, ...itemWithoutQuantity } = item
            return itemWithoutQuantity
          }),
      )

      localStorage.setItem(cartKey, JSON.stringify(flattenedCart))
    }
  }

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return // Don't allow quantities less than 1

    const token = localStorage.getItem("token")
    if (token && token !== "undefined" && token !== "null") {
      const cartKey = `cart_${token}`
      const newCart = [...cart]
      newCart[index].quantity = newQuantity
      setCart(newCart)

      // Update localStorage with the new cart
      // We need to "flatten" the cart to maintain compatibility with the existing code
      const flattenedCart = newCart.flatMap((item) =>
        Array(item.quantity)
          .fill()
          .map(() => {
            const { quantity, ...itemWithoutQuantity } = item
            return itemWithoutQuantity
          }),
      )

      localStorage.setItem(cartKey, JSON.stringify(flattenedCart))
    }
  }

  const calculateItemTotal = (item) => {
    return (item.price * item.quantity).toFixed(2)
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>
            <ShoppingCart className="cart-header-icon" />
            Your Shopping Cart
          </h2>
          <p>
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your cart
          </p>
          <button className="back-to-home-btn" onClick={() => navigate("/")}>
            <Home size={16} />
            Back to Home
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={60} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button className="continue-shopping-btn" onClick={() => navigate("/")}>
              <ShoppingCart size={18} />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <div className="item-image">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src =
                          "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1974&auto=format&fit=crop"
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-description">{item.description || "Fresh product from JG Enterprise"}</p>
                    <div className="item-quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => updateQuantity(index, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="item-price">
                    <div className="price-per-item">Rs. {Number(item.price).toFixed(2)} each</div>
                    <div className="price-total">Rs. {calculateItemTotal(item)}</div>
                  </div>
                  <button className="remove-item-btn" onClick={() => removeItem(index)} aria-label="Remove item">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>Rs. {calculateTotal()}</span>
              </div>

              <div className="summary-row">
                <span className="shipping-label">
                  <Truck size={16} className="summary-icon" />
                  Shipping
                </span>
                <span className="free-shipping">Free</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {calculateTotal()}</span>
              </div>

              <div className="customer-details">
                <h4>Customer Information</h4>

                <div className="form-group">
                  <label htmlFor="customerName">Your Name</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className={formErrors.name ? "error" : ""}
                  />
                  {formErrors.name && (
                    <span className="error-message">
                      <AlertCircle size={14} className="error-icon" />
                      {formErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone">Phone Number</label>
                  <div className="input-with-icon">
                    <PhoneIcon size={18} className="input-icon" />
                    <input
                      type="tel"
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className={formErrors.phone ? "error" : ""}
                    />
                  </div>
                  {formErrors.phone && (
                    <span className="error-message">
                      <AlertCircle size={14} className="error-icon" />
                      {formErrors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="customerAddress">Delivery Address</label>
                  <textarea
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    className={formErrors.address ? "error" : ""}
                  ></textarea>
                  {formErrors.address && (
                    <span className="error-message">
                      <AlertCircle size={14} className="error-icon" />
                      {formErrors.address}
                    </span>
                  )}
                </div>
              </div>

              <button className="checkout-btn" onClick={sendToWhatsApp}>
                <Send size={18} />
                Checkout via WhatsApp
              </button>

              <button className="clear-cart-btn" onClick={clearCart}>
                <Trash2 size={16} />
                Clear Cart
              </button>

              <button className="continue-shopping-link" onClick={() => navigate("/")}>
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
