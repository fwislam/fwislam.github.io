# Architecture Documentation

## System Overview

The Outlook Task Extractor is a client-side Office Add-in that integrates with Microsoft Graph API and optionally OpenAI to automatically extract actionable tasks from emails.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Outlook Client                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Office Add-in (Task Pane)                  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           Presentation Layer                      │  │ │
│  │  │  - taskpane.html (UI)                            │  │ │
│  │  │  - taskpane.css (Styling)                        │  │ │
│  │  │  - taskpane.js (UI Logic)                        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                        ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           Service Layer                           │  │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │ │
│  │  │  │  Graph     │  │    AI      │  │   Task     │ │  │ │
│  │  │  │  Service   │  │  Service   │  │ Extractor  │ │  │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                        ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           Utility Layer                           │  │ │
│  │  │  - helpers.js (Date formatting, etc.)            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌───────────────────┐              ┌───────────────────┐
│  Microsoft Graph  │              │   OpenAI API      │
│       API         │              │   (Optional)      │
│                   │              │                   │
│ - Mail.Read       │              │ - GPT-3.5-turbo   │
│ - User.Read       │              │ - Task extraction │
└───────────────────┘              └───────────────────┘
```

---

## Component Architecture

### 1. Presentation Layer

**Purpose:** User interface and interaction handling

**Components:**
- `taskpane.html` - HTML structure
- `taskpane.css` - Styling and layout
- `taskpane.js` - UI logic and event handling

**Responsibilities:**
- Render task list
- Handle user interactions (clicks, checkboxes)
- Display loading states and errors
- Manage UI state

**Key Functions:**
- `scanEmails()` - Trigger email scan
- `displayTasks()` - Render task list
- `toggleTaskComplete()` - Mark tasks complete
- `openEmail()` - Open original email

---

### 2. Service Layer

#### GraphService

**Purpose:** Interface with Microsoft Graph API

**File:** `src/services/graphService.js`

**Responsibilities:**
- Authenticate with Microsoft Graph
- Fetch emails from inbox and flagged folders
- Filter newsletters and automated emails
- Deduplicate emails

**Key Methods:**
```javascript
authenticate()              // OAuth authentication
getRecentEmails(days)       // Fetch emails
getEmailById(id)            // Get specific email
isNewsletter(email)         // Filter newsletters
isAutomatedEmail(email)     // Filter automated emails
```

**Dependencies:**
- `@microsoft/microsoft-graph-client`
- Office.js (for SSO token)

---

#### AIService

**Purpose:** Analyze emails and extract task information

**File:** `src/services/aiService.js`

**Responsibilities:**
- Analyze email content for action items
- Extract task details (title, priority, due date)
- Support both OpenAI and NLP fallback
- Determine task priority

**Key Methods:**
```javascript
analyzeEmail(email)         // Main analysis entry point
analyzeWithOpenAI(email)    // AI-powered analysis
analyzeWithNLP(email)       // Heuristic fallback
requiresAction(text)        // Detect action keywords
extractDueDate(text)        // Parse dates
determinePriority(text)     // Assign priority
```

**Dependencies:**
- `axios` (for OpenAI API calls)
- OpenAI API (optional)

**Decision Logic:**
```
Has OPENAI_API_KEY?
├─ Yes → Use OpenAI API
│         ├─ Success → Return AI result
│         └─ Error → Fallback to NLP
└─ No → Use NLP heuristics
```

---

#### TaskExtractor

**Purpose:** Orchestrate task extraction from multiple emails

**File:** `src/services/taskExtractor.js`

**Responsibilities:**
- Process emails in batches
- Coordinate with AIService
- Build task objects
- Filter duplicates
- Sort tasks by priority

**Key Methods:**
```javascript
extractTasks(emails)        // Process multiple emails
extractTaskFromEmail(email) // Process single email
filterDuplicates(tasks)     // Remove duplicates
sortTasks(tasks)            // Sort by priority/date
```

**Processing Flow:**
```
Emails Array
    ↓
Split into batches (5 emails)
    ↓
For each batch:
    ↓
Parallel processing → AIService.analyzeEmail()
    ↓
