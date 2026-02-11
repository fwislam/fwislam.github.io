// Strategic Execution Assistant - Standalone Web App

console.log('App.js loaded successfully!');

let tasks = [];
let currentMonth = new Date();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    const extractButton = document.getElementById('extractButton');
    const clearButton = document.getElementById('clearButton');
    const useOpenAICheckbox = document.getElementById('useOpenAI');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (!extractButton || !clearButton || !useOpenAICheckbox) {
        console.error('Required elements not found!');
        return;
    }
    
    extractButton.addEventListener('click', extractTasks);
    clearButton.addEventListener('click', clearAll);
    useOpenAICheckbox.addEventListener('change', toggleOpenAIKey);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    console.log('Event listeners attached successfully');
    
    // Load saved API key
    const savedKey = localStorage.getItem('openai_key');
    if (savedKey) {
        document.getElementById('openaiKey').value = savedKey;
        document.getElementById('useOpenAI').checked = true;
        document.getElementById('openaiKey').style.display = 'block';
    }
});

function toggleOpenAIKey(e) {
    const keyInput = document.getElementById('openaiKey');
    keyInput.style.display = e.target.checked ? 'block' : 'none';
}

async function extractTasks() {
    console.log('Extract tasks button clicked!');
    
    const emailInput = document.getElementById('emailInput').value.trim();
    
    if (!emailInput) {
        console.log('No email input provided');
        showStatus('Please paste some emails first', 'error');
        return;
    }
    
    console.log('Email input length:', emailInput.length);
    
    const extractButton = document.getElementById('extractButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    try {
        // Disable button and show loading
        extractButton.disabled = true;
        loadingSpinner.style.display = 'block';
        taskList.classList.remove('visible');
        emptyState.style.display = 'none';
        
        // Parse emails
        console.log('Parsing emails...');
        const emails = parseEmails(emailInput);
        console.log('Parsed emails:', emails.length);
        showStatus(`Analyzing ${emails.length} email${emails.length > 1 ? 's' : ''}...`, 'success');
        
        // Extract tasks
        const useOpenAI = document.getElementById('useOpenAI').checked;
        const openaiKey = document.getElementById('openaiKey').value;
        
        console.log('Use OpenAI:', useOpenAI);
        
        if (useOpenAI && openaiKey) {
            console.log('Using OpenAI mode');
            localStorage.setItem('openai_key', openaiKey);
            tasks = await extractTasksWithAI(emails, openaiKey);
        } else {
            console.log('Using NLP mode');
            tasks = extractTasksWithNLP(emails);
        }
        
        console.log('Extracted tasks:', tasks.length);
        
        // Display results
        if (tasks.length === 0) {
            showStatus('No actionable tasks found', 'success');
            emptyState.style.display = 'block';
        } else {
            showStatus(`Found ${tasks.length} task${tasks.length > 1 ? 's' : ''}!`, 'success');
            displayTasks(tasks);
            taskList.classList.add('visible');
            
            // Show and render calendar
            renderCalendar();
            document.getElementById('calendarSection').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error extracting tasks:', error);
        showStatus(`Error: ${error.message}`, 'error');
        emptyState.style.display = 'block';
    } finally {
        extractButton.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}

function parseEmails(text) {
    const emails = [];
    
    // Split by common email separators
    const emailBlocks = text.split(/\n\s*\n---+\s*\n\s*\n|\n\s*={3,}\s*\n/);
    
    for (const block of emailBlocks) {
        if (block.trim().length < 10) continue;
        
        const lines = block.split('\n');
        let subject = '';
        let from = '';
        let body = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.match(/^Subject:/i)) {
                subject = trimmed.replace(/^Subject:\s*/i, '');
            } else if (trimmed.match(/^From:/i)) {
                from = trimmed.replace(/^From:\s*/i, '');
            } else if (trimmed.match(/^To:/i) || trimmed.match(/^Date:/i)) {
                continue;
            } else if (trimmed.length > 0) {
                body.push(trimmed);
            }
        }
        
        // If no explicit subject/from, treat entire block as body
        if (!subject && !from && body.length === 0) {
            body = lines.filter(l => l.trim().length > 0);
            subject = body[0] || 'Email';
        }
        
        emails.push({
            subject: subject || 'Email',
            from: from || 'Unknown',
            body: body.join(' '),
            bodyPreview: body.slice(0, 3).join(' ')
        });
    }
    
    return emails;
}

async function extractTasksWithAI(emails, apiKey) {
    const extractedTasks = [];
    
    for (const email of emails) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI that extracts actionable tasks from emails. Return JSON only.'
                        },
                        {
                            role: 'user',
                            content: buildAIPrompt(email)
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 300
                })
            });
            
            if (!response.ok) {
                throw new Error('OpenAI API error');
            }
            
            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);
            
            if (result.hasAction) {
                extractedTasks.push({
                    title: result.title,
                    description: result.description,
                    dueDate: result.dueDate,
                    priority: result.priority,
                    from: email.from,
                    completed: false
                });
            }
        } catch (error) {
            console.error('AI extraction failed, using NLP fallback:', error);
            // Fallback to NLP for this email
            const nlpTask = extractTaskWithNLP(email);
            if (nlpTask) extractedTasks.push(nlpTask);
        }
    }
    
    return extractedTasks;
}

