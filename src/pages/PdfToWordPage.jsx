import { useEffect, useMemo, useRef, useState } from 'react';
import { setPageMeta } from '../seo';
import { getApiUrl } from '../config';
import { triggerHilltopAdsPopunder } from '../hilltopads';

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
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

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
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }
  };

  const handleDownloadClick = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!downloadUrl) {
      return;
    }

    await triggerHilltopAdsPopunder();

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startConversion = async () => {
    if (!file) {
      setError('Choose a PDF file to begin.');
      return;
    }

    setIsConverting(true);
    setError('');
    setStatus('Analyzing document structure');
    setIsSuccess(false);
    setProgress(10);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
      setDownloadName('');
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('[frontend] pdf-to-docx request', {
      endpoint: '/api/convert/pdf-to-docx',
      apiUrl: getApiUrl('/api/convert/pdf-to-docx'),
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      const response = await fetch(getApiUrl('/api/convert/pdf-to-docx'), {
        method: 'POST',
        body: formData,
      });

      console.log('[frontend] pdf-to-docx response', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'We could not convert this PDF right now.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setDownloadUrl(objectUrl);
      setDownloadName(`pdfrwdexa-${Date.now()}.docx`);
      setProgress(100);
      setStatus('DOCX ready for download');
      setIsSuccess(true);
    } catch (conversionError) {
      console.error('[frontend] pdf-to-docx failed', conversionError);
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
          <div className={`success ${!isSuccess ? 'hidden' : ''}`}>A structured DOCX has been generated successfully.</div>
          <div className={`error ${!error ? 'hidden' : ''}`}>{error}</div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="preview-caption">{isConverting ? 'Analyzing the PDF structure…' : 'Ready for conversion.'}</div>
        </div>
        <div className="result-actions">
          <button type="button" className="button-primary" onClick={startConversion} disabled={isConverting}>Convert file</button>
          {downloadUrl && (
            <a className="button-secondary" href={downloadUrl} download={downloadName} onClick={handleDownloadClick}>
              Download DOCX
            </a>
          )}
          <button type="button" className="button-ghost" onClick={reset}>Convert another file</button>
        </div>
      </div>

      <div className="panel">
        <h2 className="section-title">Privacy note</h2>
        <p className="section-subtitle">PDFs are processed locally in the conversion service and are not stored permanently.</p>
      </div>
    </section>
  );
}

export default PdfToWordPage;
