const apiUrl = 'http://localhost:8080/api/tutorials';
const authUrl = 'http://localhost:8080/api/auth/login';
const tokenKey = 'codegallery-token';
const languageTitlesKey = 'codegallery-language-titles';

const loginPanel = document.getElementById('login-panel');
const registerPanel = document.getElementById('register-panel');
const welcomePanel = document.getElementById('welcome-panel');
const dashboard = document.getElementById('dashboard');
const roleWelcome = document.getElementById('role-welcome');
const roleWelcomeTitle = document.getElementById('role-welcome-title');
const roleWelcomeDescription = document.getElementById('role-welcome-description');
const contentManagerHeader = document.getElementById('content-manager-header');
const contentManagerTitle = document.getElementById('content-manager-title');
const languagePage = document.getElementById('language-page');
const languagePageTitle = document.getElementById('language-page-title');
const languageSidebar = document.getElementById('language-sidebar');
const languageContent = document.getElementById('language-content');
const languagePageBack = document.getElementById('language-page-back');
const topNav = document.getElementById('top-nav');
const languageMenu = document.getElementById('language-menu');
const selectedLanguage = document.getElementById('selected-language');
const languageSelect = document.getElementById('language-select');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const statusEl = document.getElementById('status');
const tutorialForm = document.getElementById('tutorial-form');
const signInBtn = document.getElementById('signin-btn');
const logoutBtn = document.getElementById('logout-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const homeNavLink = document.getElementById('home-nav-link');
const addContentLink = document.getElementById('add-content-link');
const addTutorialNavLink = document.getElementById('add-tutorial-nav-link');
const addTutorialPanel = document.getElementById('add-tutorial');
const managementLanguageControl = document.getElementById('management-language-control');
const modificationBar = document.getElementById('modification-bar');
const modificationMessage = document.getElementById('modification-message');
const modificationPanels = document.querySelectorAll('.modification-panel');
const editTutorialForm = document.getElementById('edit-tutorial-form');
const deleteTutorialForm = document.getElementById('delete-tutorial-form');
const editTutorialSelect = document.getElementById('edit-tutorial-select');
const deleteTutorialSelect = document.getElementById('delete-tutorial-select');
const managementLanguageSelect = document.getElementById('management-language-select');
const addContentForm = document.getElementById('add-content-form');
const addContentTitle = document.getElementById('add-content-title');
const editContentForm = document.getElementById('edit-content-form');
const deleteContentForm = document.getElementById('delete-content-form');
const editContentHeader = document.getElementById('edit-content-header');
const editContentSubHeader = document.getElementById('edit-content-sub-header');
const editContentHeaderText = document.getElementById('edit-content-header-text');
const editContentSubHeaderText = document.getElementById('edit-content-sub-header-text');
const editContentDescription = document.getElementById('edit-content-description');
const deleteContentHeader = document.getElementById('delete-content-header');
const deleteContentSubHeader = document.getElementById('delete-content-sub-header');
const deleteContentDescription = document.getElementById('delete-content-description');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmationAccept = document.getElementById('confirmation-accept');
const confirmationCancel = document.getElementById('confirmation-cancel');
let tutorialCache = [];
let selectedLanguagePage = false;
let activeLanguage = '';
let customContent = JSON.parse(localStorage.getItem('codegallery-content') || '{}');
const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');

function getStoredLanguageTitles() {
  try {
    const storedTitles = JSON.parse(localStorage.getItem(languageTitlesKey) || '[]');
    return Array.isArray(storedTitles) ? storedTitles.filter(Boolean) : [];
  } catch (error) {
    console.error('Unable to read stored language titles.', error);
    return [];
  }
}

function renderLanguageMenu() {
  if (!languageSelect) return;

  const displayedLanguages = Array.from(
    languageMenu.querySelectorAll('a[data-language]')
  ).map((link) => link.dataset.language);
  const existingMoreLanguages = Array.from(languageSelect.options)
    .map((option) => option.value)
    .filter(Boolean);
  const knownLanguages = [
    ...displayedLanguages,
    ...existingMoreLanguages,
    ...tutorialCache.map((tutorial) => tutorial.title),
    ...getStoredLanguageTitles()
  ];
  const availableLanguages = [...new Set(knownLanguages)]
    .filter((language) => language && !displayedLanguages.includes(language));

  languageSelect.innerHTML = '<option value="">More Languages</option>';
  availableLanguages.forEach((language) => {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = language;
    languageSelect.appendChild(option);
  });
}

renderLanguageMenu();

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function clearLoginError() {
  const existingError = loginForm.querySelector('.error-text');
  if (existingError) existingError.remove();
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function isAuthenticated() {
  return Boolean(getToken());
}

function canManageTutorials() {
  return ['ADMIN', 'ROLE_ADMIN', 'CO_USER', 'ROLE_CO_USER']
    .includes(localStorage.getItem('codegallery-role'));
}

function updateTutorialManagementVisibility() {
  const canManage = isAuthenticated() && canManageTutorials();
  addTutorialNavLink.classList.toggle('hidden', !canManage);
  addTutorialPanel.classList.toggle('hidden', !canManage);
  managementLanguageControl.classList.toggle('hidden', !canManage);
  modificationBar.classList.toggle('hidden', !canManage);
  addContentLink.classList.toggle('hidden', !(canManage && selectedLanguagePage));
}

function setModificationMessage(message, isError = false) {
  modificationMessage.textContent = message;
  modificationMessage.style.color = isError ? 'var(--danger)' : '#166534';
}

function populateTutorialSelectors() {
  const languageOptions = Array.from(
    managementLanguageSelect.querySelectorAll('option:not([data-tutorial-option])')
  ).filter((option) => option.value).map((option) =>
    `<option value="language:${option.value}" disabled>${option.textContent}</option>`
  ).join('');
  const tutorialOptions = tutorialCache.map((tutorial) =>
    `<option value="${tutorial.id}">${tutorial.title}</option>`
  ).join('');
  const options = `
    <option value="">Select tutorial title</option>
    <optgroup label="Languages">${languageOptions}</optgroup>
    <optgroup label="Tutorial Titles">${tutorialOptions}</optgroup>
  `;
  editTutorialSelect.innerHTML = options;
  deleteTutorialSelect.innerHTML = options;

  const titleOptions = tutorialCache.map((tutorial) =>
    `<option value="tutorial:${tutorial.id}">${tutorial.title}</option>`
  ).join('');
  managementLanguageSelect.querySelectorAll('option[data-tutorial-option]').forEach((option) => option.remove());
  managementLanguageSelect.insertAdjacentHTML('beforeend', titleOptions.replace(/<option/g, '<option data-tutorial-option'));
}

function showModificationTab(tabName) {
  const suffix = selectedLanguagePage ? 'content' : 'tutorial';
  roleWelcome.classList.add('hidden');
  modificationBar.classList.toggle('hidden', !(isAuthenticated() && canManageTutorials()));
  modificationPanels.forEach((panel) => panel.classList.toggle('hidden', panel.id !== `${tabName}-${suffix}`));
  document.querySelectorAll('.modification-tab').forEach((tab) =>
    tab.classList.toggle('active', tab.dataset.tab === tabName)
  );
  setModificationMessage('');
}

function getContentSections() {
  if (!customContent[activeLanguage]) {
    const defaults = tutorialTopics[activeLanguage] || languageTopics[activeLanguage] || [
      ['Overview', 'Introduction', `Explore the purpose and common uses of ${activeLanguage}.`],
      ['Core Concepts', 'Fundamentals', `Learn the fundamental concepts and syntax of ${activeLanguage}.`],
      ['Practical Work', 'Examples', `Build practical solutions with ${activeLanguage}.`],
      ['Best Practices', 'Guidelines', `Write clear, maintainable, and reliable ${activeLanguage} code.`]
    ];
    customContent[activeLanguage] = defaults.map(([header, subHeader, description]) => ({
      header,
      subHeader,
      description
    }));
    persistCustomContent();
  }
  return customContent[activeLanguage];
}

function populateContentSelectors() {
  const options = getContentSections().map((item, index) =>
    `<option value="${index}">${item.header} - ${item.subHeader}</option>`
  ).join('');
  editContentHeader.innerHTML = `<option value="">Select header</option>${options}`;
  deleteContentHeader.innerHTML = `<option value="">Select header</option>${options}`;
  editContentSubHeader.innerHTML = '<option value="">Select sub-header</option>';
  deleteContentSubHeader.innerHTML = '<option value="">Select sub-header</option>';
  editContentDescription.value = '';
  deleteContentDescription.value = '';
}

function fillContentFields(headerSelect, subHeaderSelect, descriptionField) {
  const item = getContentSections()[Number(headerSelect.value)];
  subHeaderSelect.innerHTML = item
    ? `<option value="${headerSelect.value}">${item.subHeader}</option>`
    : '<option value="">Select sub-header</option>';
  descriptionField.value = item ? item.description : '';
  if (headerSelect === editContentHeader) {
    editContentHeaderText.value = item ? item.header : '';
    editContentSubHeaderText.value = item ? item.subHeader : '';
  }
}

function persistCustomContent() {
  localStorage.setItem('codegallery-content', JSON.stringify(customContent));
}

function fillEditTutorial() {
  const tutorial = tutorialCache.find((item) => String(item.id) === editTutorialSelect.value);
  if (!tutorial) return;
  document.getElementById('edit-title').value = tutorial.title;
  document.getElementById('edit-level').value = tutorial.level;
  document.getElementById('edit-tutorial-description').value = tutorial.content;
}

function askConfirmation(message) {
  confirmationMessage.textContent = message;
  confirmationModal.classList.remove('hidden');
  return new Promise((resolve) => {
    const finish = (result) => {
      confirmationModal.classList.add('hidden');
      confirmationAccept.removeEventListener('click', accept);
      confirmationCancel.removeEventListener('click', cancel);
      resolve(result);
    };
    const accept = () => finish(true);
    const cancel = () => finish(false);
    confirmationAccept.addEventListener('click', accept);
    confirmationCancel.addEventListener('click', cancel);
  });
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function toggleAuthButtons(isAuthenticatedState) {
  if (!signInBtn || !logoutBtn) return;
  signInBtn.classList.toggle('hidden', isAuthenticatedState);
  logoutBtn.classList.toggle('hidden', !isAuthenticatedState);
}

function showLogin() {
  selectedLanguagePage = false;
  document.body.classList.remove('language-view');
  document.title = 'CodeGallery Dashboard';
  welcomePanel.classList.add('hidden');
  languagePage.classList.add('hidden');
  loginPanel.classList.remove('hidden');
  registerPanel.classList.add('hidden');
  dashboard.classList.add('hidden');
  topNav.classList.remove('hidden');
  languageMenu.classList.add('hidden');
  managementLanguageControl.classList.add('hidden');
  modificationBar.classList.add('hidden');
  contentManagerHeader.classList.add('hidden');
  addContentLink.classList.add('hidden');
  toggleAuthButtons(false);
  updateTutorialManagementVisibility();
}

function showRegister() {
  selectedLanguagePage = false;
  document.body.classList.remove('language-view');
  document.title = 'CodeGallery Dashboard';
  welcomePanel.classList.add('hidden');
  languagePage.classList.add('hidden');
  loginPanel.classList.add('hidden');
  registerPanel.classList.remove('hidden');
  dashboard.classList.add('hidden');
  topNav.classList.remove('hidden');
  languageMenu.classList.add('hidden');
  managementLanguageControl.classList.add('hidden');
  modificationBar.classList.add('hidden');
  contentManagerHeader.classList.add('hidden');
  addContentLink.classList.add('hidden');
  toggleAuthButtons(false);
  updateTutorialManagementVisibility();
}

function showSignedOutView() {
  selectedLanguagePage = false;
  document.body.classList.remove('language-view');
  document.title = 'CodeGallery Dashboard';
  welcomePanel.classList.remove('hidden');
  languagePage.classList.add('hidden');
  loginPanel.classList.add('hidden');
  registerPanel.classList.add('hidden');
  dashboard.classList.add('hidden');
  topNav.classList.remove('hidden');
  languageMenu.classList.remove('hidden');
  managementLanguageControl.classList.add('hidden');
  modificationBar.classList.add('hidden');
  contentManagerHeader.classList.add('hidden');
  addContentLink.classList.add('hidden');
  toggleAuthButtons(false);
  updateTutorialManagementVisibility();
}

function showHome() {
  selectedLanguagePage = false;
  document.body.classList.remove('language-view');
  document.title = 'CodeGallery Dashboard';
  welcomePanel.classList.remove('hidden');
  languagePage.classList.add('hidden');
  loginPanel.classList.add('hidden');
  registerPanel.classList.add('hidden');
  dashboard.classList.add('hidden');
  topNav.classList.remove('hidden');
  languageMenu.classList.remove('hidden');
  managementLanguageControl.classList.add('hidden');
  modificationBar.classList.add('hidden');
  contentManagerHeader.classList.add('hidden');
  toggleAuthButtons(isAuthenticated());
  updateTutorialManagementVisibility();
  managementLanguageControl.classList.add('hidden');
  modificationBar.classList.add('hidden');
  addContentLink.classList.add('hidden');
}

function showDashboard() {
  selectedLanguagePage = false;
  document.body.classList.remove('language-view');
  document.title = 'CodeGallery Dashboard';
  welcomePanel.classList.add('hidden');
  languagePage.classList.add('hidden');
  loginPanel.classList.add('hidden');
  registerPanel.classList.add('hidden');
  dashboard.classList.remove('hidden');
  topNav.classList.remove('hidden');
  languageMenu.classList.toggle('hidden', canManageTutorials());
  toggleAuthButtons(true);
  updateTutorialManagementVisibility();
  addContentLink.classList.add('hidden');
  modificationBar.classList.add('hidden');
  contentManagerHeader.classList.add('hidden');
  roleWelcome.classList.remove('hidden');
  roleWelcomeTitle.textContent = `Welcome to ${String(localStorage.getItem('codegallery-role') || 'User').replace('ROLE_', '').replace('_', ' ')}`;
  roleWelcomeDescription.textContent = canManageTutorials()
    ? 'You can add, edit, and delete tutorials. Select a language to add, edit, or delete its content, and view the existing content.'
    : 'You can select a language to view tutorials and explore the existing learning content.';
  modificationPanels.forEach((panel) => panel.classList.add('hidden'));
  loadTutorials();
}

function showContentManager(tabName = 'add') {
  if (!canManageTutorials() || !activeLanguage) return;
  selectedLanguagePage = true;
  const title = `Welcome to ${activeLanguage} Language Content Page`;
  addContentTitle.textContent = 'Add Content';
  contentManagerTitle.textContent = title;
  contentManagerHeader.classList.remove('hidden');
  document.body.classList.remove('language-view');
  languagePage.classList.add('hidden');
  dashboard.classList.remove('hidden');
  updateTutorialManagementVisibility();
  showModificationTab(tabName);
}

const languageTopics = {
  Java: [
    ['Overview', 'What Java is', 'Java is a strongly typed, object-oriented language used for enterprise applications, Android development, and backend services.'],
    ['Core Syntax', 'Classes and methods', 'A Java program is organized into classes. Methods contain behavior, while fields contain object state.'],
    ['Collections', 'Lists, sets, and maps', 'The Collections Framework provides ArrayList, HashSet, and HashMap for storing and processing groups of values.'],
    ['Best Practices', 'Readable and safe code', 'Use meaningful names, immutable values where possible, interfaces for abstractions, and try-with-resources for resource cleanup.']
  ],
  'C#': [
    ['Overview', '.NET development', 'C# is a modern, strongly typed language used with .NET for web, desktop, cloud, game, and service development.'],
    ['Core Syntax', 'Types and methods', 'C# supports classes, structs, records, properties, methods, pattern matching, and nullable reference types.'],
    ['LINQ', 'Querying collections', 'LINQ provides readable queries for filtering, projecting, grouping, and sorting collections.'],
    ['Best Practices', 'Maintainable .NET code', 'Prefer async APIs for I/O, enable nullable warnings, keep classes focused, and use dependency injection for services.']
  ],
  Python: [
    ['Overview', 'Readable automation', 'Python is a dynamically typed language popular for automation, web services, testing, data analysis, and machine learning.'],
    ['Core Syntax', 'Functions and modules', 'Indentation defines blocks. Functions, modules, and packages help split programs into reusable units.'],
    ['Data Handling', 'Lists and dictionaries', 'Lists hold ordered values, while dictionaries map keys to values and are useful for structured application data.'],
    ['Best Practices', 'Clean Python', 'Follow PEP 8, use virtual environments, add type hints where useful, and handle exceptions narrowly.']
  ],
  HTML: [
    ['Overview', 'Web document structure', 'HTML defines the structure and meaning of web pages using elements such as headings, links, forms, and sections.'],
    ['Semantic HTML', 'Meaningful elements', 'Use header, nav, main, section, article, and footer elements to create accessible document structure.'],
    ['Forms', 'Collecting user input', 'Labels, input types, validation attributes, and accessible names make forms usable and reliable.'],
    ['Best Practices', 'Accessible markup', 'Use valid nesting, descriptive link text, alt text for images, and heading levels in logical order.']
  ],
  CSS: [
    ['Overview', 'Styling web pages', 'CSS controls layout, colors, typography, spacing, responsive behavior, and visual interaction states.'],
    ['Selectors', 'Targeting elements', 'Element, class, ID, attribute, and pseudo-class selectors apply styles to matching parts of a document.'],
    ['Layout', 'Flexbox and Grid', 'Flexbox handles one-dimensional alignment, while CSS Grid handles two-dimensional page and component layouts.'],
    ['Best Practices', 'Responsive design', 'Prefer reusable classes, logical spacing, accessible contrast, mobile-friendly layouts, and organized custom properties.']
  ],
  SQL: [
    ['Overview', 'Working with data', 'SQL is used to define, query, insert, update, and secure data in relational database systems.'],
    ['Queries', 'Select and filter', 'SELECT retrieves rows, WHERE filters them, ORDER BY sorts them, and JOIN combines related tables.'],
    ['Data Changes', 'Transactions', 'INSERT, UPDATE, and DELETE modify data. Transactions group changes so they can be committed or rolled back safely.'],
    ['Best Practices', 'Reliable queries', 'Use parameters, explicit columns, indexes for frequent filters, constraints, and transactions for related changes.']
  ],
  AI: [
    ['Overview', 'Artificial intelligence', 'AI systems use data and algorithms to perform tasks such as classification, prediction, generation, and language understanding.'],
    ['Machine Learning', 'Training and evaluation', 'Models learn patterns from training data and should be evaluated with data that was not used during training.'],
    ['Generative AI', 'Prompts and outputs', 'Generative models create text, code, images, or other content from learned patterns and user instructions.'],
    ['Best Practices', 'Responsible AI', 'Validate outputs, protect private data, monitor bias, document limitations, and keep humans involved in important decisions.']
  ],
  JavaScript: [
    ['Overview', 'The web programming language', 'JavaScript adds behavior to web pages and also powers servers, tools, and applications through modern runtimes.'],
    ['Core Syntax', 'Values and functions', 'Variables, objects, arrays, functions, modules, and asynchronous promises are core JavaScript building blocks.'],
    ['DOM and Events', 'Interactive pages', 'The DOM represents the page. Event listeners respond to user actions and update content without a full reload.'],
    ['Best Practices', 'Reliable scripts', 'Use const by default, validate external data, handle rejected promises, and keep UI logic separated into small functions.']
  ],
  TypeScript: [
    ['Overview', 'Typed JavaScript', 'TypeScript adds static type checking and modern language features while compiling to JavaScript for browser or server runtimes.'],
    ['Types', 'Interfaces and unions', 'Interfaces, type aliases, generics, and union types describe data and catch many errors before execution.'],
    ['Development', 'Compile and configure', 'A tsconfig file controls compiler targets, module behavior, strictness, and included source files.'],
    ['Best Practices', 'Safe application code', 'Use strict mode, avoid any, model API responses explicitly, and keep shared types close to their domain.']
  ],
  Go: [
    ['Overview', 'Simple concurrent services', 'Go is a compiled language designed for efficient services, command-line tools, networking, and cloud infrastructure.'],
    ['Core Syntax', 'Packages and structs', 'Go programs use packages. Structs model data, and methods attach behavior without traditional class inheritance.'],
    ['Concurrency', 'Goroutines and channels', 'Goroutines run functions concurrently, while channels provide a structured way to communicate between them.'],
    ['Best Practices', 'Idiomatic Go', 'Return errors explicitly, format with gofmt, keep packages focused, and use context for cancellation and deadlines.']
  ],
  Ruby: [
    ['Overview', 'Expressive application code', 'Ruby is an object-oriented language known for readable syntax, rapid development, and web applications.'],
    ['Core Syntax', 'Objects and blocks', 'Everything is an object in Ruby. Blocks, iterators, and methods make collection processing concise.'],
    ['Web Development', 'Ruby applications', 'Ruby web frameworks provide routing, templates, persistence, validation, and conventions for building maintainable applications.'],
    ['Best Practices', 'Clear Ruby', 'Prefer small methods, meaningful names, automated tests, dependency management, and explicit validation at boundaries.']
  ],
  PHP: [
    ['Overview', 'Server-side web development', 'PHP runs on the server and generates dynamic web responses, APIs, and application pages.'],
    ['Core Syntax', 'Variables and functions', 'PHP supports functions, classes, namespaces, typed properties, exceptions, and reusable packages.'],
    ['Web Requests', 'Forms and APIs', 'Validate request input, use appropriate HTTP methods, return useful status codes, and encode responses safely.'],
    ['Best Practices', 'Secure PHP', 'Escape output, use prepared statements, protect sessions, validate uploads, and keep secrets outside source code.']
  ],
  Kotlin: [
    ['Overview', 'Modern JVM development', 'Kotlin is a concise, null-safe language used for Android, backend, multiplatform, and JVM applications.'],
    ['Core Syntax', 'Classes and extensions', 'Kotlin provides data classes, properties, extension functions, sealed types, and concise collection operations.'],
    ['Coroutines', 'Structured asynchronous work', 'Coroutines simplify asynchronous code while keeping cancellation and execution scopes explicit.'],
    ['Best Practices', 'Null-safe Kotlin', 'Prefer immutable values, model nullable data deliberately, use sealed results, and avoid blocking coroutine contexts.']
  ],
  'C++': [
    ['Overview', 'High-performance software', 'C++ supports systems programming, games, embedded software, desktop applications, and performance-sensitive services.'],
    ['Core Syntax', 'Types and classes', 'C++ provides functions, classes, templates, references, pointers, and strong control over resource ownership.'],
    ['STL', 'Reusable containers', 'The Standard Template Library provides vector, map, set, algorithms, iterators, and smart pointers.'],
    ['Best Practices', 'Resource safety', 'Prefer RAII and smart pointers, initialize values, minimize raw ownership, and use tools such as sanitizers.']
  ]
};
const tutorialTopics = {};

function showLanguagePage(language) {
  selectedLanguagePage = true;
  activeLanguage = language;
  contentManagerHeader.classList.add('hidden');
  document.body.classList.add('language-view');
  document.title = `Welcome to ${language} Tutorial`;
  welcomePanel.classList.add('hidden');
  loginPanel.classList.add('hidden');
  registerPanel.classList.add('hidden');
  dashboard.classList.add('hidden');
  languagePage.classList.remove('hidden');
  topNav.classList.remove('hidden');
  languagePageTitle.textContent = `Welcome to ${language} Tutorial`;
  const resolvedSections = getContentSections().map((item) => [
    item.header,
    item.subHeader,
    item.description
  ]);

  languageSidebar.innerHTML = resolvedSections.map(([header, subHeader], index) => `
    <a href="#language-section-${index}">${header}</a>
    <a class="sub-header" href="#language-subsection-${index}">${subHeader}</a>
  `).join('');
  languageContent.innerHTML = resolvedSections.map(([header, subHeader, content], index) => `
    <section id="language-section-${index}" class="language-section">
      <h3>${header}</h3>
      <p>${content}</p>
      <h4 id="language-subsection-${index}">${subHeader}</h4>
      <p>${content} Apply these concepts through small, testable exercises and review the result before moving to the next topic.</p>
    </section>
  `).join('');
  languageMenu.classList.toggle('hidden', canManageTutorials());
  managementLanguageControl.classList.toggle('hidden', !canManageTutorials());
  updateTutorialManagementVisibility();
  modificationBar.classList.add('hidden');
  modificationPanels.forEach((panel) => panel.classList.add('hidden'));
  populateContentSelectors();
}

async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Invalid username or password.');
    }

    const data = await response.json();
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem('codegallery-role', data.role);
    setStatus('Logged in successfully.');
    showDashboard();
  } catch (error) {
    const errorText = document.createElement('p');
    errorText.className = 'hint error-text';
    errorText.textContent = error.message || 'Login failed. Please check your credentials.';
    loginForm.appendChild(errorText);
    setStatus('Login failed.', true);
  }
}