function buildAIPrompt(email) {
    return `Analyze this email and determine if it requires action.

Subject: ${email.subject}
From: ${email.from}
Body: ${email.bodyPreview || email.body}

Return JSON:
{
  "hasAction": true/false,
  "title": "Short task title",
  "description": "Brief description",
  "dueDate": "YYYY-MM-DD or null",
  "priority": "High/Medium/Low"
}

hasAction=true if email contains requests, questions, or action items.
Priority: High=urgent/ASAP, Medium=normal, Low=optional/FYI`;
}

function extractTasksWithNLP(emails) {
    const extractedTasks = [];
    
    for (const email of emails) {
        const task = extractTaskWithNLP(email);
        if (task) {
            extractedTasks.push(task);
        }
    }
    
    return extractedTasks;
}

function extractTaskWithNLP(email) {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    
    // Check if requires action
    if (!requiresAction(text)) {
        return null;
    }
    
    return {
        title: extractTitle(email.subject, text),
        description: email.bodyPreview || email.body.substring(0, 200),
        dueDate: extractDueDate(text),
        priority: determinePriority(text),
        from: email.from,
        completed: false
    };
}

function requiresAction(text) {
    const actionKeywords = [
        'please', 'can you', 'could you', 'would you', 'need you to',
        'request', 'review', 'send', 'provide', 'submit', 'complete',
        'schedule', 'confirm', 'approve', 'check', 'update', 'prepare',
        'respond', 'reply', 'let me know', 'get back', 'asap', 'urgent',
        'action required', 'to do', 'task', 'deadline'
    ];
    
    return actionKeywords.some(keyword => text.includes(keyword));
}

function extractTitle(subject, text) {
    // Clean subject
    let title = subject.replace(/^(re:|fw:|fwd:)\s*/gi, '').trim();
    
    if (title.length > 0 && title.length < 100) {
        return title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    // Extract first sentence with action
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
        if (requiresAction(sentence) && sentence.length < 150) {
            return sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1);
        }
    }
    
    return 'Review email';
}

function extractDueDate(text) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Handle "end of week" / "end of the week" - means Friday
    if (text.match(/end of (the )?week/i)) {
        const friday = getNextFriday(today);
        return adjustToWorkday(friday).toISOString().split('T')[0];
    }
    
    // Handle "this week" - means this Friday
    if (text.match(/this week/i)) {
        const friday = getNextFriday(today);
        return adjustToWorkday(friday).toISOString().split('T')[0];
    }
    
    // Handle specific day names (Monday, Tuesday, etc.)
    const dayMatch = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) {
        const targetDay = dayMatch[1].toLowerCase();
        const date = getNextWeekday(today, targetDay);
        return adjustToWorkday(date).toISOString().split('T')[0];
    }
    
    // Handle "by [day]"
    const byDayMatch = text.match(/by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (byDayMatch) {
        const targetDay = byDayMatch[1].toLowerCase();
        const date = getNextWeekday(today, targetDay);
        return adjustToWorkday(date).toISOString().split('T')[0];
    }
    
    // Handle "tomorrow"
    if (text.match(/\btomorrow\b/i)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return adjustToWorkday(tomorrow).toISOString().split('T')[0];
    }
    
    // Handle "today"
    if (text.match(/\btoday\b/i)) {
        return adjustToWorkday(new Date(today)).toISOString().split('T')[0];
    }
    
    // Handle "next week"
    if (text.match(/next week/i)) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return adjustToWorkday(nextWeek).toISOString().split('T')[0];
    }
    
    // Date patterns
    const patterns = [
        /(\d{1,2}\/\d{1,2}\/\d{2,4})/,  // 3/15/2024
        /(\d{1,2}-\d{1,2}-\d{2,4})/,    // 3-15-2024
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,  // March 15
        /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i   // 15 March
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseDate(match[0]);
        }
    }
    
    return null;
}

function getNextWeekday(fromDate, dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    const currentDay = fromDate.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
    }
    
    const result = new Date(fromDate);
    result.setDate(result.getDate() + daysToAdd);
    return result;
}

function getNextFriday(fromDate) {
    return getNextWeekday(fromDate, 'friday');
}

function parseDate(dateStr) {
    try {
        // Handle month name formats
        const monthNames = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3,
            'may': 4, 'june': 5, 'july': 6, 'august': 7,
            'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        
        // Try "March 15" format
        const monthDayMatch = dateStr.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i);
        if (monthDayMatch) {
            const month = monthNames[monthDayMatch[1].toLowerCase()];
            const day = parseInt(monthDayMatch[2]);
            const year = new Date().getFullYear();
            let date = new Date(year, month, day);
            date = adjustToWorkday(date);
            return date.toISOString().split('T')[0];
        }
        
        // Try "15 March" format
        const dayMonthMatch = dateStr.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
        if (dayMonthMatch) {
            const day = parseInt(dayMonthMatch[1]);
            const month = monthNames[dayMonthMatch[2].toLowerCase()];
            const year = new Date().getFullYear();
            let date = new Date(year, month, day);
            date = adjustToWorkday(date);
            return date.toISOString().split('T')[0];
        }
        
        // Try standard date parsing
        let date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            date = adjustToWorkday(date);
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.error('Date parsing error:', error);
    }
    return null;
}

