import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images?: string[];
    description?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price} {product.currency}</p>
        {product.description && (
          <p className="description">{product.description.substring(0, 80)}...</p>
        )}
      </div>
    </Link>
  );
}