function openLogin() {
  clearLoginError();
  showLogin();
}

function setRegisterMessage(message, isError = false) {
  if (!registerMessage) return;
  registerMessage.textContent = message;
  registerMessage.classList.toggle('error', isError);
  registerMessage.classList.toggle('success', !isError);
}

function clearRegisterMessage() {
  if (!registerMessage) return;
  registerMessage.textContent = '';
  registerMessage.classList.remove('error', 'success');
}

async function handleRegister(event) {
  event.preventDefault();
  clearRegisterMessage();

  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const mobileNo = document.getElementById('mobile-no').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const role = document.getElementById('register-role').value || 'END_USER';

  if (!firstName || !lastName || (!email && !mobileNo) || !password || !confirmPassword) {
    setRegisterMessage('Please fill in all required fields.', true);
    return;
  }

  if (password !== confirmPassword) {
    setRegisterMessage('Both passwords should match.', true);
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        mobileNo,
        password,
        confirmPassword,
        role
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    setRegisterMessage('Registration successful! Redirecting to login...', false);
    registerForm.reset();
    setTimeout(() => {
      showLogin();
      clearRegisterMessage();
    }, 1200);
  } catch (error) {
    setRegisterMessage(error.message || 'Registration failed. Please try again.', true);
  }
}

function logout() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem('codegallery-role');
  tutorialForm.reset();
  tutorialForm.dataset.editingId = '';
  tutorialForm.querySelector('button[type="submit"]').textContent = 'Save Tutorial';
  clearLoginError();
  showSignedOutView();
}

