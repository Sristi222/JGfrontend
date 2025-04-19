import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart"; // ✅ Import Cart page
import ContactUs from "./pages/Contact"; // ✅ Import Cart page
import Wishlist from "./pages/wishlist";

import './App.css';

const isLoggedIn = () => !!localStorage.getItem("token");
const isAdmin = () => localStorage.getItem("isAdmin") === "true";

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  return isLoggedIn() && isAdmin() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} /> {/* ✅ Add this */}
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/favorites" element={<Wishlist />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
