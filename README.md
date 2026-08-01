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

### Local frontend
```bash
npm install
npm run dev
```

### Local backend
```bash
node server.js
```

### Local tests
```bash
npm test
python3 -m unittest discover -s tests -v
```

## Local backend vs production backend

- Local backend: runs on your machine or a local container, usually with `http://localhost:3001`.
- Production backend: runs on a public HTTPS service such as Render and must be configured with the real public URL in `VITE_API_URL`.

## Render deployment guide

1. Create a Render account and connect your GitHub account.
2. In Render, create a new Web Service and choose the PDFRWDEXA repository.
3. Select Docker deployment and use the existing Dockerfile.
4. Set the service to listen on port `3001` and expose `/health` as the health check path.
5. Configure environment variables:
   - `PORT=3001`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`
   - `LIBREOFFICE_PATH=libreoffice`
6. Deploy the service.
7. Open the public backend URL and confirm `/health` returns `{"ok":true}`.
8. Copy the public backend HTTPS URL and set it as `VITE_API_URL` in Vercel.
9. Redeploy the frontend so the three conversion tools call the production backend.
10. Set `FRONTEND_URL` in the Render service to the Vercel frontend origin so CORS is allowed for production requests.
11. Test the three tools again from the deployed frontend.

## Production environment variables

Set the following values in the Render service:

```env
PORT=3001
FRONTEND_URL=https://your-vercel-app.vercel.app
LIBREOFFICE_PATH=libreoffice
```

Do not commit secrets or real API tokens.

## Production CORS

The backend uses `FRONTEND_URL` for production CORS checks. For local development, common localhost origins are also allowed. Do not use an unrestricted CORS policy in production.

## Production limits

- Maximum upload size: 25 MB per Word/PDF upload
- Supported files: `.pdf`, `.doc`, `.docx`
- Supported MIME types: PDF and Word document uploads are accepted when the browser provides standard document types or a generic binary type
- Conversion failures return clear HTTP errors without exposing internal stack traces

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