async function loadTutorials() {
  setStatus('Loading tutorials...');
  try {
    const response = await fetch(apiUrl, {
      headers: getAuthHeaders()
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) throw new Error('Failed to fetch tutorials');

    const tutorials = await response.json();
    tutorialCache = tutorials;
    localStorage.setItem(
      languageTitlesKey,
      JSON.stringify(tutorials.map((tutorial) => tutorial.title).filter(Boolean))
    );
    renderLanguageMenu();
    tutorials.forEach((tutorial) => {
      tutorialTopics[tutorial.title] = [
        ['Overview', 'Tutorial Description', tutorial.content],
        ['Difficulty', tutorial.level, `This tutorial is designed for ${String(tutorial.level).toLowerCase()} learners.`],
        ['Practice', 'Learning Activity', `Work through the ${tutorial.title} examples and verify each result.`],
        ['Best Practices', 'Key Takeaways', `Keep your ${tutorial.title} solutions clear, tested, and easy to maintain.`]
      ];
    });
    populateTutorialSelectors();

    if (!tutorials.length) {
      setStatus('');
      return;
    }

    setStatus('');
  } catch (error) {
    if (error.message && error.message.includes('Session expired')) {
      localStorage.removeItem(tokenKey);
      showSignedOutView();
      setStatus('Your session expired. Please log in again.', true);
      return;
    }
    setStatus('Unable to connect to backend. Start the Spring Boot app first.', true);
    setStatus('Unable to connect to backend. Start the Spring Boot app first.', true);
    console.error(error);
  }
}

async function updateTutorial(id, payload) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) throw new Error('Failed to update tutorial');
  return response.json();
}

