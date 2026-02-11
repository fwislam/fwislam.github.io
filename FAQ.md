# Frequently Asked Questions (FAQ)

## General Questions

### What is the Outlook Task Extractor?
An Office Add-in that automatically scans your Outlook emails and extracts actionable tasks using AI/NLP technology. It helps you stay organized by identifying emails that require action and presenting them as a clean task list.

### Is it free to use?
Yes, the add-in itself is free and open-source (MIT License). However, you'll need:
- A Microsoft 365 account (may require subscription)
- An Azure account (free tier available)
- Optional: OpenAI API key (paid, but has free tier)

### Does it work without OpenAI?
Yes! The add-in has a built-in NLP fallback that works without OpenAI. It uses keyword matching and heuristics to detect action items. While OpenAI provides better accuracy, the NLP mode is quite effective for most use cases.

### Which Outlook versions are supported?
- Outlook on the Web (all browsers)
- Outlook Desktop for Windows (2016+)
- Outlook Desktop for Mac (2016+)

### Does it work on mobile?
Not currently. Office Add-ins have limited mobile support. This is planned for a future release.

---

## Setup & Installation

### How do I get started?
1. Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
2. Quick start: `npm install` → configure `.env` → `npm start` → sideload

### What do I need to install?
- Node.js 18 or higher
- npm (comes with Node.js)
- A code editor (VS Code recommended)
- Git (optional, for version control)

### How do I get an Azure Client ID?
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create a new registration
4. Copy the Application (client) ID
5. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed steps

### Do I need an OpenAI API key?
No, it's optional. The add-in works with NLP fallback if you don't provide an OpenAI key. However, OpenAI provides better accuracy for complex emails.

### How do I get an OpenAI API key?
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Add it to your `.env` file

---

## Authentication & Permissions

### Why does it need Mail.Read permission?
To scan your emails and extract task information. This is a read-only permission - the add-in cannot send, delete, or modify your emails.

### Is my data secure?
Yes. The add-in:
- Uses OAuth 2.0 authentication
- Only requests read-only permissions
- Processes data client-side (in your browser)
- Doesn't store emails on any server
- Sanitizes all input to prevent XSS attacks

### Why does authentication fail?
Common causes:
- Incorrect Azure app registration
- Missing or incorrect redirect URIs
- API permissions not granted
- Admin consent not provided

Solution: Review the [SETUP_GUIDE.md](./SETUP_GUIDE.md) authentication section.

### How long does the authentication last?
The authentication token is session-based. You'll need to re-authenticate when:
- You close and reopen Outlook
- The token expires (typically after a few hours)
- You clear browser cache/cookies

---

## Usage Questions

### How do I scan my emails?
1. Open Outlook
2. Click the "Task Extractor" button in the ribbon
3. Click "Scan Emails" in the task pane
4. Wait for the analysis to complete (10-30 seconds)

### How many emails does it scan?
By default, it scans:
- Last 7 days of emails
- Up to 50 emails total
- Both inbox and flagged emails

You can adjust these settings in the `.env` file.

### Why aren't all my emails showing as tasks?
The add-in filters out:
- Newsletters (detected by "unsubscribe" links, etc.)
- Automated emails (from "noreply@" addresses, etc.)
- FYI emails (no clear action required)
- Emails without action keywords

This is intentional to show only actionable items.

### How does it determine priority?
Priority is based on keywords:
- **High**: urgent, asap, immediately, critical, important
- **Low**: when you can, no rush, optional, fyi
- **Medium**: everything else

### How does it extract due dates?
It looks for patterns like:
- "by Friday"
- "due Monday"
- "by March 15"
- "3/15/2024"
- "deadline tomorrow"

### Can I edit tasks?
Not in version 1.0. Task editing is planned for a future release. Currently, you can:
- Mark tasks as complete (checkbox)
- Open the original email to respond

### Can I delete tasks?
Not directly. Tasks are regenerated each time you scan. To remove a task, you can:
- Mark it as complete
- Archive or delete the original email
- Move the email out of your inbox

