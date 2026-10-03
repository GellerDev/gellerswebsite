/**
 * RSVP endpoint: stores guest answers in a Google Sheet.
 *
 * SETUP (once):
 *  1. Create a Google Sheet and open Extensions → Apps Script.
 *  2. Replace the editor contents with this file and save.
 *  3. Deploy → New deployment
 *       - Type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Authorise the script when prompted ("unverified app" is expected:
 *     Advanced → Go to project).
 *  4. Copy the Web app URL (ends with /exec) into js/main.js → CONFIG.rsvpUrl.
 *
 * UPDATING: after editing this code, use Deploy → Manage deployments →
 * edit (pencil) → Version: New version → Deploy. The URL stays the same.
 */

const SHEET_NAME = 'Responses';
const HEADERS = ['Submitted at', 'Name', 'Attending', 'Guests', 'Drinks', 'Comment'];
const MAX_FIELD_LENGTH = 1000;
const MAX_GUESTS = 10;

function doPost(e) {
  const p = (e && e.parameter) || {};

  const name = String(p.name || '').trim();
  if (!name) return json({ result: 'error', error: 'Name is required' });
  if (p.attend !== 'yes' && p.attend !== 'no') return json({ result: 'error', error: 'Invalid attend value' });

  // Serialise writes so concurrent submissions never collide
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json({ result: 'error', error: 'Busy, try again' });

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const guests = Math.min(Math.max(parseInt(p.guests, 10) || 0, 0), MAX_GUESTS);
    sheet.appendRow([
      new Date(),
      sanitize(name),
      p.attend === 'yes' ? 'Yes' : 'No',
      p.attend === 'yes' ? guests : 0,
      sanitize(p.drinks),
      sanitize(p.comment),
    ]);

    return json({ result: 'success' });
  } catch (error) {
    console.error(error);
    return json({ result: 'error', error: 'Internal error' });
  } finally {
    lock.releaseLock();
  }
}

// Truncate, and prevent formula injection: Sheets would evaluate text
// starting with = + - @ as a formula, so prefix it with an apostrophe.
function sanitize(value) {
  const text = String(value || '').trim().slice(0, MAX_FIELD_LENGTH);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
