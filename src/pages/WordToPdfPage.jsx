import { useEffect, useMemo, useRef, useState } from 'react';
import { setPageMeta } from '../seo';
import { getApiUrl } from '../config';

function WordToPdfPage() {
  useEffect(() => {
    setPageMeta({
      title: 'Word to PDF | PDFRWDEXA',
      description: 'Convert Word documents to polished PDFs quickly, privately and without sign-up.',
      canonicalPath: '/word-to-pdf',
    });
  }, []);

  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Ready to convert');
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  const acceptedTypes = useMemo(() => ['.doc', '.docx'], []);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please choose a file.';
    if (!acceptedTypes.some((type) => selectedFile.name.toLowerCase().endsWith(type))) {
      return 'Unsupported file type. Please upload a Word document.';
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
    setIsSuccess(false);
    setStatus('Ready to convert');
    setProgress(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }
  };

  const startConversion = async () => {
    if (!file) {
      setError('Choose a Word document to begin.');
      return;
    }

    setIsConverting(true);
    setError('');
    setStatus('Uploading and converting locally on the server');
    setIsSuccess(false);
    setProgress(10);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('[frontend] word-to-pdf request', {
      endpoint: '/api/convert/word-to-pdf',
      apiUrl: getApiUrl('/api/convert/word-to-pdf'),
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      const response = await fetch(getApiUrl('/api/convert/word-to-pdf'), {
        method: 'POST',
        body: formData,
      });

      console.log('[frontend] word-to-pdf response', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        let message = 'We could not convert this document right now.';
        try {
          const data = await response.json();
          if (data?.error) {
            message = data.error;
          }
        } catch (parseError) {
          message = 'We could not convert this document right now.';
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setDownloadUrl(objectUrl);
      setDownloadName(`pdfwrdexa-${Date.now()}.pdf`);
      setProgress(100);
      setStatus('PDF ready for download');
      setIsSuccess(true);
    } catch (conversionError) {
      console.error('[frontend] word-to-pdf failed', conversionError);
      setError(conversionError.message || 'We could not complete the conversion.');
      setStatus('Conversion failed');
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setFile(null);
    setProgress(0);
    setStatus('Ready to convert');
    setError('');
    setIsConverting(false);
    setIsSuccess(false);
    setDownloadUrl('');
    setDownloadName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="tool-page" aria-labelledby="word-to-pdf-title">
      <div className="panel tool-head">
        <div>
          <h1 id="word-to-pdf-title">Word → PDF</h1>
          <p>Convert Word documents into high-quality PDF files with a clean, focused experience.</p>
        </div>
        <div className="status-box">{status}</div>
      </div>

      <div className="panel">
        <label className="upload-zone" htmlFor="word-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files[0]); }}>
          <input id="word-upload" ref={inputRef} className="upload-input" type="file" accept=".doc,.docx" onChange={(event) => handleFiles(event.target.files[0])} />
          <div className="icon-badge" aria-hidden="true">📄</div>
          <strong>Drop your Word document here</strong>
          <span>or choose a file from your device.</span>
          <button type="button" className="button-primary" onClick={() => inputRef.current?.click()}>Choose a file</button>
        </label>
      </div>

      <div className="panel">
        <div className="meta-list">
          <div className="meta-card">
            <strong>Supported formats</strong>
            <div>.doc, .docx</div>
          </div>
          <div className="meta-card">
            <strong>File size limit</strong>
            <div>25 MB</div>
          </div>
          <div className="meta-card">
            <strong>Privacy</strong>
            <div>Temporary processing</div>
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
          <div className={`success ${!isSuccess ? 'hidden' : ''}`}>Your PDF has been generated successfully.</div>
          <div className={`error ${!error ? 'hidden' : ''}`}>{error}</div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="preview-caption">{isConverting ? 'Converting your Word document…' : 'Ready for conversion.'}</div>
        </div>
        <div className="result-actions">
          <button type="button" className="button-primary" onClick={startConversion} disabled={isConverting}>Convert file</button>
          {downloadUrl && (
            <a className="button-secondary" href={downloadUrl} download={downloadName}>
              Download PDF
            </a>
          )}
          <button type="button" className="button-ghost" onClick={reset}>Convert another file</button>
        </div>
      </div>

      <div className="panel">
        <h2 className="section-title">Privacy note</h2>
        <p className="section-subtitle">Word documents are sent to a local conversion service in this environment and are not stored permanently.</p>
      </div>
    </section>
  );
}

export default WordToPdfPage;