### Do completed tasks persist?
Completed status is stored in your browser's localStorage. It persists across sessions but is local to your device. If you use Outlook on another device, you'll need to mark tasks complete again.

---

## Troubleshooting

### The add-in won't load
**Possible causes:**
- Dev server not running
- Not using HTTPS
- Manifest URLs incorrect
- Browser blocking localhost

**Solutions:**
1. Ensure `npm start` is running
2. Check that URLs use `https://localhost:3000`
3. Try a different browser
4. Clear browser cache
5. Remove and re-sideload the add-in

### No tasks are found
**Possible causes:**
- No actionable emails in the last 7 days
- All emails are newsletters/automated
- Graph API permissions not granted

**Solutions:**
1. Send yourself a test email: "Can you send me the report by Friday?"
2. Check browser console for errors
3. Verify Graph API permissions in Azure
4. Try increasing SCAN_DAYS in `.env`

### "Failed to authenticate" error
**Solutions:**
1. Check Azure app registration is correct
2. Verify redirect URIs match exactly
3. Ensure API permissions are granted
4. Try clearing browser cache
5. Check that CLIENT_ID in `.env` is correct

### OpenAI API errors
**Possible causes:**
- Invalid API key
- No credits in OpenAI account
- Rate limit exceeded
- Network issues

**Solutions:**
1. Verify API key is correct
2. Check OpenAI account has credits
3. Wait a few minutes and try again
4. The add-in will automatically fall back to NLP

### Tasks show incorrect priority
The NLP/AI isn't perfect. You can:
- Ignore the priority and focus on the task
- Open the original email to assess urgency
- Future versions will allow manual priority adjustment

### Due dates are wrong
Date extraction is based on natural language patterns. It may misinterpret:
- Ambiguous dates ("next week")
- Past dates mentioned in context
- Dates in unusual formats

Future versions will improve date extraction.

### The UI looks broken
**Solutions:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Try a different browser
5. Ensure you're using a supported browser

---

## Performance

### How long does scanning take?
Typically 10-30 seconds for 50 emails, depending on:
- Number of emails
- Whether using OpenAI (slower) or NLP (faster)
- Network speed
- API response times

### Can I scan more than 50 emails?
Yes, adjust `MAX_EMAILS` in `.env`. However:
- Scanning takes longer
- May hit API rate limits
- Browser may slow down with many tasks

### Why is it slow?
Possible causes:
- Large number of emails
- Slow network connection
- OpenAI API response time
- Graph API rate limiting

Solutions:
- Reduce SCAN_DAYS or MAX_EMAILS
- Use NLP mode instead of OpenAI
- Check network connection

---

## Development

### How do I modify the code?
1. Make changes to files in `src/`
2. Webpack will auto-reload (if `npm start` is running)
3. Refresh Outlook to see changes
4. Check browser console for errors

### How do I add a new feature?
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Create a feature branch
3. Implement the feature
4. Test thoroughly
5. Update documentation
6. Submit a pull request

### How do I debug?
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Use `console.log()` for debugging
4. Check Network tab for API calls
5. Use breakpoints in Sources tab

### Where are the logs?
- Browser console (F12 → Console)
- Network requests (F12 → Network)
- No server-side logs (client-side only)

---

## Deployment

### How do I deploy to production?
1. Update manifest.xml URLs to production domain
2. Run `npm run build`
3. Deploy `dist/` folder to static hosting
4. Update Azure redirect URIs
5. Test in production environment

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

### What hosting do I need?
Any static hosting with HTTPS:
- Azure Static Web Apps (recommended)
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### How do I distribute to my organization?
1. Deploy to production
2. Admin can deploy via Microsoft 365 admin center
3. Or users can sideload individually

### Can I publish to AppSource?
Yes! Follow Microsoft's AppSource submission process:
1. Create Partner Center account
2. Prepare submission materials
3. Submit for validation
4. Wait for approval (2-4 weeks)

---

## Costs

### What does it cost to run?
**Free tier:**
- Azure app registration: Free
- Static hosting: Free (Netlify, Vercel, GitHub Pages)
- NLP mode: Free

**Paid (optional):**
- OpenAI API: ~$0.002 per email analyzed
- Microsoft 365: May require subscription
- Premium hosting: Varies