Filter null results
    ↓
Build task objects
    ↓
Combine all batches
    ↓
Remove duplicates
    ↓
Sort by priority
    ↓
Return tasks
```

---

### 3. Utility Layer

**Purpose:** Shared helper functions

**File:** `src/utils/helpers.js`

**Functions:**
- `formatDate()` - Format dates for display
- `truncate()` - Truncate long text
- `escapeHtml()` - Prevent XSS attacks
- `debounce()` - Debounce function calls
- `getRelativeTime()` - Relative time strings

---

## Data Flow

### Email Scanning Flow

```
User clicks "Scan Emails"
    ↓
taskpane.js: scanEmails()
    ↓
GraphService.authenticate()
    ↓
GraphService.getRecentEmails(7)
    ↓
Microsoft Graph API
    ↓
Filter newsletters & automated
    ↓
TaskExtractor.extractTasks(emails)
    ↓
For each email:
    ↓
AIService.analyzeEmail(email)
    ↓
OpenAI API OR NLP heuristics
    ↓
Return task data
    ↓
Build task objects
    ↓
Filter duplicates
    ↓
Sort by priority
    ↓
taskpane.js: displayTasks(tasks)
    ↓
Render in UI
```

---

### Task Object Structure

```javascript
{
  id: "task-{emailId}-{timestamp}",
  emailId: "AAMkAGI...",
  conversationId: "AAQkAGI...",
  title: "Send Q4 report",
  description: "Please send by Friday",
  dueDate: "2024-03-15",
  priority: "High" | "Medium" | "Low",
  from: "user@example.com",
  fromName: "John Doe",
  receivedDate: "2024-03-10T10:30:00Z",
  webLink: "https://outlook.office.com/...",
  completed: false,
  createdAt: "2024-03-10T15:45:00Z"
}
```

---

## Authentication Flow

```
Add-in loads
    ↓
Office.onReady()
    ↓
GraphService.authenticate()
    ↓
Office.context.mailbox.getCallbackTokenAsync()
    ↓
Receive REST token
    ↓
Initialize Graph Client with token
    ↓
Token valid for session
    ↓
Make Graph API calls
```

**Token Type:** REST token (Office.js SSO)
**Scope:** Mail.Read, User.Read
**Lifetime:** Session-based

---

## AI/NLP Decision Tree

```
Email received
    ↓
AIService.analyzeEmail()
    ↓
Check: OPENAI_API_KEY exists?
    ├─ Yes
    │   ↓
    │   Call OpenAI API
    │   ↓
    │   Success?
    │   ├─ Yes → Return AI result
    │   └─ No → Fallback to NLP
    │
    └─ No
        ↓
        Use NLP heuristics
        ↓
        Check action keywords
        ↓
        Extract due date
        ↓
        Determine priority
        ↓
        Return NLP result
```

---

## Error Handling Strategy

### Layered Error Handling

```
UI Layer (taskpane.js)
├─ Try-catch blocks
├─ User-friendly error messages
└─ Fallback to empty state

Service Layer
├─ Try-catch in each service
├─ Log errors to console
├─ Return null/empty on failure
└─ Automatic fallback (AI → NLP)

API Layer
├─ Axios error handling
├─ Retry logic (future)
└─ Rate limit handling
```

### Error Types

1. **Authentication Errors**
   - Display: "Failed to authenticate"
   - Action: Prompt re-login

2. **Network Errors**
   - Display: "Network error, please try again"
   - Action: Retry button

3. **API Errors**
   - Display: "Failed to fetch emails"
   - Action: Check permissions

4. **Parsing Errors**
   - Silent fallback
   - Log to console

---

## Performance Optimizations

### 1. Batch Processing

Process emails in batches of 5 to avoid overwhelming APIs:

```javascript
const batchSize = 5;
for (let i = 0; i < emails.length; i += batchSize) {
  const batch = emails.slice(i, i + batchSize);
  await Promise.all(batch.map(processEmail));
}
```

### 2. Parallel Processing

Use `Promise.all()` for concurrent API calls within batches.

### 3. Early Filtering

Filter newsletters and automated emails before AI analysis.

### 4. Caching (Future)

- Cache email metadata
- Cache task extraction results
- Cache Graph API responses

### 5. Lazy Loading

Load and render tasks progressively as they're extracted.

---

## Security Architecture

### 1. Authentication

- OAuth 2.0 via Microsoft identity platform
- Token stored in memory (not localStorage)
- Least-privilege permissions (Mail.Read only)

### 2. Input Sanitization

All email content sanitized before display:

```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### 3. API Key Protection

