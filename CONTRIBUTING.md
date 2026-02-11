# Contributing Guide

Thank you for your interest in contributing to the Outlook Task Extractor Add-in!

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Microsoft 365 account
- Azure subscription
- Git

### Setup Development Environment

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/outlook-task-extractor.git
cd outlook-task-extractor
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start development server**
```bash
npm start
```

---

## 📋 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Manual testing
npm start
# Then test in Outlook

# Validate manifest
npm run validate
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve bug description"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🎯 Contribution Areas

### High Priority
- [ ] Unit tests for services
- [ ] Integration tests
- [ ] Error handling improvements
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Features
- [ ] Task editing/deletion
- [ ] Sync with Microsoft To Do
- [ ] Custom filtering rules
- [ ] Settings panel
- [ ] Analytics dashboard

### Documentation
- [ ] Video tutorials
- [ ] More code examples
- [ ] Troubleshooting scenarios
- [ ] Translation to other languages

---

## 📝 Code Style Guidelines

### JavaScript

**Good:**
```javascript
// Use descriptive variable names
const taskExtractor = new TaskExtractor();
const extractedTasks = await taskExtractor.extractTasks(emails);

// Add comments for complex logic
// Filter out newsletters based on common patterns
const filteredEmails = emails.filter(email => !this.isNewsletter(email));

// Use async/await
async function fetchEmails() {
  try {
    const emails = await graphService.getRecentEmails(7);
    return emails;
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    throw error;
  }
}
```

**Avoid:**
```javascript
// Don't use single-letter variables (except in loops)
const t = new TaskExtractor();
const e = await t.extractTasks(emails);

// Don't leave commented-out code
// const oldCode = doSomething();

// Don't use callbacks when async/await is available
graphService.getRecentEmails(7, (error, emails) => {
  // ...
});
```

### CSS

**Good:**
```css
/* Use clear class names */
.task-item {
  padding: 16px;
  margin-bottom: 12px;
}

/* Group related properties */
.btn-primary {
  /* Layout */
  display: flex;
  padding: 12px 16px;
  
  /* Appearance */
  background: #0078d4;
  color: white;
  border-radius: 6px;
  
  /* Interaction */
  cursor: pointer;
  transition: all 0.2s;
}
```

### HTML

**Good:**
```html
<!-- Use semantic HTML -->
<header>
  <h1>Today's Tasks from Email</h1>
</header>

<!-- Use descriptive IDs and classes -->
<button id="scanButton" class="btn btn-primary">
  Scan Emails
</button>

<!-- Include accessibility attributes -->
<button aria-label="Scan emails for tasks">
  Scan
</button>
```

---

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Authentication**
   - [ ] First-time login works
   - [ ] Token refresh works
   - [ ] Error handling works

2. **Email Scanning**
   - [ ] Scans inbox successfully
   - [ ] Filters newsletters
   - [ ] Handles empty inbox
   - [ ] Shows loading state

3. **Task Extraction**
   - [ ] Extracts action emails
   - [ ] Assigns correct priority
   - [ ] Extracts due dates
   - [ ] Removes duplicates

4. **UI**
   - [ ] Tasks display correctly
   - [ ] Checkboxes work
   - [ ] Email links work
   - [ ] Responsive design works

### Writing Tests (Future)

```javascript
// Example test structure
describe('AIService', () => {
  let aiService;
  
  beforeEach(() => {
    aiService = new AIService();
  });
  
  describe('requiresAction', () => {
    it('should detect action keywords', () => {
      const text = 'Please send me the report';
      expect(aiService.requiresAction(text)).toBe(true);
    });
    
    it('should ignore FYI emails', () => {
      const text = 'FYI - meeting notes attached';
      expect(aiService.requiresAction(text)).toBe(false);
    });
  });
});
```

---

## 📚 Documentation Guidelines

### Code Comments

