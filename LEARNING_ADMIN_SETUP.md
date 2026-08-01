# Uncut Lesson learning-admin setup

The website files are ready, but the Google services need one deployment step before the new submissions and dashboard can go live.

## 1. Update the Apps Script project

1. Open the Apps Script project that owns the existing payment web-app URL in `site-config.js`.
2. Replace its script file with [google-apps-script-payment.gs](google-apps-script-payment.gs).
3. Add a new HTML file named `AdminDashboard` and paste in [AdminDashboard.html](AdminDashboard.html).
4. In **Project Settings → Script properties**, create `@))4@lokmi$tri` with a strong private code. Do not put that code in the website files.
5. Run `setupLearningAdmin` once from the Apps Script editor and approve the requested Google permissions. This creates the Courses, Quiz Submissions, Assignments, Offers and Reviews tabs without removing the existing Payment Requests or Referral Codes tabs.
6. Deploy a **new version** of the existing web app. Keep its access setting compatible with public website submissions. Copy the resulting `/exec` address into `appsScriptEndpoint` in [site-config.js](site-config.js) only if the URL changed.

Open `YOUR_WEB_APP_EXEC_URL?action=admin` and enter the private admin code to manage the data.

## Email behaviour

- A payment submission emails `uncutlesson@gmail.com` and sends the student a receipt/verification message.
- Granting access or changing a payment to **Approved** / **Access Given** emails the student.
- The Updates tab sends course-access, new-lesson or offer emails to payment students, quiz leads, or both.

Apps Script email quotas apply. Do not use the broadcast form for unsolicited messages.

## WhatsApp behaviour

WhatsApp business messages require Meta Cloud API approval. In the Meta app, create an approved template without variables, then save these Script properties:

- `WHATSAPP_GRAPH_URL` — the Graph API messages endpoint for the connected WhatsApp phone number
- `WHATSAPP_ACCESS_TOKEN` — a valid Meta access token

The Updates tab can then send that approved template to one number. This avoids placing a WhatsApp token in GitHub Pages or the public website.

## Google Analytics

Set `googleAnalyticsId` in [tracking-config.js](tracking-config.js) to the GA4 Measurement ID. See [analytics-setup.md](analytics-setup.md) for the recorded events and reporting guide.
