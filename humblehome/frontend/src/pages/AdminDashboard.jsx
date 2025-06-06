import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    tags: "",
    stock: "",
    model_file: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const res = await fetch("http://localhost:5000/admin/add_product", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: data,
    })
      
    const response = await res.json();
    if (response.ok) {
        alert(response);
    }else {
        alert(data.error || "failed to upload");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" onChange={handleChange} placeholder="Name" required />
      <input type="number" name="price" onChange={handleChange} placeholder="Price" required />
      <textarea name="description" onChange={handleChange} placeholder="Description" required />
      <input type="text" name="tags" onChange={handleChange} placeholder="Tags" required />
      <input type="number" name="stock" onChange={handleChange} placeholder="Stock" required />
      <input type="file" name="model_file" onChange={handleChange} accept=".stl" required />
      <button type="submit">Add Product</button>
    </form>
  );
}

export default AdminDashboard;
