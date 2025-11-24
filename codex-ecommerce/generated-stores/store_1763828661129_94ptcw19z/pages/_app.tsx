import '../styles/globals.css';
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
