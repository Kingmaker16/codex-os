import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Reviews from '../../components/Reviews';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetch('/products.json')
        .then(res => res.json())
        .then(data => {
          const found = data.find((p: any) => p.id === id);
          setProduct(found);
        });
    }
  }, [id]);

  const handleCheckout = async () => {
    alert('Checkout coming soon! Product: ' + product.name);
  };

  if (!product) return <div className="container">Loading...</div>;

  return (
    <>
      <Head>
        <title>{product.name} - TechGadgets Store</title>
        <meta name="description" content={product.description} />
      </Head>
      
      <main className="container product-page">
        <div className="product-layout">
          <div className="product-images">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className="placeholder-image">No image</div>
            )}
          </div>
          
          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="price">${product.price} {product.currency}</p>
            <p className="description">{product.description}</p>
            
            <div className="purchase-section">
              <label>
                Quantity:
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </label>
              <button onClick={handleCheckout} className="btn-primary">
                Add to Cart - ${product.price * quantity}
              </button>
            </div>
          </div>
        </div>
        
        <Reviews productId={product.id} />
      </main>
    </>
  );
}
