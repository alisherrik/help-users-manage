document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const toggle = document.querySelector('[data-testid="mobile-nav-toggle"]');
  const navLinks = document.querySelector('.nav-links');
  const siteShell = document.querySelector('.site-shell');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open');
      siteShell.classList.toggle('nav-open');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open') && 
        !navLinks.contains(e.target) && 
        !toggle.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      siteShell.classList.remove('nav-open');
    }
  });

  // Close mobile menu when clicking a link
  const navLinksList = document.querySelectorAll('.nav-links a');
  navLinksList.forEach(link => {
    link.addEventListener('click', () => {
      if (toggle && navLinks) {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        siteShell.classList.remove('nav-open');
      }
    });
  });

  // IntersectionObserver for scroll animations
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Add stagger effect to cards
        if (entry.target.classList.contains('feature-card')) {
          const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
          entry.target.style.transitionDelay = `${delay}ms`;
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
  
  const navHighlightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href').substring(1) === id) {
            item.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.5
  });

  sections.forEach(section => {
    navHighlightObserver.observe(section);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Task list interactions
  const taskList = document.querySelector('.task-list');
  const taskForm = document.querySelector('.task-form');
  const taskInput = document.querySelector('.task-input');
  const assigneeSelect = document.querySelector('.assignee-select');
  const deadlineInput = document.querySelector('.deadline-input');
  const addTaskBtn = document.querySelector('.add-task-btn');
  
  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  // Render tasks
  function renderTasks() {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks yet. Add your first task!</li>';
      return;
    }
    
    tasks.forEach((task, index) => {
      const taskItem = document.createElement('li');
      taskItem.className = 'task-item';
      taskItem.dataset.index = index;
      
      const taskContent = document.createElement('div');
      taskContent.className = 'task-content';
      
      const taskCheckbox = document.createElement('input');
      taskCheckbox.type = 'checkbox';
      taskCheckbox.className = 'task-checkbox';
      taskCheckbox.checked = task.completed;
      taskCheckbox.addEventListener('change', () => toggleTask(index));
      
      const taskText = document.createElement('span');
      taskText.className = 'task-text';
      taskText.textContent = task.text;
      if (task.completed) {
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
      }
      
      const taskMeta = document.createElement('div');
      taskMeta.className = 'task-meta';
      
      const taskAssignee = document.createElement('span');
      taskAssignee.className = 'task-assignee';
      taskAssignee.textContent = task.assignee;
      
      const taskDeadline = document.createElement('span');
      taskDeadline.className = 'task-deadline';
      taskDeadline.textContent = task.deadline;
      
      const taskActions = document.createElement('div');
      taskActions.className = 'task-actions';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'task-btn edit-btn';
      editBtn.innerHTML = '✏️';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.addEventListener('click', () => editTask(index));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-btn delete-btn';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.addEventListener('click', () => deleteTask(index));
      
      taskMeta.appendChild(taskAssignee);
      taskMeta.appendChild(taskDeadline);
      taskActions.appendChild(editBtn);
      taskActions.appendChild(deleteBtn);
      
      taskContent.appendChild(taskCheckbox);
      taskContent.appendChild(taskText);
      taskContent.appendChild(taskMeta);
      
      taskItem.appendChild(taskContent);
      taskItem.appendChild(taskActions);
      
      taskList.appendChild(taskItem);
    });
  }
  
  // Add task
  function addTask() {
    if (!taskInput || !assigneeSelect || !deadlineInput) return;
    
    const text = taskInput.value.trim();
    const assignee = assigneeSelect.value;
    const deadline = deadlineInput.value;
    
    if (text === '') {
      taskInput.classList.add('error');
      return;
    }
    
    const newTask = {
      text,
      assignee,
      deadline,
      completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Reset form
    taskInput.value = '';
    assigneeSelect.value = '';
    deadlineInput.value = '';
  }
  
  // Toggle task completion
  function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }
  
  // Edit task
  function editTask(index) {
    const task = tasks[index];
    const newText = prompt('Edit task:', task.text);
    
    if (newText !== null && newText.trim() !== '') {
      tasks[index].text = newText.trim();
      saveTasks();
      renderTasks();
    }
  }
  
  // Delete task
  function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }
  }
  
  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  // Add event listener for adding tasks
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', addTask);
  }
  
  // Handle form submission
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask();
    });
  }
  
  // Initial render of tasks
  renderTasks();

  // Login form validation
  const loginForm = document.querySelector('.login-form');
  const emailInput = document.querySelector('.email-input');
  const passwordInput = document.querySelector('.password-input');
  const loginBtn = document.querySelector('.login-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      validateLoginForm();
    });
    
    // Real-time validation
    if (emailInput) {
      emailInput.addEventListener('blur', validateEmail);
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('blur', validatePassword);
    }
  }
  
  function validateEmail() {
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      emailInput.classList.add('error');
      emailInput.nextElementSibling.textContent = 'Please enter a valid email address';
      return false;
    } else {
      emailInput.classList.remove('error');
      emailInput.nextElementSibling.textContent = '';
      return true;
    }
  }
  
  function validatePassword() {
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    
    if (password.length < 8) {
      passwordInput.classList.add('error');
      passwordInput.nextElementSibling.textContent = 'Password must be at least 8 characters';
      return false;
    } else {
      passwordInput.classList.remove('error');
      passwordInput.nextElementSibling.textContent = '';
      return true;
    }
  }
  
  function validateLoginForm() {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (isEmailValid && isPasswordValid) {
      // Simulate login
      loginBtn.textContent = 'Logging in...';
      loginBtn.disabled = true;
      
      setTimeout(() => {
        alert('Login successful! (This is a demo)');
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
        loginForm.reset();
      }, 1500);
    }
  }

  // Metrics charts
  const charts = document.querySelectorAll('.chart-container');
  
  function drawChart(canvas, type, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up chart dimensions
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border');
    ctx.stroke();
    
    // Draw chart based on type
    if (type === 'bar') {
      const barWidth = chartWidth / data.length * 0.6;
      const maxValue = Math.max(...data.map(d => d.value));
      
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = padding + (index * chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
        const y = height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text');
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);
        
        // Draw value
        ctx.fillText(item.value, x + barWidth / 2, y - 5);
      });
    } else if (type === 'pie') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      
      let total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = -Math.PI / 2;
      
      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * Math.PI * 2;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        // Use different colors for each slice
        const hue = (index * 360 / data.length) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, labelX, labelY);
        
        currentAngle += sliceAngle;
      });
    }
  }
  
  // Initialize charts
  charts.forEach(chartContainer => {
    const canvas = chartContainer.querySelector('canvas');
    const chartType = chartContainer.dataset.chartType;
    const chartData = JSON.parse(chartContainer.dataset.chartData);
    
    if (canvas && chartType && chartData) {
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Draw chart
      drawChart(canvas, chartType, chartData);
      
      // Redraw on resize
      window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawChart(canvas, chartType, chartData);
      });
    }
  });
});