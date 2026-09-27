// Receives guest photo/video uploads from the invitation page and saves them
// into the wedding Google Drive folder. Deploy as a Web app:
//   Execute as: Me   ·   Who has access: Anyone
// Setup steps: see apps-script/README.md

const FOLDER_ID = '1gAGDaklg7FGpjyBLppP79hRULVCKPLmm';
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB per file
const UPLOAD_ENDPOINT = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true';

function doGet() {
  return json({ ok: true, message: 'Upload service is running' });
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.action === 'init') return json(init(p));
    if (p.action === 'chunk') return json(chunk(p));
    throw new Error('Unknown action');
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

// Starts a resumable upload session in the wedding folder and returns its URL.
function init(p) {
  if (!/^(image|video)\//.test(p.mimeType || '')) throw new Error('Only photos and videos can be uploaded');
  if (!(p.size > 0 && p.size <= MAX_BYTES)) throw new Error('File is empty or larger than 2 GB');
  DriveApp.getFolderById(FOLDER_ID); // fails early if the folder isn't accessible (also grants the Drive scope)

  const stamp = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyy-MM-dd HH-mm-ss');
  const name = stamp + ' - ' + String(p.name || 'upload').slice(0, 150);
  const res = UrlFetchApp.fetch(UPLOAD_ENDPOINT, {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': p.mimeType,
      'X-Upload-Content-Length': String(p.size)
    },
    payload: JSON.stringify({ name: name, parents: [FOLDER_ID] }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Error('Could not start upload (' + res.getResponseCode() + ')');
  const h = res.getHeaders();
  return { ok: true, url: h.Location || h.location };
}

// Sends one chunk of the file to the upload session. The session URL itself
// authorizes the upload, so no token is attached here.
function chunk(p) {
  if (!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(p.url || '')) throw new Error('Bad upload URL');
  const bytes = Utilities.base64Decode(p.data);
  if (bytes.length !== p.end - p.start) throw new Error('Chunk size mismatch');
  const res = UrlFetchApp.fetch(p.url, {
    method: 'put',
    contentType: 'application/octet-stream',
    headers: { 'Content-Range': 'bytes ' + p.start + '-' + (p.end - 1) + '/' + p.size },
    payload: bytes,
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code === 200 || code === 201) return { ok: true, done: true };
  if (code === 308) return { ok: true, done: false };
  throw new Error('Upload failed (' + code + ')');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
