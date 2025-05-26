import { useState } from 'react'
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ListOfReviews from './pages/ListOfReviews';


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
      <div className='w-full flex items-center flex-col bg-page min-h-screen'>
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
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/reviews" element={<ListOfReviews/>} />

        </Routes>
      </div>
    </Router>
  )
}