```javascript
/**
 * Extracts tasks from multiple emails
 * @param {Array<Email>} emails - Array of email objects
 * @returns {Promise<Array<Task>>} Array of extracted tasks
 */
async extractTasks(emails) {
  // Implementation
}
```

### README Updates

When adding features, update:
- Feature list
- Usage examples
- Configuration options
- Troubleshooting section

### API Documentation

When adding/modifying services:
- Document all public methods
- Include parameter types
- Provide code examples
- Explain error handling

---

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Try latest version
3. Test in clean environment
4. Gather error messages

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Outlook version: Web/Desktop
- Browser: Chrome 120
- OS: Windows 11
- Add-in version: 1.0.0

**Screenshots**
[If applicable]

**Console Errors**
[Paste any errors]
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Any other relevant information
```

---

## 🔍 Code Review Process

### What We Look For

✅ **Functionality**
- Does it work as intended?
- Are edge cases handled?
- Is error handling robust?

✅ **Code Quality**
- Is it readable and maintainable?
- Does it follow project conventions?
- Are there comments where needed?

✅ **Performance**
- Is it efficient?
- Does it handle large datasets?
- Are there any bottlenecks?

✅ **Security**
- Is input sanitized?
- Are API keys protected?
- Is authentication secure?

✅ **Documentation**
- Are changes documented?
- Are comments clear?
- Is README updated?

### Review Timeline

- Initial review: Within 3 days
- Follow-up: Within 2 days
- Merge: After approval from maintainer

---

## 🏗️ Architecture Guidelines

### Adding New Services

1. Create file in `src/services/`
2. Export as class
3. Document all public methods
4. Add error handling
5. Update API_DOCUMENTATION.md

**Example:**
```javascript
// src/services/newService.js

/**
 * Service for [purpose]
 */
export class NewService {
  constructor() {
    // Initialize
  }
  
  /**
   * [Method description]
   * @param {type} param - Description
   * @returns {Promise<type>} Description
   */
  async methodName(param) {
    try {
      // Implementation
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
```

### Adding UI Components

1. Add HTML to `taskpane.html`
2. Add styles to `taskpane.css`
3. Add logic to `taskpane.js`
4. Test responsiveness
5. Test accessibility

---

## 🔐 Security Guidelines

### Do's
✅ Sanitize all user input
✅ Use environment variables for secrets
✅ Validate API responses
✅ Use HTTPS only
✅ Implement rate limiting
✅ Log security events

### Don'ts
❌ Commit API keys or secrets
❌ Store sensitive data in localStorage
❌ Trust user input without validation
❌ Expose internal errors to users
❌ Use HTTP in production
❌ Hardcode credentials

---

## 📦 Release Process

### Version Numbering

Follow Semantic Versioning (semver):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (backward compatible)
- **Patch** (0.0.1): Bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Version bumped in manifest.xml
- [ ] Git tag created
- [ ] Release notes written

---

## 🤝 Community Guidelines

### Be Respectful
- Treat everyone with respect
- Be constructive in feedback
- Help others learn

### Be Professional
- Keep discussions on-topic
- Avoid personal attacks
- Focus on the code, not the person

### Be Collaborative
- Share knowledge
- Ask questions
- Offer help

---

## 📞 Getting Help

### Resources
- **Documentation**: Check all .md files
- **Issues**: Search existing issues
- **Discussions**: Start a discussion on GitHub

### Contact
- Open an issue for bugs
- Start a discussion for questions
- Submit a PR for contributions

---

## 🎓 Learning Resources

### Office Add-ins
- [Office Add-ins Documentation](https://docs.microsoft.com/office/dev/add-ins/)
- [Office.js API Reference](https://docs.microsoft.com/javascript/api/office)

### Microsoft Graph
- [Graph API Documentation](https://docs.microsoft.com/graph/)
- [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

---

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

Don't hesitate to ask! Open an issue or start a discussion.

Thank you for contributing! 🎉
