import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import STLViewer from "../STLViewer";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

export default function ProductDetail({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      let updated;

      if (existing) {
        updated = prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            price: parseFloat(product.price),
            thumbnail: product.thumbnail_image,
          },
        ];
      }

      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
      return updated;
    });

    toast.success(`${product.name} added to cart`);
  };

  if (loading) return <p className="p-8">Loading...</p>;
  if (!product) return <p className="p-8">Product not found.</p>;

  const productUrl = `/api/${product.model_file}`;

  return (
    <div className="w-3/4 p-8 flex">
      <aside className="w-1/4 pr-8">
        <Link to="/" className="text-blue-500 underline mb-4 block">
          <button className="mb-1 text-left hover:bg-accent_focused bg-accent text-page font-semibold py-2 px-4 rounded shadow">
            ← View Other Products
          </button>
        </Link>
      </aside>
      <main className="flex w-5/6 px-8 py-4">
        <div className="flex gap-6 flex-col w-full">
          <div className="w-full h-[300px]">
            <STLViewer url={productUrl} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
            <p className="text-lg font-semibold mb-4">${product.price}</p>
            <p className="mb-4">{product.description}</p>
            {user?.role === "customer" && (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={addToCart}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

ProductDetail.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }),
};
