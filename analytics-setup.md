# Uncut Lesson analytics setup

The website now records course-card actions, quiz lead submissions, assignment downloads, form submissions, back links and time on each page through Google Analytics 4 (GA4). No names, emails or WhatsApp numbers are sent to Analytics.

1. Create a Google Analytics 4 web data stream for the website domain.
2. Copy its Measurement ID (it starts with `G-`).
3. Put that ID in `tracking-config.js` as `G-15364457299`.
4. Publish the site and use GA4 **Reports → Engagement → Events** or **Explore** to review these events:
   - `course_action`: selected course and action type (`free_video`, `course_details`, `payment`, `quiz`, or `assignment`)
   - `page_ready`: entry page/referrer
   - `navigation_back` and `browser_history_navigation`: return/back activity
   - `page_exit`: time on page and next clicked page
   - `quiz_lead_submit`, `course_review_submit`, and `form_submit`

For a useful acquisition report, add UTM links to Instagram, WhatsApp, Facebook and ads. Example: `https://YOUR-DOMAIN/courses.html?utm_source=instagram&utm_medium=social&utm_campaign=excel`.

GA4’s standard page-view reporting shows which pages students visit before they leave; the custom events make course interest and free-video-to-payment journeys easier to inspect.
