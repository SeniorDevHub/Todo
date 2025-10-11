// import _ from 'lodash';
import './style.css';

// import from src modules
import display from './methods.js';
import Interactive from './interactive.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');

inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  display.addLists(addList.value);
  addList.value = '';
});

document.querySelector('#btnClear').addEventListener('click', Interactive.clearCompletedToDoLists);

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const filter = e.target.dataset.filter;
    display.setFilter(filter);
  });
});

// Theme toggle functionality
document.getElementById('theme-toggle').addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const icon = document.querySelector('#theme-toggle i');
  icon.className = newTheme === 'dark' ? 'fa fa-sun icon' : 'fa fa-moon icon';
});

// Load saved theme on page load
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const icon = document.querySelector('#theme-toggle i');
  icon.className = savedTheme === 'dark' ? 'fa fa-sun icon' : 'fa fa-moon icon';
  
  document.addEventListener('listUpdated', () => {
    Interactive.checkStatusEvent();
  }, false);
  Interactive.checkStatusEvent();
});

display.showLists();