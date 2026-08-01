import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { setPageMeta } from '../seo';

const tools = [
  {
    title: 'Word → PDF',
    description: 'Convert Word documents into high-quality PDF files.',
    path: '/word-to-pdf',
    icon: '📄',
    formats: ['.doc', '.docx'],
    size: 'Up to 25 MB',
  },
  {
    title: 'PDF → Word',
    description: 'Convert PDF files into editable Word documents while preserving structure and layout.',
    path: '/pdf-to-word',
    icon: '📝',
    formats: ['.pdf'],
    size: 'Up to 25 MB',
  },
  {
    title: 'Image → PDF',
    description: 'Combine JPG, JPEG and PNG images into a polished PDF.',
    path: '/image-to-pdf',
    icon: '🖼️',
    formats: ['.jpg', '.jpeg', '.png'],
    size: 'Up to 20 MB each',
  },
];

const faqs = [
  {
    question: 'Do I need to create an account?',
    answer: 'No. PDFRWDEXA is built for instant use without sign-up, login or email collection.',
  },
  {
    question: 'Are my files kept private?',
    answer: 'Yes. Files are processed temporarily and intended for automatic deletion after handling.',
  },
  {
    question: 'Is the conversion fully automated?',
    answer: 'The frontend is ready for a real conversion engine and the experience is designed to support it cleanly.',
  },
];

function HomePage() {
  useEffect(() => {
    setPageMeta({
      title: 'PDFRWDEXA | Fast document conversion',
      description: 'Convert Word, PDF and images quickly and securely without creating an account.',
      canonicalPath: '/',
    });
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-badge">Privacy-first • no account required</div>
          <h1>Convert your files. Keep your workflow simple.</h1>
          <p>Convert Word documents, PDFs and images quickly and securely — without creating an account.</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/word-to-pdf">Start with Word → PDF</Link>
            <a className="button-secondary" href="#tools">Explore all tools</a>
          </div>
          <div className="trust-row" aria-label="Trust indicators">
            <div className="trust-pill">
              <strong>Your files are private.</strong>
              Temporary handling and secure processing.
            </div>
            <div className="trust-pill">
              <strong>No registration required.</strong>
              Open the tool and start converting instantly.
            </div>
            <div className="trust-pill">
              <strong>Modern interface.</strong>
              A premium experience built for clarity and speed.
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <h2 className="section-title">Three focused conversion tools</h2>
          <p className="section-subtitle">Each experience is designed to feel calm, confident and production-ready.</p>
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

      <section className="section" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="section-title">How it works</h2>
        <p className="section-subtitle">A simple flow from upload to download in three short steps.</p>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Select a tool</h3>
            <p>Choose the conversion that matches your document type and workflow.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Upload your file</h3>
            <p>Drop files into the upload area or browse from your device.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Convert and download</h3>
            <p>Watch the progress, review the result and download your output instantly.</p>
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
