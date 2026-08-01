# PDFRWDEXA

PDFRWDEXA is a privacy-focused conversion platform for Word, PDF and image files. The project currently uses a Vite + React frontend and a Node.js/Express conversion backend with Python-based PDF-to-DOCX processing and LibreOffice-based Word-to-PDF conversion.

## Architecture

### Recommended production architecture
- Frontend: Vercel
- Conversion backend: a dedicated Node.js + Python + LibreOffice service (containerized or hosted on a VPS/container platform)

This split is recommended because the current conversion stack depends on:
- Node.js for the Express API
- Python for PDF-to-DOCX processing
- LibreOffice for Word-to-PDF conversion
- writable temporary storage for uploads and output files

A plain Vercel-only deployment is not reliable for the current conversion backend because LibreOffice and Python-based processing are not suitable for a serverless-only setup in this project.

## Local development

### Frontend
```bash
npm install
npm run dev
```

### Conversion backend
```bash
node server.js
```

### Python tests
```bash
python3 -m unittest discover -s tests -v
```

## Environment variables

Create a local `.env` file based on `.env.example`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
LIBREOFFICE_PATH=libreoffice
```

## API endpoints
- `POST /api/convert/word-to-pdf`
- `POST /api/convert/pdf-to-docx`
- `GET /health`

## File limits
- Word/PDF upload limit: 25 MB
- Image upload limit: 20 MB per file

## Privacy and cleanup
- Uploaded files are processed in temporary directories.
- Temporary files are cleaned up after successful or failed conversion.
- The service does not store documents permanently.

## Known limitations
- Complex multi-column layouts, intricate tables and scanned PDFs remain limited without OCR or more specialized layout extraction.
- The PDF-to-DOCX pipeline is layout-aware but not a perfect visual clone of the source PDF.

## Deployment notes
- The frontend should be deployed to Vercel.
- The conversion backend should be deployed to a container-capable platform (for example, Fly.io, Railway, Render, or a VPS).
- Set `VITE_API_URL` to the production backend URL.
- Set `FRONTEND_URL` to the production frontend origin.

