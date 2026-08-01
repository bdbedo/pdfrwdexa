import { Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WordToPdfPage from './pages/WordToPdfPage';
import PdfToWordPage from './pages/PdfToWordPage';
import ImageToPdfPage from './pages/ImageToPdfPage';

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="PDFRWDEXA home">
          <span className="brand-mark">P</span>
          <span className="brand-name">PDFRWDEXA</span>
        </NavLink>
        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/word-to-pdf">Word → PDF</NavLink>
          <NavLink to="/pdf-to-word">PDF → Word</NavLink>
          <NavLink to="/image-to-pdf">Image → PDF</NavLink>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2026 PDFRWDEXA. Fast, reliable and privacy-focused conversion.</p>
      </footer>
    </div>
  );
}

export default App;