### How much does OpenAI cost?
GPT-3.5-turbo pricing (as of 2024):
- ~$0.002 per email analyzed
- 50 emails = ~$0.10
- 1000 emails/month = ~$2

Check [OpenAI Pricing](https://openai.com/pricing) for current rates.

---

## Privacy & Security

### What data is collected?
The add-in:
- ✅ Reads email metadata (subject, sender, date)
- ✅ Reads email content for analysis
- ❌ Does NOT store emails on any server
- ❌ Does NOT send data to third parties (except OpenAI if configured)
- ❌ Does NOT track user behavior

### Is my email content sent to OpenAI?
Only if you configure an OpenAI API key. The add-in sends:
- Email subject
- First 500 characters of email body
- No attachments or full email content

If you don't use OpenAI, all processing is local (NLP mode).

### Can I use this for sensitive emails?
Consider:
- Use NLP mode (no external API calls)
- Review your organization's security policies
- Don't use OpenAI for confidential emails
- The add-in only reads, never modifies emails

### Is the code open source?
Yes, MIT License. You can:
- View all source code
- Modify for your needs
- Audit security
- Contribute improvements

---

## Support

### Where can I get help?
1. Check this FAQ
2. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Review [TROUBLESHOOTING](./SETUP_GUIDE.md#troubleshooting) section
4. Open a GitHub issue
5. Start a GitHub discussion

### How do I report a bug?
1. Check if it's already reported
2. Gather error messages and screenshots
3. Open a GitHub issue
4. Use the bug report template in [CONTRIBUTING.md](./CONTRIBUTING.md)

### How do I request a feature?
1. Check if it's already requested
2. Open a GitHub discussion or issue
3. Describe the use case and proposed solution
4. Be open to feedback and alternatives

### Is there a community?
- GitHub Discussions for questions
- GitHub Issues for bugs and features
- Pull requests welcome!

---

## Future Plans

### What features are coming?
See [CHANGELOG.md](./CHANGELOG.md) for the roadmap:
- Phase 2: Task editing, Microsoft To Do sync
- Phase 3: Team collaboration, analytics
- Phase 4: Mobile support, offline mode

### Can I contribute?
Yes! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How often is it updated?
- Patch releases: As needed for bugs
- Minor releases: Quarterly for new features
- Major releases: Annually for major changes

---

## Comparison

### How is this different from Microsoft To Do?
- **Task Extractor**: Automatically extracts tasks from emails
- **Microsoft To Do**: Manual task creation

They complement each other! Future versions will sync with To Do.

### How is this different from Outlook Tasks?
- **Task Extractor**: AI-powered extraction from emails
- **Outlook Tasks**: Manual task management

Similar to To Do, they work together.

### Why not just flag emails?
Flagging is manual. Task Extractor:
- Automatically identifies action items
- Extracts due dates and priority
- Provides a clean task view
- Filters out noise

---

## Technical Questions

### What technologies are used?
- Office.js for Outlook integration
- Microsoft Graph API for email access
- OpenAI API for AI analysis (optional)
- Vanilla JavaScript (no framework)
- Webpack for bundling

### Why vanilla JavaScript instead of React?
- Smaller bundle size
- Faster load times
- Simpler architecture
- Easier to understand and modify

### Can I use React/Vue/Angular?
Yes! The architecture supports it. You'd need to:
- Modify webpack config
- Restructure UI components
- Keep service layer unchanged

### Does it work offline?
No, it requires:
- Internet connection for Graph API
- Internet for OpenAI (if used)
- NLP mode works without OpenAI but still needs Graph API

Offline mode is planned for a future release.

---

## Still Have Questions?

- 📖 Read the [documentation](./README.md)
- 🐛 Report bugs on [GitHub Issues](https://github.com/your-org/outlook-task-extractor/issues)
- 💬 Ask questions in [GitHub Discussions](https://github.com/your-org/outlook-task-extractor/discussions)
- 🤝 Contribute via [Pull Requests](./CONTRIBUTING.md)

---

**Last Updated**: March 2024
