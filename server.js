import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.post('/api/convert/word-to-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a Word document.' });
  }

  const inputPath = req.file.path;
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfrwdexa-'));
  const sourceName = path.basename(req.file.originalname, path.extname(req.file.originalname));

  const libreOfficeBinary = process.env.LIBREOFFICE_PATH || 'libreoffice';
  const commandArgs = [
    '--headless',
    '--convert-to',
    'pdf',
    '--outdir',
    outputDir,
    inputPath,
  ];

  execFile(libreOfficeBinary, commandArgs, (error, stdout, stderr) => {
    if (error) {
      console.error('LibreOffice conversion failed', { error: error.message, stdout, stderr });
      fs.rmSync(outputDir, { recursive: true, force: true });
      return res.status(500).json({ error: 'We could not convert this document. Please try another file.' });
    }

    console.log('LibreOffice conversion output', { stdout, stderr });

    const generatedPdfPath = fs
      .readdirSync(outputDir)
      .map((entry) => path.join(outputDir, entry))
      .find((candidate) => candidate.toLowerCase().endsWith('.pdf'));

    if (!generatedPdfPath) {
      fs.rmSync(outputDir, { recursive: true, force: true });
      return res.status(500).json({ error: 'The PDF could not be created.' });
    }

    res.download(generatedPdfPath, 'converted.pdf', () => {
      fs.rmSync(outputDir, { recursive: true, force: true });
      fs.rmSync(inputPath, { force: true });
    });
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`PDFRWDEXA conversion server listening on port ${port}`);
});
