# Guest photo upload — setup

The invitation's "Share the moments" section sends guest photos and videos to
the wedding Google Drive folder through this small Google Apps Script.

1. Sign in to the Google account that owns the Drive folder, then open
   https://script.google.com and click **New project**.
2. Delete the sample code and paste everything from `Code.gs`. Save.
3. Click **Deploy → New deployment**, choose type **Web app**, and set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Authorize access** and allow it (on the
   "Google hasn't verified this app" screen: Advanced → Go to project).
5. Copy the **Web app URL** (ends in `/exec`) and paste it into `index.html`
   in the line `const UPLOAD_URL='';`.

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New
version** so the same URL keeps working.
