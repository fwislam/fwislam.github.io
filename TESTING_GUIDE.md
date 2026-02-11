# Testing Guide

## Overview

This guide helps you test the Outlook Task Extractor add-in thoroughly.

---

## Test Environment Setup

### 1. Create Test Email Account

Use a test Microsoft 365 account for development:
- Sign up for [Microsoft 365 Developer Program](https://developer.microsoft.com/microsoft-365/dev-program)
- Get a free E5 subscription with test accounts

### 2. Prepare Test Data

Send yourself various types of emails to test different scenarios.

---

## Test Scenarios

### Scenario 1: Basic Action Email

**Test Email:**
```
Subject: Project Update Needed
Body: Hi, can you send me the Q4 project update by Friday? Thanks!
```

**Expected Result:**
- ✅ Extracted as task
- Title: "Project Update Needed" or similar
- Priority: Medium
- Due Date: Next Friday
- Link to original email works

---

### Scenario 2: Urgent High-Priority Email

**Test Email:**
```
Subject: URGENT: Client Meeting Prep
Body: URGENT - Please prepare the client presentation ASAP. We need it by tomorrow morning for the 9 AM meeting.
```

**Expected Result:**
- ✅ Extracted as task
- Priority: High (due to "URGENT" and "ASAP")
- Due Date: Tomorrow
- Red priority badge displayed

---

### Scenario 3: Low-Priority Optional Task

**Test Email:**
```
Subject: Optional: Team Survey
Body: When you have time, please fill out this team survey. No rush, just whenever you can.
```

**Expected Result:**
- ✅ Extracted as task
- Priority: Low (due to "no rush", "when you can")
- Green priority badge displayed

---

### Scenario 4: Newsletter (Should Be Filtered)

**Test Email:**
```
Subject: Weekly Tech Newsletter - March 2024
Body: Here's your weekly roundup of tech news. Click here to unsubscribe.
From: newsletter@techsite.com
```

**Expected Result:**
- ❌ NOT extracted as task
- Filtered out due to newsletter detection

---

### Scenario 5: Automated Email (Should Be Filtered)

**Test Email:**
```
Subject: Automatic Reply: Out of Office
Body: I am currently out of office and will return on Monday.
From: noreply@company.com
```

**Expected Result:**
- ❌ NOT extracted as task
- Filtered out due to automated email detection

---

### Scenario 6: FYI Email (No Action Required)

**Test Email:**
```
Subject: FYI - Meeting Notes
Body: FYI, here are the notes from today's meeting. No action needed from you.
```

**Expected Result:**
- ❌ NOT extracted as task
- No clear action required

---

### Scenario 7: Multiple Action Items

**Test Email:**
```
Subject: Three Tasks for This Week
Body: 
Hi, please complete these by end of week:
1. Review the budget proposal
2. Send feedback on the design mockups
3. Schedule a follow-up meeting

Thanks!
```

**Expected Result:**
- ✅ Extracted as task
- Title captures main request
- Description includes details
- Due Date: End of week

---

### Scenario 8: Email with Specific Date

**Test Email:**
```
Subject: Report Due March 15
Body: Please submit your monthly report by 3/15/2024. Let me know if you have questions.
```

**Expected Result:**
- ✅ Extracted as task
- Due Date: March 15, 2024
- Date badge shows "Mar 15"

---

### Scenario 9: Question Email

**Test Email:**
```
Subject: Quick Question
Body: Do you have the latest version of the contract? Can you send it over?
```

**Expected Result:**
- ✅ Extracted as task
- Title: "Quick Question" or "Send contract"
- Priority: Medium

---

### Scenario 10: Flagged Email

**Test Email:**
```
Subject: Important: Review Required
Body: Please review the attached document when you get a chance.
```

**Action:** Flag this email in Outlook

**Expected Result:**
- ✅ Extracted as task (from flagged emails)
- Shows up even if older than 7 days

---

## Functional Testing

### Authentication Flow

1. **Test:** Open add-in for first time
   - ✅ Should prompt for Microsoft login
   - ✅ Should request Mail.Read permission
   - ✅ Should show "Ready to scan emails" message

2. **Test:** Refresh page
   - ✅ Should remember authentication
   - ✅ Should not prompt for login again

---

### Email Scanning

1. **Test:** Click "Scan Emails" button
   - ✅ Button should disable during scan
   - ✅ Loading spinner should appear
   - ✅ Status message shows progress
   - ✅ Results appear within 10-30 seconds

2. **Test:** Scan with no emails
   - ✅ Shows "No emails found" message
   - ✅ Empty state displayed

3. **Test:** Scan with no actionable emails
   - ✅ Shows "No actionable tasks found"
   - ✅ Empty state displayed

---

### Task Display

1. **Test:** Task list rendering
   - ✅ Tasks sorted by priority (High → Medium → Low)
   - ✅ Priority badges show correct colors
   - ✅ Due dates formatted correctly
   - ✅ Task titles are readable

2. **Test:** Task completion
   - ✅ Checkbox toggles task completion
   - ✅ Completed tasks show reduced opacity
   - ✅ Completion state persists on refresh

3. **Test:** Open email link
   - ✅ "Open Email" button works
   - ✅ Opens correct email in new tab/window
   - ✅ Email loads successfully

---

### UI/UX Testing

1. **Test:** Responsive design
   - ✅ Works in narrow task pane (320px)
   - ✅ Works in wide task pane (600px)
   - ✅ No horizontal scrolling

2. **Test:** Loading states
   - ✅ Spinner shows during scan
   - ✅ Button disabled during scan
   - ✅ Status messages clear and helpful

3. **Test:** Error states
   - ✅ Authentication errors show helpful message
   - ✅ Network errors handled gracefully
   - ✅ API errors don't crash the app

---

## Performance Testing

### Load Testing

1. **Test:** Scan 50 emails
   - ✅ Completes within 30 seconds
   - ✅ No browser freezing
   - ✅ Memory usage reasonable

2. **Test:** Display 20+ tasks
   - ✅ Renders smoothly
   - ✅ Scrolling is smooth
   - ✅ No lag when checking tasks

---

### API Rate Limiting

1. **Test:** Multiple rapid scans
   - ✅ Handles rate limits gracefully
   - ✅ Shows appropriate error message
   - ✅ Suggests retry after delay

---

## Browser Compatibility

Test in multiple environments:

### Outlook on Web
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Outlook Desktop
- ✅ Windows (Outlook 2016+)
- ✅ Mac (Outlook 2016+)

---

## AI/NLP Testing

### OpenAI Mode (with API key)

1. **Test:** Complex email analysis
   - ✅ Accurately detects action items
   - ✅ Extracts due dates correctly
   - ✅ Assigns appropriate priority

2. **Test:** Edge cases
   - ✅ Handles very long emails
   - ✅ Handles emails with attachments
   - ✅ Handles emails in different languages

### NLP Fallback Mode (without API key)

1. **Test:** Keyword detection
   - ✅ Detects "please", "can you", etc.
   - ✅ Identifies urgent keywords
   - ✅ Extracts date patterns

2. **Test:** Accuracy comparison
   - ✅ NLP mode catches most action emails
   - ✅ Priority detection works
   - ✅ Date extraction works for common patterns

---

## Security Testing

### Input Sanitization

1. **Test:** Email with HTML/scripts
   ```html
   <script>alert('XSS')</script>
   ```
   - ✅ Script tags are escaped
   - ✅ No JavaScript execution
   - ✅ Content displays safely

2. **Test:** Email with special characters
   - ✅ Handles quotes, apostrophes
   - ✅ Handles Unicode characters
   - ✅ Handles emojis

---

### Authentication Security

1. **Test:** Token expiration
   - ✅ Handles expired tokens
   - ✅ Prompts for re-authentication
   - ✅ Doesn't expose tokens in console

---

## Regression Testing

After making changes, verify:

1. ✅ All test scenarios still pass
2. ✅ No new console errors
3. ✅ Performance hasn't degraded
4. ✅ UI still looks correct
5. ✅ Authentication still works

---

## Automated Testing (Future)

### Unit Tests

```javascript
// Example test structure
describe('AIService', () => {
  describe('requiresAction', () => {
    it('should detect action keywords', () => {
      expect(aiService.requiresAction('please send me')).toBe(true);
      expect(aiService.requiresAction('fyi only')).toBe(false);
    });
  });

  describe('determinePriority', () => {
    it('should detect high priority', () => {
      expect(aiService.determinePriority('urgent task')).toBe('High');
    });
  });
});
```

### Integration Tests

```javascript
describe('Task Extraction Flow', () => {
  it('should extract tasks from emails', async () => {
    const emails = await graphService.getRecentEmails(7);
    const tasks = await taskExtractor.extractTasks(emails);
    expect(tasks).toBeInstanceOf(Array);
    expect(tasks.length).toBeGreaterThan(0);
  });
});
```

---

## Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Outlook version: Web/Desktop
- Browser: Chrome 120
- OS: Windows 11

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste any errors from browser console]
```

---

## Test Checklist

Before releasing:

- [ ] All test scenarios pass
- [ ] Authentication works
- [ ] Email scanning works
- [ ] Task extraction accurate
- [ ] UI renders correctly
- [ ] Links work
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Works in all supported browsers
- [ ] Works in Outlook Web and Desktop
- [ ] Security tests pass
- [ ] Documentation updated

---

## Continuous Testing

During development:

1. Test after every major change
2. Keep test emails in a dedicated folder
3. Document any new edge cases
4. Update test scenarios as needed
5. Monitor user feedback for new test cases

---

## Support

For testing questions:
- Review this guide
- Check browser console for errors
- Enable verbose logging in code
- Test with simplified scenarios first
