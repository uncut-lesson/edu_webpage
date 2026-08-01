# Referral Code Setup Guide

## Best Simple Referral System

You can now use the Refer & Earn page to generate unique codes automatically, and you can still create codes manually when needed.

Recommended format:

- UL1001
- UL1002
- UL1003
- UL1004

Do not reuse the same code for two people. The website generator creates codes from name, WhatsApp number, and random letters so every person gets a different code.

## What The Website Does Now

1. Referrer opens `refer-earn.html`.
2. Referrer enters name, Gmail, and WhatsApp number.
3. Website generates a referral code and referral link.
4. Website sends the new code details to Google Sheets.
5. Admin gets an email with the code, referral link, and copy text.
6. The referrer shares the link or code with friends.
7. If a friend opens the payment link, the Referral Code field is filled automatically.

## Google Sheet Setup

Open your payment Google Sheet and create two sheets:

1. Payment Requests
2. Referral Codes

Your Apps Script can create/update these sheet headers automatically after you paste the updated script and run setup functions.

## Payment Requests Sheet Columns

The payment form will save:

- Timestamp
- Student Name
- Gmail For Drive Access
- WhatsApp Number
- Selected Course
- Amount Paid
- Transaction ID / UPI Ref
- Payment Screenshot Link
- Status
- Access Given Date
- Notes
- Referral Code

## Referral Codes Sheet Columns

Create these columns:

- Referral Code
- Referrer Name
- Referrer Gmail
- Referrer WhatsApp
- Referral Link
- Date Created
- Total Paid Referrals
- Reward Given
- Notes

## How To Enable Google Sheet Automation

1. Open your Google Sheet.
2. Go to Extensions > Apps Script.
3. Paste the latest code from `google-apps-script-payment.gs`.
4. Save the script.
5. Run `setupReferralSheet()` once.
6. Deploy the script as a Web App.
7. Make sure the Web App URL matches `REFERRAL_ENDPOINT` inside `refer-earn.js`.
8. Submit one test referral from `refer-earn.html`.
9. Check the Referral Codes sheet and your admin email.

## How To Create A Referral Code Manually

1. Open the Referral Codes sheet.
2. Add the next available number code.
3. Example: if the last code is UL1007, create UL1008.
4. Add the referrer's name, Gmail, and WhatsApp number.
5. Send the referral code to that person.
6. Tell them to share the code with friends.

## How A Friend Uses The Code

1. Friend opens the payment page.
2. Friend fills name, Gmail, WhatsApp number, and payment details.
3. Friend enters the referral code in the Referral Code field.
4. Friend uploads payment screenshot.
5. Friend submits the form.

## How To Verify Referral

1. Open Payment Requests.
2. Check the new payment row.
3. Confirm payment screenshot and amount are correct.
4. Check the Referral Code column.
5. Search that code in Referral Codes.
6. Increase Total Paid Referrals by 1 only after payment is verified.
7. Mark Reward Given when you give the reward.

## Reward Ideas

- 1 successful paid referral: Rs 20 reward
- 5 successful paid referrals: extra Rs 50 special reward

Start with manual verification first. It is safer and easier to control.
