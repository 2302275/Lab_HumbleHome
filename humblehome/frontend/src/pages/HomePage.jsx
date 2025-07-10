import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import STLViewer from "../STLViewer"; // import STLViewer

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/active");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <main className="w-full pb-10 justify-center flex-col items-center">
      <div
        id="banner"
        className="relative h-96 w-full bg-gray-200 flex items-center justify-center text-center"
      >
        <div className="w-5/6 h-full px-3 flex">
          <div className="w-1/2 flex items-center justify-center">
            <div>
              <div className="w-3/4">
                <h1 className="text-6xl font-bold text-left">
                  Live Better with Every Piece
                </h1>
              </div>

              <h2 className="text-left mt-5 text-md">
                Furniture that fits your life. Thoughtfully designed, beautifully crafted.
              </h2>
            </div>
          </div>
          <div className="w-1/2">
              <STLViewer url={`/api/uploads/models/AlchemyTable.stl`} />
          </div>
        </div>
      </div>
      <div className="w-full py-10 flex flex-col justify-center items-center">
        <div className="w-5/6 px-8 py-4 flex">
            <h1 className="text-2xl font-bold">Our Products</h1>
        </div>
        <div className="w-5/6 px-8 py-4 flex">
          <aside className="w-1/4 pr-8">
            <div className="max-w-sm rounded bg-white overflow-hidden shadow-lg">
              <div className="px-6 py-4">
                <h2 className="font-bold text-md mb-2">Categories</h2>
                <div className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id || category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`text-left py-2 px-4 rounded shadow ${
                        selectedCategory === category.name
                          ? "bg-accent font-bold text-page"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          <section className="w-3/4 grid grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, id: product.id }}
              />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
