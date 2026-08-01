import { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { setPageMeta } from '../seo';
import { getApiUrl } from '../config';

function ImageToPdfPage() {
  useEffect(() => {
    setPageMeta({
      title: 'Image to PDF | PDFRWDEXA',
      description: 'Convert JPG, JPEG and PNG images into a single PDF with layout and page options.',
      canonicalPath: '/image-to-pdf',
    });
  }, []);

  const inputRef = useRef(null);
  const previewUrlsRef = useRef([]);
  const downloadUrlRef = useRef('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('Ready to assemble');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [fitMode, setFitMode] = useState('fit');
  const [preserveAspect, setPreserveAspect] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const acceptedTypes = useMemo(() => ['.jpg', '.jpeg', '.png'], []);

  const revokePreviewUrls = (items = []) => {
    items.forEach((item) => {
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    previewUrlsRef.current = previewUrlsRef.current.filter((previewUrl) => !items.some((item) => item.preview === previewUrl));
  };

  const validateFiles = (selectedFiles) => {
    const list = Array.from(selectedFiles || []);
    if (!list.length) return 'Please choose at least one image.';
    const invalid = list.find((file) => !acceptedTypes.some((type) => file.name.toLowerCase().endsWith(type)));
    if (invalid) return 'Unsupported file type. Please upload JPG, JPEG or PNG images.';
    const oversized = list.find((file) => file.size > 20 * 1024 * 1024);
    if (oversized) return 'One or more files are too large. Maximum size is 20 MB each.';
    return '';
  };

  const handleFiles = (selectedFiles) => {
    const validationError = validateFiles(selectedFiles);
    if (validationError) {
      setError(validationError);
      setIsSuccess(false);
      return;
    }

    const nextImages = Array.from(selectedFiles).map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      return {
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        preview,
      };
    });

    setImages((current) => [...current, ...nextImages]);
    setError('');
    setStatus('Images ready');
    setProgress(0);
    setIsSuccess(false);
  };

  const removeImage = (id) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        revokePreviewUrls([target]);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const clearAllImages = () => {
    if (!images.length) return;
    revokePreviewUrls(images);
    setImages([]);
    setProgress(0);
    setStatus('Ready to assemble');
    setError('');
    setIsSuccess(false);
  };

  const moveImage = (id, direction) => {
    setImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const readImageAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });

  const loadImage = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image appears to be corrupted or unreadable.'));
    image.src = dataUrl;
  });

  const getPdfFormat = () => (pageSize === 'Letter' ? 'letter' : 'a4');

  const getImageType = (file) => {
    if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      return 'PNG';
    }
    return 'JPEG';
  };

  const startConversion = async () => {
    if (!images.length) {
      setError('Add at least one image before converting.');
      return;
    }

    setIsConverting(true);
    setError('');
    setStatus('Preparing PDF locally in your browser');
    setIsSuccess(false);

    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = '';
      setDownloadUrl('');
      setDownloadName('');
    }

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: getPdfFormat(),
      });

      for (let index = 0; index < images.length; index += 1) {
        const imageItem = images[index];
        const dataUrl = await readImageAsDataUrl(imageItem.file);
        const image = await loadImage(dataUrl);

        if (index > 0) {
          pdf.addPage();
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;
        const aspectRatio = image.width / image.height;

        let width = maxWidth;
        let height = maxHeight;

        if (preserveAspect) {
          if (fitMode === 'fit') {
            width = maxWidth;
            height = maxWidth / aspectRatio;
            if (height > maxHeight) {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }
          } else {
            const widthScale = maxWidth / image.width;
            const heightScale = maxHeight / image.height;
            const scale = Math.min(widthScale, heightScale);
            width = image.width * scale;
            height = image.height * scale;
          }
        }

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        pdf.addImage(dataUrl, getImageType(imageItem.file), x, y, width, height, undefined, 'FAST');

        setProgress(Math.round(((index + 1) / images.length) * 100));
      }

      const pdfBlob = pdf.output('blob');
      const objectUrl = URL.createObjectURL(pdfBlob);
      downloadUrlRef.current = objectUrl;
      setDownloadUrl(objectUrl);
      setDownloadName(`pdfrwdexa-${Date.now()}.pdf`);
      setStatus('PDF ready for download');
      setIsSuccess(true);
    } catch (conversionError) {
      setError('We could not create the PDF. Please try again with a different image.');
      setStatus('Conversion failed');
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    revokePreviewUrls(images);
    setImages([]);
    setProgress(0);
    setStatus('Ready to assemble');
    setError('');
    setIsConverting(false);
    setIsSuccess(false);
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = '';
      setDownloadUrl('');
      setDownloadName('');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="tool-page" aria-labelledby="image-to-pdf-title">
      <div className="panel tool-head">
        <div>
          <h1 id="image-to-pdf-title">Image → PDF</h1>
          <p>Combine JPG, JPEG and PNG images into a single PDF with simple page and layout options.</p>
        </div>
        <div className="status-box">{status}</div>
      </div>

      <div className="panel">
        <label className="upload-zone" htmlFor="image-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFiles(event.dataTransfer.files); }}>
          <input id="image-upload" ref={inputRef} className="upload-input" type="file" accept=".jpg,.jpeg,.png" multiple onChange={(event) => handleFiles(event.target.files)} />
          <div className="icon-badge" aria-hidden="true">🖼️</div>
          <strong>Drop your images here</strong>
          <span>Upload one image or many, then reorder before export.</span>
          <button type="button" className="button-primary" onClick={() => inputRef.current?.click()}>Choose files</button>
        </label>
      </div>

      <div className="panel">
        <div className="meta-list">
          <div className="meta-card">
            <strong>Supported formats</strong>
            <div>.jpg, .jpeg, .png</div>
          </div>
          <div className="meta-card">
            <strong>File size limit</strong>
            <div>20 MB each</div>
          </div>
          <div className="meta-card">
            <strong>Options</strong>
            <div>A4 / Letter • portrait / landscape</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="meta-list">
          <div className="meta-card">
            <strong>Page size</strong>
            <select value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </div>
          <div className="meta-card">
            <strong>Orientation</strong>
            <select value={orientation} onChange={(event) => setOrientation(event.target.value)}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="meta-card">
            <strong>Layout</strong>
            <select value={fitMode} onChange={(event) => setFitMode(event.target.value)}>
              <option value="fit">Fit image to page</option>
              <option value="full">Full page</option>
            </select>
          </div>
        </div>
        <label className="preview-caption" style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
          <input type="checkbox" checked={preserveAspect} onChange={() => setPreserveAspect((value) => !value)} />
          Preserve aspect ratio
        </label>
      </div>

      {images.length > 0 && (
        <div className="panel">
          <div className="result-actions" style={{ marginBottom: '0.75rem' }}>
            <button type="button" className="button-secondary" onClick={clearAllImages}>Clear all images</button>
          </div>
          <div className="image-preview">
            {images.map((image) => (
              <div key={image.id}>
                <img src={image.preview} alt={image.file.name} />
                <div className="preview-caption">{image.file.name}</div>
                <div className="result-actions">
                  <button type="button" className="button-ghost" onClick={() => moveImage(image.id, 'up')}>Move up</button>
                  <button type="button" className="button-ghost" onClick={() => moveImage(image.id, 'down')}>Move down</button>
                  <button type="button" className="button-ghost" onClick={() => removeImage(image.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="status-box">
          <strong>Conversion status</strong>
          <div className={`success ${!isSuccess ? 'hidden' : ''}`}>Your PDF is ready to download.</div>
          <div className={`error ${!error ? 'hidden' : ''}`}>{error}</div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="preview-caption">{isConverting ? 'Rendering PDF pages…' : 'Ready to generate PDF.'}</div>
        </div>
        <div className="result-actions">
          <button type="button" className="button-primary" onClick={startConversion} disabled={isConverting}>Convert to PDF</button>
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
        <p className="section-subtitle">Images are processed locally in your browser and are not uploaded to a remote server for this feature.</p>
      </div>
    </section>
  );
}

export default ImageToPdfPage;
