# API Documentation

## Overview

This document describes the internal APIs and services used in the Outlook Task Extractor add-in.

---

## GraphService

Handles all interactions with Microsoft Graph API.

### Constructor

```javascript
const graphService = new GraphService();
```

### Methods

#### `authenticate()`

Authenticates with Microsoft Graph using Office.js SSO.

**Returns:** `Promise<boolean>`

**Example:**
```javascript
await graphService.authenticate();
```

---

#### `getRecentEmails(days)`

Fetches recent emails from inbox and flagged items.

**Parameters:**
- `days` (number): Number of days to look back (default: 7)

**Returns:** `Promise<Array<Email>>`

**Email Object:**
```javascript
{
  id: string,
  subject: string,
  bodyPreview: string,
  body: {
    content: string,
    contentType: string
  },
  from: {
    emailAddress: {
      name: string,
      address: string
    }
  },
  receivedDateTime: string,
  webLink: string,
  conversationId: string
}
```

**Example:**
```javascript
const emails = await graphService.getRecentEmails(7);
console.log(`Found ${emails.length} emails`);
```

---

#### `getEmailById(emailId)`

Fetches a specific email by ID.

**Parameters:**
- `emailId` (string): The email ID

**Returns:** `Promise<Email|null>`

**Example:**
```javascript
const email = await graphService.getEmailById('AAMkAGI...');
```

---

#### `isNewsletter(email)`

Checks if an email is a newsletter.

**Parameters:**
- `email` (Email): Email object

**Returns:** `boolean`

**Detection criteria:**
- Contains "unsubscribe" links
- From addresses like "noreply@", "marketing@"
- Contains newsletter keywords

---

#### `isAutomatedEmail(email)`

Checks if an email is automated.

**Parameters:**
- `email` (Email): Email object

**Returns:** `boolean`

**Detection criteria:**
- From "noreply" addresses
- Subjects like "Out of Office", "Automatic Reply"
- System notification patterns

---

## AIService

Handles task extraction using OpenAI or NLP fallback.

### Constructor

```javascript
const aiService = new AIService();
```

The service automatically detects if OpenAI API key is available and chooses the appropriate method.

### Methods

#### `analyzeEmail(email)`

Analyzes an email and extracts task information.

**Parameters:**
- `email` (Email): Email object with subject and body

**Returns:** `Promise<TaskData|null>`

**TaskData Object:**
```javascript
{
  hasAction: boolean,
  title: string,
  description: string|null,
  dueDate: string|null,  // ISO date format
  priority: 'High'|'Medium'|'Low'
}
```

**Example:**
```javascript
const taskData = await aiService.analyzeEmail(email);
if (taskData && taskData.hasAction) {
  console.log('Task found:', taskData.title);
}
```

---

#### `analyzeWithOpenAI(email)`

Uses OpenAI GPT-3.5 to analyze email (internal method).

**Parameters:**
- `email` (Email): Email object

**Returns:** `Promise<TaskData|null>`

**OpenAI Prompt Structure:**
- System: Task extraction instructions
- User: Email content with analysis criteria
- Response: JSON with task data

---

#### `analyzeWithNLP(email)`

Uses heuristic NLP to analyze email (fallback method).

**Parameters:**
- `email` (Email): Email object

**Returns:** `TaskData|null`

**NLP Detection:**
- Action keywords: "please", "can you", "need", "review", etc.
- Priority keywords: "urgent", "asap", "important"
- Date patterns: "by Friday", "due Monday", "3/15/2024"

---

#### `requiresAction(text)`

Checks if text contains action-requiring keywords.

**Parameters:**
- `text` (string): Text to analyze

**Returns:** `boolean`

**Action Keywords:**
- Request words: please, can you, could you, would you
- Action verbs: review, send, provide, submit, complete
- Urgency: asap, urgent, deadline

---

#### `extractDueDate(text)`

Extracts due date from text.

**Parameters:**
- `text` (string): Text to analyze

**Returns:** `string|null` (ISO date format)

**Supported Patterns:**
- "by Friday"
- "due Monday"
- "by March 15"
- "3/15/2024"
- "3-15-2024"

---

#### `determinePriority(text)`

Determines task priority based on keywords.

**Parameters:**
- `text` (string): Text to analyze

**Returns:** `'High'|'Medium'|'Low'`

**Priority Rules:**
- High: urgent, asap, immediately, critical, important
- Low: when you can, no rush, optional, fyi
- Medium: everything else

---

## TaskExtractor

Orchestrates task extraction from multiple emails.

### Constructor

```javascript
const taskExtractor = new TaskExtractor();
```

### Methods

#### `extractTasks(emails)`

Extracts tasks from multiple emails.

**Parameters:**
- `emails` (Array<Email>): Array of email objects

**Returns:** `Promise<Array<Task>>`

**Task Object:**
```javascript
{
  id: string,
  emailId: string,
  conversationId: string,
  title: string,
  description: string|null,
  dueDate: string|null,
  priority: 'High'|'Medium'|'Low',
  from: string,
  fromName: string,
  receivedDate: string,
  webLink: string,
  completed: boolean,
  createdAt: string
}
```

**Example:**
```javascript
const tasks = await taskExtractor.extractTasks(emails);
console.log(`Extracted ${tasks.length} tasks`);
```