function adjustToWorkday(date) {
    const dayOfWeek = date.getDay();
    
    // If Saturday (6), move to Friday
    if (dayOfWeek === 6) {
        date.setDate(date.getDate() - 1);
    }
    // If Sunday (0), move to Monday
    else if (dayOfWeek === 0) {
        date.setDate(date.getDate() + 1);
    }
    
    return date;
}

function determinePriority(text) {
    const highKeywords = ['urgent', 'asap', 'immediately', 'critical', 'important', 'high priority', 'emergency', 'deadline'];
    const lowKeywords = ['when you can', 'no rush', 'low priority', 'fyi', 'optional'];
    
    if (highKeywords.some(k => text.includes(k))) return 'High';
    if (lowKeywords.some(k => text.includes(k))) return 'Low';
    return 'Medium';
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    
    taskList.innerHTML = '';
    taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    
    // Sort tasks by priority (High -> Medium -> Low), then by due date
    const sortedTasks = sortTasksByPriority(tasks);
    
    sortedTasks.forEach((task, index) => {
        const taskItem = createTaskElement(task, index);
        taskList.appendChild(taskItem);
    });
}

function sortTasksByPriority(tasks) {
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    
    return [...tasks].sort((a, b) => {
        // First sort by priority
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date (earlier first)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Finally by title alphabetically
        return a.title.localeCompare(b.title);
    });
}

function createTaskElement(task, index) {
    const div = document.createElement('div');
    div.className = `task-item priority-${task.priority.toLowerCase()}`;
    if (task.completed) div.classList.add('completed');
    
    const priorityIcon = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    }[task.priority];
    
    div.innerHTML = `
        <div class="task-header">
            <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="task-badge priority-${task.priority.toLowerCase()}">
                        ${priorityIcon} ${task.priority}
                    </span>
                    ${task.dueDate ? `<span class="task-badge task-due-date">📅 ${formatDate(task.dueDate)}</span>` : ''}
                    ${task.from ? `<span class="task-badge task-from">👤 ${escapeHtml(task.from)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('change', (e) => {
        task.completed = e.target.checked;
        div.classList.toggle('completed', task.completed);
    });
    
    return div;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';
    
    const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil <= 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}

function clearAll() {
    document.getElementById('emailInput').value = '';
    document.getElementById('taskList').innerHTML = '';
    document.getElementById('taskList').classList.remove('visible');
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('taskCount').textContent = '0 tasks';
    document.getElementById('calendarSection').style.display = 'none';
    tasks = [];
    showStatus('Cleared', 'success');
}

// Calendar Functions
function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const calendarTitle = document.getElementById('calendarTitle');
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Set title
    calendarTitle.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers (Mon-Fri only)
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Get today in UTC
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log('Rendering work week calendar for:', year, month);
    console.log('Today (UTC):', todayStr);
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Find first Monday of the month (or before)
    let startDay = 1;
    let startDayOfWeek = firstDay;
    
    // If month doesn't start on Monday, go back to previous Monday
    if (startDayOfWeek === 0) { // Sunday
        startDay = -5; // Go back to Monday
    } else if (startDayOfWeek > 1) { // Tue-Sat
        startDay = 2 - startDayOfWeek; // Go back to Monday
    }
    
    // Render weeks (show up to 6 weeks to cover all days)
    for (let week = 0; week < 6; week++) {
        let hasValidDays = false;
        
        // Render Mon-Fri for this week
        for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
            const day = startDay + (week * 7) + (dayOfWeek - 1);
            
            if (day < 1 || day > daysInMonth) {
                // Skip days outside current month
                continue;
            }
            
            hasValidDays = true;
            const dayEl = createCalendarDay(day, month, year, false, todayStr);
            calendar.appendChild(dayEl);
        }
        
        // Stop if we've gone past the month
        if (!hasValidDays && week > 0) break;
    }
}

function createCalendarDay(day, month, year, isOtherMonth, todayStr) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    
    // Create date string in YYYY-MM-DD format
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (dateStr === todayStr) {
        dayEl.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    // Find tasks for this day
    const dayTasks = tasks.filter(task => task.dueDate === dateStr);
    
    console.log(`Day ${dateStr}: ${dayTasks.length} tasks`);
    
    if (dayTasks.length > 0) {
        dayEl.classList.add('has-tasks');
        
        // Create container for dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'calendar-task-dots';
        
        // Show all tasks as dots (limit to 12 to avoid overflow)
        dayTasks.slice(0, 12).forEach(task => {
            const dot = document.createElement('div');
            dot.className = `calendar-task-dot priority-${task.priority.toLowerCase()}`;
            dot.title = `${task.title} (${task.priority})`; // Tooltip shows task name
            dotsContainer.appendChild(dot);
        });
        
        dayEl.appendChild(dotsContainer);
    }
    
    return dayEl;
}
