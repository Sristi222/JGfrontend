"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const res = await axios.get("https://dineshlaalshop.onrender.com/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setDesc(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setPreview(
      product.image?.startsWith("/uploads")
        ? `http://localhost:5000${product.image}`
        : product.image
    );
    setImageFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setName("");
    setDesc("");
    setPrice("");
    setCategory("");
    setImageFile(null);
    setPreview("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name || !desc || !price || (!imageFile && !editingId) || !category) {
      alert("Please fill all fields including category and image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", desc);
    formData.append("price", price);
    formData.append("category", category);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editingId) {
        await axios.put(`https://dineshlaalshop.onrender.com/api/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product updated successfully!");
      } else {
        await axios.post("https://dineshlaalshop.onrender.com/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product added successfully!");
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      alert("Failed to save product");
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`https://dineshlaalshop.onrender.com/api/products/${id}`);
    fetchProducts();
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="add-product-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Products</h2>
        <div>
          <button className="btn btn-outline-danger me-2" onClick={handleSignOut}>
            🔒 Sign Out
          </button>
          <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : "➕ Add New Product"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="add-product-card mt-3">
          <div className="add-product-header">
            <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
            <p>{editingId ? "Update the product details below" : "Enter the details of your new product below"}</p>
          </div>

          <div className="add-product-form">
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                className="form-control"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="desc">Description</label>
              <textarea
                id="desc"
                className="form-control"
                placeholder="Enter product description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input
                  id="price"
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">-- Select Category --</option>
                <option value="Grains">Grains</option>
                <option value="Rice">Rice</option>
                <option value="Oil">Oil</option>
                <option value="Taichin">Taichin Chamal</option>
                <option value="Chuira">Chuira</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">Upload Image</label>
              <input
                type="file"
                id="image"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && <img src={preview} alt="Preview" className="image-preview" />}
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={resetForm}>Cancel</button>
              <button className="btn-submit" onClick={handleSubmit}>
                {editingId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="product-table-section mt-5">
        <h4>All Products</h4>
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>Rs. {p.price}</td>
                  <td>{p.category}</td>
                  <td>
                    <img
                      src={p.image?.startsWith("/uploads")
                        ? `http://localhost:5000${p.image}`
                        : p.image}
                      className="product-thumb"
                      alt=""
                    />
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(p)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p._id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