**Processing:**
- Processes emails in batches of 5
- Filters out null results
- Returns array of valid tasks

---

#### `extractTaskFromEmail(email)`

Extracts a task from a single email.

**Parameters:**
- `email` (Email): Email object

**Returns:** `Promise<Task|null>`

---

#### `filterDuplicates(tasks)`

Filters duplicate tasks based on conversation ID and title similarity.

**Parameters:**
- `tasks` (Array<Task>): Array of tasks

**Returns:** `Array<Task>`

**Deduplication Logic:**
- Groups by conversation ID
- Normalizes titles for comparison
- Keeps most recent task per group

---

#### `sortTasks(tasks)`

Sorts tasks by priority and due date.

**Parameters:**
- `tasks` (Array<Task>): Array of tasks

**Returns:** `Array<Task>`

**Sort Order:**
1. Priority (High → Medium → Low)
2. Due date (earlier first)
3. Received date (most recent first)

---

## Utility Functions

### `formatDate(dateString)`

Formats ISO date to readable string.

**Parameters:**
- `dateString` (string): ISO date string

**Returns:** `string`

**Examples:**
- Today's date → "Today"
- Tomorrow's date → "Tomorrow"
- This week → "Friday"
- Other → "Mar 15" or "Mar 15, 2024"

---

### `truncate(text, maxLength)`

Truncates text to specified length.

**Parameters:**
- `text` (string): Text to truncate
- `maxLength` (number): Maximum length (default: 100)

**Returns:** `string`

---

### `escapeHtml(text)`

Escapes HTML to prevent XSS attacks.

**Parameters:**
- `text` (string): Text to escape

**Returns:** `string`

---

### `debounce(func, wait)`

Creates a debounced function.

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (number): Wait time in ms (default: 300)

**Returns:** `Function`

---

### `getRelativeTime(dateString)`

Gets relative time string.

**Parameters:**
- `dateString` (string): ISO date string

**Returns:** `string`

**Examples:**
- "Just now"
- "5 minutes ago"
- "2 hours ago"
- "3 days ago"

---

## Error Handling

All services implement try-catch blocks and return appropriate error messages.

### Common Errors

**Authentication Errors:**
```javascript
Error: Failed to authenticate with Microsoft Graph
```
**Solution:** Check Azure app registration and permissions

**API Errors:**
```javascript
Error: Failed to fetch emails from Microsoft Graph
```
**Solution:** Verify Graph API permissions and network connectivity

**OpenAI Errors:**
```javascript
// Automatically falls back to NLP
console.error('OpenAI API error:', error);
```
**Solution:** Check API key and credits, or use NLP fallback

---

## Rate Limiting

### Microsoft Graph API

- Default: 10,000 requests per 10 minutes per app
- Batch processing: 5 emails at a time
- Recommended: Implement exponential backoff

### OpenAI API

- Depends on your plan
- Batch processing: 5 emails at a time
- Automatic fallback to NLP on errors

---

## Testing

### Unit Tests (Future)

```javascript
// Example test structure
describe('AIService', () => {
  it('should detect action emails', () => {
    const email = {
      subject: 'Can you send me the report?',
      bodyPreview: 'Please send by Friday'
    };
    const result = aiService.analyzeWithNLP(email);
    expect(result.hasAction).toBe(true);
    expect(result.priority).toBe('Medium');
  });
});
```

### Integration Tests

Test with real emails in development environment:

1. Send test emails with various patterns
2. Run scan and verify task extraction
3. Check priority and due date detection
4. Verify duplicate filtering

---

## Performance Optimization

### Batch Processing

Emails are processed in batches of 5 to avoid overwhelming APIs:

```javascript
const batchSize = 5;
for (let i = 0; i < emails.length; i += batchSize) {
  const batch = emails.slice(i, i + batchSize);
  const batchTasks = await Promise.all(
    batch.map(email => this.extractTaskFromEmail(email))
  );
  tasks.push(...batchTasks.filter(task => task !== null));
}
```

### Caching

Consider implementing caching for:
- Email metadata
- Task extraction results
- Graph API responses

### Lazy Loading

UI loads tasks progressively as they're extracted.

---

## Security Considerations

### Input Sanitization

All email content is sanitized before display:

```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### API Key Protection

- Never expose API keys in client code
- Use environment variables
- Implement server-side proxy for production

### CORS

Ensure proper CORS configuration for production deployment.

---

## Future Enhancements

Potential API additions:

1. **Task Management**
   - `updateTask(taskId, updates)`
   - `deleteTask(taskId)`
   - `syncWithToDo()` - Sync with Microsoft To Do

2. **Advanced Filtering**
   - `filterByPriority(tasks, priority)`
   - `filterByDueDate(tasks, dateRange)`
   - `searchTasks(query)`

3. **Analytics**
   - `getTaskStats()` - Get completion statistics
   - `getProductivityMetrics()` - Analyze email patterns

4. **Notifications**
   - `scheduleReminder(task, time)`
   - `sendDueDateAlert(task)`

---

## Support

For API questions or issues:
- Review this documentation
- Check the source code comments
- Refer to Microsoft Graph API docs
- Refer to OpenAI API docs