- Environment variables (not in code)
- Never exposed to client
- Server-side proxy recommended for production

### 4. CORS

- Proper CORS headers in dev server
- Azure app registration controls allowed origins

---

## Scalability Considerations

### Current Limitations

- Client-side processing (limited by browser)
- API rate limits (Graph: 10k/10min, OpenAI: varies)
- No persistent storage (localStorage only)

### Future Improvements

1. **Backend Service**
   - Move AI processing to server
   - Implement caching layer
   - Handle rate limiting

2. **Database**
   - Store tasks persistently
   - Enable cross-device sync
   - Track task history

3. **Queue System**
   - Process emails asynchronously
   - Handle large volumes
   - Retry failed extractions

---

## Technology Stack

### Frontend
- **Office.js** - Office Add-in framework
- **Vanilla JavaScript** - No framework overhead
- **Webpack** - Module bundling
- **Babel** - ES6+ transpilation

### APIs
- **Microsoft Graph API** - Email access
- **OpenAI API** - AI-powered analysis (optional)

### Build Tools
- **Webpack Dev Server** - Development
- **Babel** - Transpilation
- **dotenv** - Environment variables

### Dependencies
```json
{
  "@microsoft/microsoft-graph-client": "^3.0.7",
  "axios": "^1.6.5",
  "dotenv": "^16.4.1"
}
```

---

## Deployment Architecture

### Development
```
Local Machine
├─ Webpack Dev Server (localhost:3000)
├─ HTTPS (self-signed cert)
└─ Sideloaded to Outlook
```

### Production
```
Static Hosting (Azure/Netlify/etc.)
├─ HTTPS (valid cert)
├─ CDN for assets
└─ Distributed via AppSource or private deployment
```

---

## Extension Points

The architecture supports future extensions:

1. **New AI Providers**
   - Add new methods to AIService
   - Implement provider interface

2. **Additional Email Sources**
   - Extend GraphService
   - Add new folder queries

3. **Task Management**
   - Add TaskManager service
   - Implement CRUD operations

4. **Sync Services**
   - Add SyncService
   - Integrate with Microsoft To Do

5. **Analytics**
   - Add AnalyticsService
   - Track usage patterns

---

## Testing Strategy

### Unit Tests (Future)
- Test individual functions
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test service interactions
- Use test Microsoft 365 account
- Verify API integrations

### E2E Tests
- Test complete user flows
- Verify UI interactions
- Test in real Outlook environment

---

## Monitoring & Logging

### Current Logging
- Console.log for debugging
- Error logging in catch blocks

### Future Monitoring
- Application Insights integration
- Error tracking (Sentry)
- Performance monitoring
- Usage analytics

---

## Documentation

- **README.md** - Quick start guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **API_DOCUMENTATION.md** - API reference
- **TESTING_GUIDE.md** - Testing procedures
- **ARCHITECTURE.md** - This document
- **QUICK_REFERENCE.md** - Quick reference card

---

## Version History

- **v1.0.0** - Initial release
  - Email scanning
  - AI/NLP task extraction
  - Basic UI
  - Graph API integration

---

## Future Roadmap

### Phase 2
- Task editing and deletion
- Sync with Microsoft To Do
- Custom filters and rules

### Phase 3
- Team collaboration features
- Shared task lists
- Analytics dashboard

### Phase 4
- Mobile app support
- Offline mode
- Advanced AI features

---

## Contributing

When contributing, maintain:
- Modular architecture
- Clear separation of concerns
- Comprehensive error handling
- Security best practices
- Documentation updates

---

## License

MIT License - See LICENSE file
