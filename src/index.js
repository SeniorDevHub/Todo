import './style.css';
import display from './methods.js';
import Interactive from './interactive.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');
const filterTasks = document.getElementById('filterTasks');
const themeToggle = document.getElementById('themeToggle');

inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  display.addLists(addList.value);
  addList.value = '';
});

document.querySelector('#btnClear').addEventListener('click', Interactive.clearCompletedToDoLists);

filterTasks.addEventListener('change', () => {
  display.showLists(filterTasks.value);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

window.addEventListener('load', () => {
  // Apply saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  document.addEventListener('listUpdated', () => {
    Interactive.checkStatusEvent();
  }, false);
  Interactive.checkStatusEvent();
  display.showLists();
});