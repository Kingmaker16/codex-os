import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Head from 'next/head';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <>
      <Head>
        <title>TechGadgets Store - Premium Products</title>
        <meta name="description" content="TechGadgets Store - Discover amazing products" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="container">
        <Hero />
        
        <section className="products-grid">
          <h2>Our Products</h2>
          <div className="grid">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
