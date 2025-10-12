import './style.css';

// import from src modules
import display from './methods.js';
import Interactive from './interactive.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');
const addDueDate = document.getElementById('addDueDate');
const addDescription = document.getElementById('addDescription');
let currentFilter = 'all';

// Theme management
const themeToggle = document.getElementById('themeToggle');
const { body } = document;

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fa fa-sun';
  } else {
    icon.className = 'fa fa-moon';
  }
}

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle event
themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.remove('active');
    });

    // Add active class to clicked button
    e.target.classList.add('active');

    // Update current filter and refresh the list
    currentFilter = e.target.dataset.filter;
    display.showLists(currentFilter);
  });
});

inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = addList.value.trim();
  const dueDate = addDueDate.value || null;
  const description = addDescription.value.trim();

  if (title) {
    display.addLists(title, dueDate, description);

    // Clear form
    addList.value = '';
    addDueDate.value = '';
    addDescription.value = '';

    // Refresh with current filter
    display.showLists(currentFilter);
  }
});

document.querySelector('#btnClear').addEventListener('click', () => {
  Interactive.clearCompletedToDoLists();
  display.showLists(currentFilter);
});

window.addEventListener('load', () => {
  document.addEventListener(
    'listUpdated',
    () => {
      Interactive.checkStatusEvent();
    },
    false,
  );
  Interactive.checkStatusEvent();
});

display.showLists(currentFilter);
