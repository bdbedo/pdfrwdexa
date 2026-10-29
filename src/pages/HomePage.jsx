import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { setPageMeta } from '../seo';

const tools = [
  {
    title: 'Word → PDF',
    description: 'Convert Word documents into clean PDF files in a few clicks.',
    path: '/word-to-pdf',
    icon: '📄',
    formats: ['.doc', '.docx'],
    size: 'Up to 25 MB',
  },
  {
    title: 'PDF → Word',
    description: 'Turn PDF files into editable Word documents while preserving the structure as closely as possible.',
    path: '/pdf-to-word',
    icon: '📝',
    formats: ['.pdf'],
    size: 'Up to 25 MB',
  },
  {
    title: 'Image → PDF',
    description: 'Combine JPG, JPEG and PNG files into a single PDF file in seconds.',
    path: '/image-to-pdf',
    icon: '🖼️',
    formats: ['.jpg', '.jpeg', '.png'],
    size: 'Up to 20 MB each',
  },
];

const faqs = [
  {
    question: 'Do I need to create an account?',
    answer: 'No. PDFRWDEXA is built for immediate use without sign-up, login or email collection.',
  },
  {
    question: 'Is my file privacy protected?',
    answer: 'The tool is designed for private, temporary handling. Files are processed for the conversion task and are not intended to be stored permanently.',
  },
  {
    question: 'What file types are supported?',
    answer: 'The main tools support DOC/DOCX uploads, PDF uploads, and JPG/JPEG/PNG image groups for PDF conversion.',
  },
];

function HomePage() {
  useEffect(() => {
    setPageMeta({
      title: 'PDFRWDEXA | Free PDF Converter Online',
      description: 'Convert Word to PDF, PDF to Word, and JPG/PNG to PDF online for free. Simple, fast, and no sign-up required.',
      canonicalPath: '/',
    });
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-badge">Simple • free • no account required</div>
          <h1>Convert your files without friction.</h1>
          <p>PDFRWDEXA makes it easy to turn Word files into PDF, export PDF documents to Word, and combine images into one document in just a few steps.</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/word-to-pdf">Start with Word → PDF</Link>
            <a className="button-secondary" href="#tools">Explore all tools</a>
          </div>
          <div className="trust-row" aria-label="Trust indicators">
            <div className="trust-pill">
              <strong>Fast conversion.</strong>
              Designed for quick uploads and straightforward downloads.
            </div>
            <div className="trust-pill">
              <strong>No registration.</strong>
              Start converting immediately without creating an account.
            </div>
            <div className="trust-pill">
              <strong>Privacy-focused.</strong>
              Built to keep the conversion workflow simple and temporary.
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <h2 className="section-title">Choose your conversion tool</h2>
          <p className="section-subtitle">Use the right converter for your file type and task.</p>
          <div className="card-grid" id="tools">
            {tools.map((tool) => (
              <article className="tool-card" key={tool.title}>
                <div className="icon-badge" aria-hidden="true">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <ul>
                  <li>Supported: {tool.formats.join(', ')}</li>
                  <li>Max size: {tool.size}</li>
                </ul>
                <Link className="button-ghost" to={tool.path}>Open tool</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-use-pdfrwdexa">
        <h2 id="why-use-pdfrwdexa" className="section-title">Why people use PDFRWDEXA</h2>
        <p className="section-subtitle">Built for quick, practical document workflows without extra setup.</p>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Pick your tool</h3>
            <p>Choose the document conversion that matches your file type and task.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Upload your file</h3>
            <p>Drop files from your computer or browse locally to start instantly.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Download the result</h3>
            <p>Review the conversion status and save the final file without a complicated process.</p>
          </div>
        </div>
      </section>

      <section className="section" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-title">Frequently asked questions</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <div className="faq-item" key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
