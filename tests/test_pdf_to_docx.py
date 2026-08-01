import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
import zipfile

import fitz
import pypdf

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts' / 'convert_pdf_to_docx.py'


class PdfToDocxConversionTests(unittest.TestCase):
    def create_pdf(self, path: Path, text_blocks: list[str], *, encrypted: bool = False) -> None:
        doc = fitz.open()
        page = doc.new_page()
        y = 72
        for text in text_blocks:
            page.insert_text((72, y), text)
            y += 72
        if encrypted:
            doc.save(path, encryption=fitz.PDF_ENCRYPT_AES_128, owner_pw='secret', user_pw='secret')
        else:
            doc.save(path)
        doc.close()

    def run_conversion(self, source_path: Path, output_path: Path) -> None:
        subprocess.run([sys.executable, str(SCRIPT), str(source_path), str(output_path)], check=True, cwd=ROOT)

    def test_selectable_text_pdf_creates_docx(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            source = tmp / 'sample.pdf'
            output = tmp / 'sample.docx'
            self.create_pdf(source, ['Title', 'Introduction paragraph', 'Second paragraph'])
            self.run_conversion(source, output)
            self.assertTrue(output.exists())
            self.assertGreater(output.stat().st_size, 0)
            with zipfile.ZipFile(output) as archive:
                xml = archive.read('word/document.xml').decode('utf-8')
                self.assertIn('Title', xml)
                self.assertIn('Introduction paragraph', xml)

    def test_scanned_pdf_raises_clear_error(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            source = tmp / 'scanned.pdf'
            output = tmp / 'scanned.docx'
            doc = fitz.open()
            page = doc.new_page()
            page.insert_image(page.rect, stream=fitz.Pixmap(fitz.csRGB, fitz.Rect(0, 0, 200, 200)).tobytes(),
                             alpha=0, xref=0)
            doc.save(source)
            doc.close()
            result = subprocess.run([sys.executable, str(SCRIPT), str(source), str(output)], capture_output=True, text=True, cwd=ROOT)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('scanned', result.stderr.lower())

    def test_password_protected_pdf_raises_clear_error(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            source = tmp / 'encrypted.pdf'
            output = tmp / 'encrypted.docx'
            writer = pypdf.PdfWriter()
            page = pypdf.PageObject.create_blank_page(width=200, height=200)
            writer.add_page(page)
            writer.encrypt(user_password='secret', owner_password='secret')
            with source.open('wb') as handle:
                writer.write(handle)
            result = subprocess.run([sys.executable, str(SCRIPT), str(source), str(output)], capture_output=True, text=True, cwd=ROOT)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('password', result.stderr.lower())


if __name__ == '__main__':
    unittest.main()
