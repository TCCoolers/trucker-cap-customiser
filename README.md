# TC Coolers Custom Trucker Cap Designer — Version 2

A GitHub Pages-ready cap customiser for TC Coolers & Trucker Caps.

## Included

- Front, side and rear cap previews
- Classic, high-profile and flat-peak selections
- 10 popular colour combinations
- Individual front, mesh, peak, undervisor, button, stitching and snapback colours
- Customer artwork upload and live image preview
- Optional front wording
- Separate wording for the left and right side strips
- Phone number across the rear mesh, with straight or arched layout
- Embroidery-location checklist
- Quantity selection from 25 to 1000+
- Downloadable preview of the current cap view
- Web3Forms integration sending enquiries directly to `tccoolers@gmail.com`
- Facebook and Instagram links
- Mobile-friendly design

## Web3Forms

The supplied public Web3Forms key is already included in `index.html`:

`8e93315f-ad94-43ce-96be-2781b9c6cf08`

No Google Sheets or Apps Script is used.

### Important file-upload note

Web3Forms account limits can change. Test artwork attachments after publishing. Image files will still display in the live preview in the browser. If an attachment exceeds the account's file-size limit, the customer can submit the quote and TC Coolers can request the original artwork by reply email.

## Upload to GitHub Pages

1. Download and extract the ZIP.
2. Create a new GitHub repository, for example `tc-coolers-hat-designer`.
3. Upload the contents of the extracted folder to the repository root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `assets/`
   - `README.md`
4. Commit the files.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select the `main` branch and `/ (root)` folder.
8. Save and wait for the GitHub Pages link.

## Web3Forms website URL

After the GitHub Pages site is live, return to the Web3Forms dashboard and update the form's Website URL from `localhost` to the full GitHub Pages URL.

Example:

`https://yourusername.github.io/tc-coolers-hat-designer/`

## Testing

1. Open the live GitHub Pages URL.
2. Select a colour combination.
3. Add left and right strip wording.
4. Add a phone number to the rear mesh.
5. Switch between Front, Side and Rear.
6. Complete and submit the quote form.
7. Confirm the enquiry arrives at `tccoolers@gmail.com`.
8. Check Spam/Junk if the first submission does not appear in the inbox.

## Editing contact links

Search `index.html` for:

- `tccoolers@gmail.com`
- `https://www.facebook.com/tccoolers/`
- `https://www.instagram.com/tccoolers`

## Image fix
This fixed package embeds the TC Coolers logo directly inside `index.html`, so no separate `assets` folder is required. Upload all four files to the repository root and replace the existing files.
