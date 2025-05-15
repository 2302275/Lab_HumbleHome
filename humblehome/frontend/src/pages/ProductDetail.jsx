import React from 'react';
import { useParams, Link } from 'react-router-dom';
import STLViewer from '../STLViewer'

export default function ProductDetail({ products }) {
  const { id } = useParams();
  const product = products[parseInt(id)];

  if (!product) return <p>Product not found.</p>;

  return (
    <div className="w-3/4 p-8 flex">
        <aside className="w-1/4 pr-8">
            <Link to="/" className="text-blue-500 underline mb-4 block">
                <button class="mb-1 text-left hover:bg-accent_focused bg-accent text-page font-semibold py-2 px-4 rounded shadow">
                    ← View Other Products
                </button>
            </Link>
        </aside>
        <main className='flex w-5/6 px-8 py-4'>
            <div className="flex gap-6 flex-col w-full">
                <div className="w-full h-[300px]">
                    <STLViewer url={product.url} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-lg font-semibold mb-4">{product.price}</p>
                    <p className="mb-4">{product.description}</p>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded">Add to Cart</button>
                </div>
            </div>
        </main>
</div>
  );
}