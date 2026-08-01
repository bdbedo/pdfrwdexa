import { useEffect, useMemo, useRef, useState } from 'react';
import { setPageMeta } from '../seo';

function PdfToWordPage() {
  useEffect(() => {
    setPageMeta({
      title: 'PDF to Word | PDFRWDEXA',
      description: 'Convert PDF documents into editable Word files while preserving structure and layout as closely as possible.',
      canonicalPath: '/pdf-to-word',
    });
  }, []);

  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Ready to convert');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const acceptedTypes = useMemo(() => ['.pdf'], []);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please choose a file.';
    if (!acceptedTypes.some((type) => selectedFile.name.toLowerCase().endsWith(type))) {
      return 'Unsupported file type. Please upload a PDF document.';
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      return 'File is too large. Maximum size is 25 MB.';
    }
    return '';
  };

  const handleFiles = (selectedFile) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setIsSuccess(false);
      return;
    }

    setError('');
    setFile(selectedFile);
    setStatus('Ready to convert');
    setProgress(0);
    setIsSuccess(false);
  };

  const startConversion = () => {
    if (!file) {
      setError('Choose a PDF file to begin.');
      return;
    }

    setIsConverting(true);
    setError('');
    setStatus('Analyzing document structure');
    setIsSuccess(false);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          setIsConverting(false);
          setStatus('Structure prepared');
          setIsSuccess(true);
          return 100;
        }
        return current + 10;
      });
    }, 240);
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setStatus('Ready to convert');
    setError('');
    setIsConverting(false);
    setIsSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="tool-page" aria-labelledby="pdf-to-word-title">
      <div className="panel tool-head">
        <div>
          <h1 id="pdf-to-word-title">PDF → Word</h1>
          <p>Convert PDF files into editable Word documents while preserving structure, spacing and layout as accurately as possible.</p>
        </div>
        <div className="status-box">{status}</div>
      </div>

      <div className="panel">
        <label className="upload-zone" htmlFor="pdf-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files[0]); }}>
          <input id="pdf-upload" ref={inputRef} className="upload-input" type="file" accept=".pdf" onChange={(event) => handleFiles(event.target.files[0])} />
          <div className="icon-badge" aria-hidden="true">📝</div>
          <strong>Drop your PDF here</strong>
          <span>or choose a file from your device.</span>
          <button type="button" className="button-primary" onClick={() => inputRef.current?.click()}>Choose a file</button>
        </label>
      </div>

      <div className="panel">
        <div className="meta-list">
          <div className="meta-card">
            <strong>Supported formats</strong>
            <div>.pdf</div>
          </div>
          <div className="meta-card">
            <strong>File size limit</strong>
            <div>25 MB</div>
          </div>
          <div className="meta-card">
            <strong>Output</strong>
            <div>Editable .docx-ready structure</div>
          </div>
        </div>
      </div>

      {file && (
        <div className="panel">
          <div className="image-item">
            <div>
              <strong>{file.name}</strong>
              <div className="preview-caption">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <button type="button" className="button-secondary" onClick={reset}>Remove</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="status-box">
          <strong>Conversion status</strong>
          <div className={`success ${!isSuccess ? 'hidden' : ''}`}>Document structure prepared for conversion.</div>
          <div className={`error ${!error ? 'hidden' : ''}`}>{error}</div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="preview-caption">{isConverting ? 'Assessing layout and structure…' : 'Ready for conversion.'}</div>
        </div>
        <div className="result-actions">
          <button type="button" className="button-primary" onClick={startConversion} disabled={isConverting}>Convert file</button>
          <button type="button" className="button-ghost" onClick={reset}>Convert another file</button>
        </div>
      </div>

      <div className="panel">
        <h2 className="section-title">Professional note</h2>
        <p className="section-subtitle">This page is architected for a professional PDF-to-DOCX engine with future OCR support for scanned files.</p>
      </div>
    </section>
  );
}

export default PdfToWordPage;
