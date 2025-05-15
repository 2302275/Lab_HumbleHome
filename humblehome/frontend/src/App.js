import { useState } from 'react'
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';

const product = {
  name: '3D Printed Gear',
  price: 29.99,
  description: 'High-quality 3D printed part using durable PLA material.',
  modelUrl: 'http://localhost:5000/models/duck.stl', // or your local file path
}

const products = [
  {
    id: 1,
    name: "Duck",
    brand: "Duck",
    price: "SGD 400.00",
    image: "http://localhost:3000/images/duck.png",
    description: "DUCK",
    tag: "Cups",
    url: "http://localhost:3000/models/duck.stl"
  },
  {
    id: 2,
    name: "Egg",
    brand: "Egg",
    price: "SGD 40000.00",
    image: "http://localhost:3000/images/Ei.jpg",
    description: "EGG",
    tag: "Bowls",
    url: "http://localhost:3000/models/Mittelfinger_stl.stl"
  }
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.tag === selectedCategory)
    : products;
  return (
    <Router>
      <div className='w-full flex items-center flex-col bg-page min-h-screen' style={styles.page}>
        <Header />
        <div className="relative w-full h-72 bg-gray-200 flex items-center justify-center text-center">
          <h1 className="text-5xl font-light">HumbleHome</h1>
        </div>
        <Routes>
          <Route path="/" element={
        <main className='flex w-5/6 px-8 py-4'>
          <aside className="w-1/4 pr-8">
            <div class="max-w-sm rounded bg-white rounded overflow-hidden shadow-lg">
              <div class="px-6 py-4">
                <h2 className='font-bold text-md mb-2'>Categories</h2>
                <div className='flex flex-col gap-2'>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`text-left py-2 px-4 rounded shadow ${selectedCategory === null ? 'bg-primary font-bold text-page' : 'hover:bg-gray-100'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedCategory('Cups')}
                        className={`text-left py-2 px-4 rounded shadow ${selectedCategory === 'Cups' ? 'bg-primary font-bold text-page' : 'hover:bg-gray-100'}`}
                      >
                        Cups
                      </button>
                      <button
                        onClick={() => setSelectedCategory('Bowls')}
                        className={`text-left py-2 px-4 rounded shadow ${selectedCategory === 'Bowls' ? 'bg-primary font-bold text-page' : 'hover:bg-gray-100'}`}
                      >
                        Bowls
                      </button>
                    </div>
              </div>
            </div>
          </aside>
          <section className="w-3/4 grid grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={{ ...product, id: index }} />
            ))}
          </section>
        </main>
        } />
          <Route path="/product/:id" element={<ProductDetail products={products} />} />
        </Routes>
      </div>
    </Router>
  )
}

const styles = {
  card: {
    display: 'flex',
    maxWidth: 900,
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  modelContainer: {
    flex: 1,
    minWidth: 400,
    maxHeight: 400,
  },
  details: {
    flex: 1,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: 28,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  button: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}

{/* <div style={styles.card}>
        <div style={styles.modelContainer}>
          <STLViewer url={product.modelUrl} />
        </div>
        <div style={styles.details}>
          <h1 style={styles.name}>{product.name}</h1>
          <p style={styles.description}>{product.description}</p>
          <p style={styles.price}>${product.price.toFixed(2)}</p>
          <button style={styles.button}>Add to Cart</button>
        </div>
      </div> */}