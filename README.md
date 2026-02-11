# Email Task Extractor

A simple web app that extracts actionable tasks from emails using AI/NLP. Just paste your emails and get organized!

## 🚀 Quick Start

### Option 1: Open Locally (No Installation)

1. Download or clone this repository
2. Open `index.html` in your web browser
3. Paste your emails and click "Extract Tasks"

That's it! No server, no installation, no Azure required.

### Option 2: Run with a Local Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

---

## 🎯 Features

✅ **Simple & Fast**
- No installation required
- No Azure or Microsoft account needed
- Works completely in your browser
- No data sent to servers (except OpenAI if you choose)

✅ **AI-Powered Task Detection**
- OpenAI GPT-3.5 integration (optional)
- Built-in NLP fallback (works offline!)
- Detects action-requiring emails
- Extracts title, description, due date, priority

✅ **Smart Task Management**
- Priority badges (🔴 High, 🟡 Medium, 🟢 Low)
- Due date extraction ("by Friday", "3/15/2024")
- Task completion checkboxes
- Clean, modern UI

✅ **Privacy-First**
- All processing happens in your browser
- No data stored on servers
- OpenAI API key stored locally (optional)

---

## 📖 How to Use

### Step 1: Paste Your Emails

Copy and paste one or more emails into the text area. Format doesn't matter much, but this works best:

```
Subject: Project Update Needed
From: john@example.com

Can you send me the Q4 report by Friday? Thanks!

---

Subject: URGENT: Review Required
From: sarah@example.com

Please review this presentation ASAP. We need it for tomorrow's meeting.
```

### Step 2: Choose AI or NLP

**Option A: Use NLP (Default - No API Key Needed)**
- Works offline
- Fast and free
- Good accuracy for most emails
- Just click "Extract Tasks"

**Option B: Use OpenAI (Better Accuracy)**
- Check "Use OpenAI"
- Enter your OpenAI API key
- Better at understanding complex emails
- Costs ~$0.002 per email

### Step 3: Extract Tasks

Click "Extract Tasks" and watch the magic happen! You'll see:
- Task title and description
- Priority level (High/Medium/Low)
- Due date (if mentioned)
- Who sent it

### Step 4: Manage Tasks

- Check off completed tasks
- Review task details
- Copy tasks to your todo app

---

## 🧪 Try These Examples

### Example 1: Action Email
```
Subject: Q4 Report Request
From: manager@company.com

Hi, can you send me the Q4 financial report by Friday? 
We need it for the board meeting. Thanks!
```
✅ Should extract: "Q4 Report Request" with due date Friday, Medium priority

### Example 2: Urgent Email
```
Subject: URGENT: Client Presentation
From: sales@company.com

URGENT - Please review the client presentation ASAP. 
The meeting is tomorrow at 9 AM and we need your feedback immediately.
```
✅ Should extract: High priority task with tomorrow's due date

### Example 3: Multiple Tasks
```
Subject: Weekly Tasks
From: team@company.com

Please complete these by end of week:
1. Review the budget proposal
2. Send feedback on the design mockups
3. Schedule a follow-up meeting
```
✅ Should extract: Task with end-of-week due date

---

## 🔧 Configuration

### Using OpenAI (Optional)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check "Use OpenAI" in the app
3. Paste your API key
4. Your key is saved locally in your browser

**Cost**: ~$0.002 per email (~$0.10 for 50 emails)

### NLP Mode (Default)

No configuration needed! Just paste and extract.

**How it works**:
- Detects action keywords: "please", "can you", "need", "review", etc.
- Extracts dates: "by Friday", "3/15/2024", "tomorrow"
- Determines priority: "urgent", "ASAP" = High, "FYI" = Low

---

## 🏗️ Project Structure

```
email-task-extractor/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js              # All the logic
└── README.md           # This file
```

That's it! Just 3 files. Simple and clean.

---

## 🐛 Troubleshooting

### "No tasks found"
- Make sure your emails contain action words like "please", "can you", "need"
- Try emails that ask you to do something
- Check the examples above

### OpenAI not working
- Verify your API key is correct
- Check you have credits in your OpenAI account
- The app will automatically fall back to NLP if OpenAI fails

### Tasks not accurate
- Try using OpenAI mode for better accuracy
- Make sure emails are clearly formatted
- Action items should be explicit

---

## 💡 Tips

### For Best Results

1. **Clear action items**: Emails with explicit requests work best
2. **Include dates**: Mention "by Friday" or specific dates
3. **Use urgency keywords**: "urgent", "ASAP", "important" for priority
4. **Separate emails**: Use `---` or blank lines between multiple emails

### Email Formats That Work

```
# Format 1: Full email
Subject: Task Request
From: person@email.com
Date: Today

Email body here...

---

# Format 2: Just the content
Can you send me the report by Friday?

---

# Format 3: Multiple paragraphs
First email content here.
More details.

Second email content here.
```

---

## � Deployment

### Deploy to GitHub Pages (Free)

1. Create a GitHub repository
2. Upload `index.html`, `styles.css`, and `app.js`
3. Go to Settings → Pages
4. Select main branch
5. Your app is live at `https://yourusername.github.io/repo-name`

### Deploy to Netlify (Free)

1. Drag and drop your folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your app is live instantly!

### Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

---

## � Privacy & Security

### What Data is Collected?

**None!** Everything runs in your browser.

- ✅ Emails processed locally
- ✅ Tasks stored in browser memory only
- ✅ No server-side storage
- ✅ No tracking or analytics

### What About OpenAI?

If you use OpenAI mode:
- Only email subject and first 500 characters sent to OpenAI
- Your API key stored in browser localStorage
- OpenAI's privacy policy applies

### Is it Safe?

Yes! The code is open source - you can review everything in `app.js`.

---

## 🤝 Contributing

Want to improve this? Contributions welcome!

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

Ideas for contributions:
- Better date parsing
- More priority keywords
- Export to CSV/JSON
- Dark mode
- Mobile app version

---

## 📚 Technical Details

### How It Works

```
User pastes emails
    ↓
Parse emails (extract subject, from, body)
    ↓
For each email:
    ↓
Check if it requires action (keyword matching)
    ↓
If yes:
    - Extract title
    - Extract description
    - Find due date (regex patterns)
    - Determine priority (keyword matching)
    ↓
Display tasks with checkboxes
```

### Technologies Used

- **Vanilla JavaScript** - No frameworks, just pure JS
- **CSS3** - Modern styling with gradients and animations
- **OpenAI API** - Optional AI-powered extraction
- **LocalStorage** - Save API key locally

### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## 📄 License

MIT License - Use it however you want!

---

## 🆘 Need Help?

- � Check the examples above
- 🐛 Open an issue on GitHub
- 💬 Ask in discussions
- 📧 Review the code in `app.js`

---

## 🎉 That's It!

No complex setup, no Azure, no servers. Just open `index.html` and start extracting tasks!

**Built with**: Vanilla JavaScript • OpenAI API (optional) • Love ❤️

**Version**: 2.0.0 • **Status**: ✅ Ready to Use
