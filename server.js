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

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const originalName = file.originalname || '';
    const extension = path.extname(originalName).toLowerCase();
    const mimeType = file.mimetype || '';

    if (extension === '.pdf' && mimeType === 'application/pdf') {
      callback(null, true);
      return;
    }

    if ((extension === '.doc' || extension === '.docx') && (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
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
    cleanupPaths(workingDir, outputDir);
    res.status(500).json({ error: 'We could not convert this document. Please try another file.' });
  }
});

app.post('/api/convert/pdf-to-docx', upload.single('file'), async (req, res) => {
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
    cleanupPaths(workingDir, outputDir);
    res.status(500).json({ error: 'We could not convert this PDF to a DOCX file. Please try another document.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`PDFRWDEXA conversion server listening on port ${port}`);
});