async function deleteTutorial(id) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) throw new Error('Failed to delete tutorial');
}

function bindCardActions() {
  document.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const response = await fetch(`${apiUrl}/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
      const tutorial = await response.json();

      document.getElementById('title').value = tutorial.title;
      document.getElementById('level').value = tutorial.level;
      document.getElementById('content').value = tutorial.content;

      tutorialForm.dataset.editingId = id;
      tutorialForm.querySelector('button[type="submit"]').textContent = 'Update Tutorial';
      setStatus('Editing tutorial...');
    });
  });

  document.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      if (!await askConfirmation('Delete this tutorial?')) return;

      try {
        await deleteTutorial(id);
        setStatus('Tutorial deleted.');
        loadTutorials();
      } catch (error) {
        if (error.message && error.message.includes('Session expired')) {
          localStorage.removeItem(tokenKey);
          showSignedOutView();
          setStatus('Your session expired. Please log in again.', true);
          return;
        }

        setStatus('Failed to delete tutorial.', true);
        console.error(error);
      }
    });
  });
}

tutorialForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const level = document.getElementById('level').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !level || !content) {
    setStatus('Please fill in all fields.', true);
    return;
  }

  const payload = { title, level, content };
  const action = tutorialForm.dataset.editingId ? 'update' : 'save';
  if (!await askConfirmation(`${action === 'save' ? 'Save' : 'Update'} tutorial "${title}"?`)) return;

  try {
    if (tutorialForm.dataset.editingId) {
      await updateTutorial(tutorialForm.dataset.editingId, payload);
      setStatus('Tutorial updated successfully!');
      setModificationMessage(`Tutorial "${title}" successfully edited.`);
    } else {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
      if (!response.ok) throw new Error('Failed to save tutorial');
      setStatus('Tutorial saved successfully!');
      setModificationMessage(`Tutorial "${title}" successfully saved.`);
    }

    tutorialForm.reset();
    tutorialForm.dataset.editingId = '';
    tutorialForm.querySelector('button[type="submit"]').textContent = 'Save Tutorial';
    loadTutorials();
  } catch (error) {
    if (error.message && error.message.includes('Session expired')) {
      localStorage.removeItem(tokenKey);
      showSignedOutView();
      setStatus('Your session expired. Please log in again.', true);
      return;
    }

    setStatus('Unable to save tutorial. Check backend connection.', true);
    console.error(error);
  }
});

document.querySelectorAll('.modification-tab').forEach((tab) => {
  tab.addEventListener('click', () => showModificationTab(tab.dataset.tab));
});

editTutorialSelect.addEventListener('change', fillEditTutorial);

editTutorialForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = editTutorialSelect.value;
  const title = document.getElementById('edit-title').value.trim();
  const level = document.getElementById('edit-level').value;
  const content = document.getElementById('edit-content').value.trim();

  if (!id || !title || !level || !content) {
    setModificationMessage('Please fill in all edit fields.', true);
    return;
  }
  if (!await askConfirmation(`Update tutorial "${title}"?`)) return;

  try {
    await updateTutorial(id, { title, level, content });
    setModificationMessage(`Tutorial "${title}" successfully edited.`);
    await loadTutorials();
  } catch (error) {
    setModificationMessage(error.message || 'Unable to edit tutorial.', true);
  }
});

deleteTutorialForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = deleteTutorialSelect.value;
  const tutorial = tutorialCache.find((item) => String(item.id) === id);
  if (!tutorial) {
    setModificationMessage('Please select a tutorial to delete.', true);
    return;
  }
  if (!await askConfirmation(`Delete tutorial "${tutorial.title}"?`)) return;

  try {
    await deleteTutorial(id);
    setModificationMessage(`Tutorial "${tutorial.title}" successfully deleted.`);
    await loadTutorials();
  } catch (error) {
    setModificationMessage(error.message || 'Unable to delete tutorial.', true);
  }
});

editContentHeader.addEventListener('change', () => {
  fillContentFields(editContentHeader, editContentSubHeader, editContentDescription);
});

deleteContentHeader.addEventListener('change', () => {
  fillContentFields(deleteContentHeader, deleteContentSubHeader, deleteContentDescription);
});

addContentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const header = document.getElementById('content-header').value.trim();
  const subHeader = document.getElementById('content-sub-header').value.trim();
  const description = document.getElementById('content-description').value.trim();
  if (!header || !subHeader || !description) {
    setModificationMessage('Please fill in the header, sub-header, and description.', true);
    return;
  }
  if (!await askConfirmation(`Save content "${header}"?`)) return;
  customContent[activeLanguage] = getContentSections().concat({ header, subHeader, description });
  localStorage.setItem('codegallery-content', JSON.stringify(customContent));
  addContentForm.reset();
  setModificationMessage(`Content "${header}" successfully saved.`);
  showLanguagePage(activeLanguage);
});

editContentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const index = Number(editContentHeader.value);
  const item = getContentSections()[index];
  if (!item) {
    setModificationMessage('Please select content to edit.', true);
    return;
  }
  const header = editContentHeaderText.value.trim();
  const subHeader = editContentSubHeaderText.value.trim();
  if (!header || !subHeader) {
    setModificationMessage('Header and sub-header are required.', true);
    return;
  }
  if (!await askConfirmation(`Update content "${header}"?`)) return;
  item.header = header;
  item.subHeader = subHeader;
  item.description = editContentDescription.value.trim();
  if (!item.description) {
    setModificationMessage('Description is required.', true);
    return;
  }
  persistCustomContent();
  setModificationMessage(`Content "${item.header}" successfully edited.`);
  showLanguagePage(activeLanguage);
});

deleteContentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const index = Number(deleteContentHeader.value);
  const item = getContentSections()[index];
  if (!item) {
    setModificationMessage('Please select content to delete.', true);
    return;
  }
  if (!await askConfirmation(`Delete content "${item.header}"?`)) return;
  customContent[activeLanguage].splice(index, 1);
  persistCustomContent();
  setModificationMessage(`Content "${item.header}" successfully deleted.`);
  showLanguagePage(activeLanguage);
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
registerLink.addEventListener('click', (event) => {
  event.preventDefault();
  showRegister();
});
loginLink.addEventListener('click', (event) => {
  event.preventDefault();
  showLogin();
});
signInBtn.addEventListener('click', openLogin);
logoutBtn.addEventListener('click', logout);
getStartedBtn.addEventListener('click', openLogin);
homeNavLink.addEventListener('click', (event) => {
  event.preventDefault();
  showHome();
});
addContentLink.addEventListener('click', (event) => {
event.preventDefault();
showContentManager('add');
});
addTutorialNavLink.addEventListener('click', (event) => {
  event.preventDefault();
  selectedLanguagePage = false;
  showDashboard();
  showModificationTab('add');
});
languageSelect.addEventListener('change', () => {
  if (!languageSelect.value) return;
  const selectedOption = languageSelect.options[languageSelect.selectedIndex];
  const previousLanguage = selectedLanguage.textContent;
  const selectedLanguageValue = selectedOption.value;

  selectedLanguage.textContent = selectedLanguageValue;
  selectedOption.value = previousLanguage;
  selectedOption.textContent = previousLanguage;
  languageSelect.value = '';
  showLanguagePage(selectedLanguageValue);
});

document.querySelectorAll('[data-language]').forEach((languageLink) => {
  languageLink.addEventListener('click', (event) => {
    event.preventDefault();
    showLanguagePage(languageLink.dataset.language);
  });
});

document.getElementById('management-language-select').addEventListener('change', (event) => {
  if (event.target.value.startsWith('tutorial:')) {
    const tutorialId = event.target.value.substring('tutorial:'.length);
    const tutorial = tutorialCache.find((item) => String(item.id) === tutorialId);
    if (tutorial) showLanguagePage(tutorial.title);
  } else if (event.target.value) {
    showLanguagePage(event.target.value);
  }
  event.target.value = '';
});

languagePageBack.addEventListener('click', () => {
  if (isAuthenticated()) {
    showDashboard();
  } else {
    showSignedOutView();
  }
});

if (isAuthenticated()) {
  showDashboard();
} else {
  showSignedOutView();
}
