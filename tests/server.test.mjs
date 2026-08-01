import test from 'node:test';
import assert from 'node:assert/strict';
import { isSupportedUpload } from '../server.js';

test('accepts common MIME values for PDF uploads', () => {
  assert.equal(
    isSupportedUpload({ originalname: 'sample.pdf', mimetype: 'application/pdf' }),
    true,
  );
  assert.equal(
    isSupportedUpload({ originalname: 'sample.pdf', mimetype: 'application/octet-stream' }),
    true,
  );
});

test('accepts Word uploads even when MIME detection is imperfect', () => {
  assert.equal(
    isSupportedUpload({ originalname: 'sample.docx', mimetype: 'application/zip' }),
    true,
  );
  assert.equal(
    isSupportedUpload({ originalname: 'sample.doc', mimetype: '' }),
    true,
  );
});
