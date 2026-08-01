import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile as execFilePromise } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFilePromise);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://pdfrwdexa.vercel.app',
];

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const host = parsedOrigin.host.toLowerCase();
    return allowedOrigins.includes(origin)
      || host === 'vercel.app'
      || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    console.warn('[cors] blocked origin', { origin });
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

const isSupportedUpload = (file) => {
  const originalName = file.originalname || '';
  const extension = path.extname(originalName).toLowerCase();
  const mimeType = file.mimetype || '';

  if (extension === '.pdf') {
    return mimeType === '' || mimeType === 'application/pdf' || mimeType === 'application/octet-stream';
  }

  if (extension === '.doc' || extension === '.docx') {
    return mimeType === ''
      || mimeType === 'application/msword'
      || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || mimeType === 'application/octet-stream'
      || mimeType === 'application/zip';
  }

  return false;
};

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (isSupportedUpload(file)) {
      callback(null, true);
      return;
    }

    callback(new Error('Unsupported file type.'));
  },
});

const sanitizeFilename = (originalName) => {
  const baseName = path.basename(originalName || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
  const safeBaseName = baseName || 'upload';
  const extension = path.extname(safeBaseName).toLowerCase();
  const nameWithoutExtension = path.basename(safeBaseName, extension) || 'upload';
  return `${Date.now()}-${nameWithoutExtension}${extension}`;
};

const cleanupPaths = (...paths) => {
  paths.forEach((entryPath) => {
    if (!entryPath) {
      return;
    }
    fs.rmSync(entryPath, { recursive: true, force: true });
  });
};

app.post('/api/convert/word-to-pdf', upload.single('file'), async (req, res) => {
  console.log('[convert] word-to-pdf request', {
    origin: req.get('origin'),
    contentType: req.get('content-type'),
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
  });

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a Word document.' });
  }

  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfrwdexa-word-'));
  const inputPath = path.join(workingDir, sanitizeFilename(req.file.originalname));
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfrwdexa-word-out-'));

  try {
    fs.renameSync(req.file.path, inputPath);

    const libreOfficeBinary = process.env.LIBREOFFICE_PATH || 'libreoffice';
    await execFileAsync(libreOfficeBinary, ['--version']);

    const commandArgs = [
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      outputDir,
      inputPath,
    ];

    await execFileAsync(libreOfficeBinary, commandArgs);

    const generatedPdfPath = fs
      .readdirSync(outputDir)
      .map((entry) => path.join(outputDir, entry))
      .find((candidate) => candidate.toLowerCase().endsWith('.pdf'));

    if (!generatedPdfPath) {
      throw new Error('The PDF could not be created.');
    }

    res.on('finish', () => cleanupPaths(workingDir, outputDir));
    res.on('close', () => cleanupPaths(workingDir, outputDir));
    res.download(generatedPdfPath, 'converted.pdf');
  } catch (conversionError) {
    console.error('[convert] word-to-pdf failed', {
      error: conversionError?.message,
      stack: conversionError?.stack,
    });
    cleanupPaths(workingDir, outputDir);
    res.status(500).json({ error: 'We could not convert this document. Please try another file.' });
  }
});

app.post('/api/convert/pdf-to-docx', upload.single('file'), async (req, res) => {
  console.log('[convert] pdf-to-docx request', {
    origin: req.get('origin'),
    contentType: req.get('content-type'),
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
  });

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF document.' });
  }

  const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfrwdexa-pdf-'));
  const inputPath = path.join(workingDir, sanitizeFilename(req.file.originalname));
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfrwdexa-pdf-out-'));
  const outputPath = path.join(outputDir, 'converted.docx');
  const scriptPath = path.join(__dirname, 'scripts', 'convert_pdf_to_docx.py');

  try {
    fs.renameSync(req.file.path, inputPath);
    await execFileAsync('python3', [scriptPath, inputPath, outputPath]);

    res.on('finish', () => cleanupPaths(workingDir, outputDir));
    res.on('close', () => cleanupPaths(workingDir, outputDir));
    res.download(outputPath, 'converted.docx');
  } catch (conversionError) {
    console.error('[convert] pdf-to-docx failed', {
      error: conversionError?.message,
      stack: conversionError?.stack,
    });
    cleanupPaths(workingDir, outputDir);
    res.status(500).json({ error: 'We could not convert this PDF to a DOCX file. Please try another document.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'The uploaded file is too large. Maximum size is 25 MB.' });
      return;
    }

    res.status(400).json({ error: 'The upload failed. Please try again with a valid file.' });
    return;
  }

  if (error && error.message === 'Unsupported file type.') {
    res.status(400).json({ error: 'Unsupported file type. Please upload a .pdf, .doc, or .docx file.' });
    return;
  }

  if (error) {
    res.status(500).json({ error: 'We could not process your request. Please try again.' });
    return;
  }

  next();
});

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(port, () => {
    console.log(`PDFRWDEXA conversion server listening on port ${port}`);
  });
}

export { app, isOriginAllowed, isSupportedUpload };
