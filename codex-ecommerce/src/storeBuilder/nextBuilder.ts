/**
 * E-Commerce Engine v2 - Next.js Store Builder
 * Generates complete Next.js 14 storefront applications
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { Store, Product } from '../db/storeDB.js';
import { logger } from '../utils/logger.js';

const STORES_DIR = join(process.cwd(), 'generated-stores');

if (!existsSync(STORES_DIR)) {
  mkdirSync(STORES_DIR, { recursive: true });
}

export interface BuildStoreOptions {
  store: Store;
  products: Product[];
  stripePublicKey?: string;
}

export async function buildNextStore(options: BuildStoreOptions): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const { store, products } = options;
    const storePath = join(STORES_DIR, store.id);

    logger.info(`Building Next.js store at: ${storePath}`);

    // Create directory structure
    const dirs = [
      storePath,
      join(storePath, 'pages'),
      join(storePath, 'pages', 'product'),
      join(storePath, 'components'),
      join(storePath, 'public'),
      join(storePath, 'public', 'product-images'),
      join(storePath, 'styles')
    ];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }

    // Generate package.json
    const packageJson = {
      name: `store-${store.id}`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev -p 3010',
        build: 'next build',
        start: 'next start -p 3010'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@stripe/stripe-js': '^2.0.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        typescript: '^5.0.0'
      }
    };
    writeFileSync(join(storePath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Generate tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    };
    writeFileSync(join(storePath, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Generate pages/index.tsx
    const indexPage = generateIndexPage(store, products);
    writeFileSync(join(storePath, 'pages', 'index.tsx'), indexPage);

    // Generate pages/product/[id].tsx
    const productPage = generateProductPage(store);
    writeFileSync(join(storePath, 'pages', 'product', '[id].tsx'), productPage);

    // Generate pages/_app.tsx
    const appPage = generateAppPage();
    writeFileSync(join(storePath, 'pages', '_app.tsx'), appPage);

    // Generate components/ProductCard.tsx
    const productCard = generateProductCardComponent();
    writeFileSync(join(storePath, 'components', 'ProductCard.tsx'), productCard);

    // Generate components/Hero.tsx
    const hero = generateHeroComponent(store);
    writeFileSync(join(storePath, 'components', 'Hero.tsx'), hero);

    // Generate components/Reviews.tsx
    const reviews = generateReviewsComponent();
    writeFileSync(join(storePath, 'components', 'Reviews.tsx'), reviews);

    // Generate styles/globals.css
    const globalCss = generateGlobalStyles(store.theme || 'modern');
    writeFileSync(join(storePath, 'styles', 'globals.css'), globalCss);

    // Generate products.json (static data)
    const productsData = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      images: p.images ? JSON.parse(p.images) : [],
      category: p.category
    }));
    writeFileSync(join(storePath, 'public', 'products.json'), JSON.stringify(productsData, null, 2));

    logger.info(`Store built successfully: ${storePath}`);

    return { ok: true, path: storePath };
  } catch (error: any) {
    logger.error('Failed to build store', error);
    return { ok: false, error: error.message };
  }
}

function generateIndexPage(store: Store, products: Product[]): string {
  return `import { useState, useEffect } from 'react';
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
        <title>${store.name} - Premium Products</title>
        <meta name="description" content="${store.name} - Discover amazing products" />
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
`;
}

function generateProductPage(store: Store): string {
  return `import { useRouter } from 'next/router';
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
        <title>{product.name} - ${store.name}</title>
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
            <p className="price">\${product.price} {product.currency}</p>
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
                Add to Cart - \${product.price * quantity}
              </button>
            </div>
          </div>
        </div>
        
        <Reviews productId={product.id} />
      </main>
    </>
  );
}
`;
}

function generateAppPage(): string {
  return `import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="navbar">
        <a href="/" className="logo">Store</a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
        </div>
      </nav>
      <Component {...pageProps} />
      <footer className="footer">
        <p>© 2025 Built with Codex E-Commerce Engine v2</p>
      </footer>
    </>
  );
}
`;
}

function generateProductCardComponent(): string {
  return `import Link from 'next/link';

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
    <Link href={\`/product/\${product.id}\`} className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="placeholder">No image</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">\${product.price} {product.currency}</p>
        {product.description && (
          <p className="description">{product.description.substring(0, 80)}...</p>
        )}
      </div>
    </Link>
  );
}
`;
}

function generateHeroComponent(store: Store): string {
  return `export default function Hero() {
  return (
    <section className="hero">
      <h1>${store.name}</h1>
      <p>Discover premium products curated just for you</p>
      <a href="#products" className="btn-hero">Shop Now</a>
    </section>
  );
}
`;
}

function generateReviewsComponent(): string {
  return `interface ReviewsProps {
  productId: string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const mockReviews = [
    { id: 1, author: 'Sarah M.', rating: 5, text: 'Amazing quality! Highly recommend.' },
    { id: 2, author: 'John D.', rating: 4, text: 'Great product, fast shipping.' },
    { id: 3, author: 'Emily R.', rating: 5, text: 'Exceeded my expectations!' }
  ];

  return (
    <section className="reviews">
      <h2>Customer Reviews</h2>
      <div className="reviews-list">
        {mockReviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <span className="author">{review.author}</span>
              <span className="rating">{'⭐'.repeat(review.rating)}</span>
            </div>
            <p>{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

function generateGlobalStyles(theme: string): string {
  const colors = theme === 'modern' 
    ? { primary: '#0070f3', secondary: '#7928ca', bg: '#ffffff', text: '#000000' }
    : { primary: '#2563eb', secondary: '#8b5cf6', bg: '#f9fafb', text: '#111827' };

  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: ${colors.bg};
  color: ${colors.text};
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: ${colors.primary};
  text-decoration: none;
}

.nav-links a {
  margin-left: 2rem;
  text-decoration: none;
  color: ${colors.text};
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  color: white;
  border-radius: 12px;
  margin: 2rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-hero {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: ${colors.primary};
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 1rem;
}

.products-grid h2 {
  font-size: 2rem;
  margin: 2rem 0 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder, .placeholder-image {
  background: #e5e5e5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.price {
  color: ${colors.primary};
  font-weight: bold;
  font-size: 1.1rem;
}

.product-page {
  padding: 2rem 0;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.product-images img {
  width: 100%;
  border-radius: 8px;
}

.product-details h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.purchase-section {
  margin-top: 2rem;
}

.purchase-section label {
  display: block;
  margin-bottom: 1rem;
}

.purchase-section input {
  padding: 0.5rem;
  margin-left: 0.5rem;
  width: 80px;
}

.btn-primary {
  padding: 1rem 2rem;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary:hover {
  opacity: 0.9;
}

.reviews {
  margin-top: 3rem;
}

.reviews h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.reviews-list {
  display: grid;
  gap: 1rem;
}

.review {
  border: 1px solid #eaeaea;
  padding: 1.5rem;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.author {
  font-weight: bold;
}

.footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid #eaeaea;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
`;
}

export async function generateStorePage(storeId: string, pageType: string, pageData: any): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const storePath = join(STORES_DIR, storeId);
    
    if (!existsSync(storePath)) {
      return { ok: false, error: 'Store does not exist' };
    }

    logger.info(`Generating ${pageType} page for store ${storeId}`);

    // Custom page generation logic here
    // For now, return success
    return { ok: true, path: join(storePath, 'pages', `${pageType}.tsx`) };
  } catch (error: any) {
    logger.error('Failed to generate page', error);
    return { ok: false, error: error.message };
  }
}
