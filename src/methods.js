import DataList from './datalist.js';

export default class display {
  static getToDoListFromStorage = () => {
    let toDoLists;
    if (JSON.parse(localStorage.getItem('LocalDataList')) === null) {
      toDoLists = [];
    } else {
      toDoLists = JSON.parse(localStorage.getItem('LocalDataList'));
    }
    return toDoLists;
  };

  static addListToStorage = (toDoLists) => {
    localStorage.setItem('LocalDataList', JSON.stringify(toDoLists));
  };

  static newIndexNum = (toDoLists) => {
    toDoLists.forEach((item, i) => {
      item.index = i + 1;
    });
  }

  static deleteListData = (id) => {
    let toDoLists = this.getToDoListFromStorage();
    toDoLists = toDoLists.filter((_, index) => index !== id);
    this.newIndexNum(toDoLists);
    this.addListToStorage(toDoLists);
  };

  static ListInputUpdate = (newDescription, id) => {
    const toDoLists = this.getToDoListFromStorage();
    if (toDoLists[id]) {
      toDoLists[id].description = newDescription;
      this.addListToStorage(toDoLists);
      this.showLists(document.getElementById('filterTasks').value);
    }
  };

  static removeToDoListBtn = () => {
    document.querySelectorAll('.remove_btn').forEach((button) => button.addEventListener('click', (event) => {
      event.preventDefault();
      let id = button.id ? Number(button.id) - 1 : 0;
      this.deleteListData(id);
      this.showLists(document.getElementById('filterTasks').value);
    }));
  };

  static toDoListsHtml = ({ description, index, completed }, statusCheck, statusCompleted) => {
    const ul = document.createElement('ul');
    ul.className = 'to-do';
    ul.innerHTML = `
      <li><input class="checkbox" id="${index}" type="checkbox" ${statusCheck}></li> 
      <li><input id="LIST${index}" type="text" class="text ${statusCompleted}" value="${description}" readonly></li>
      <li class="remove-edit">
        <button class="edit_list_btn" id="${index}"><i class="fa fa-ellipsis-v icon"></i></button>
        <button class="remove_btn" id="${index}"><i class="fa fa-trash-can icon"></i></button>
      </li>
    `;
    return ul;
  }

  static showLists = (filter = 'all') => {
    let toDoLists = this.getToDoListFromStorage();
    if (filter === 'achieved') {
      toDoLists = toDoLists.filter(item => item.completed);
    } else if (filter === 'todo') {
      toDoLists = toDoLists.filter(item => !item.completed);
    }

    document.querySelector('.toDoListContainer').innerHTML = '';
    toDoLists.forEach((item) => {
      const statusCheck = item.completed ? 'checked' : '';
      const statusCompleted = item.completed ? 'completed' : '';
      document.querySelector('.toDoListContainer').appendChild(this.toDoListsHtml(item, statusCheck, statusCompleted));
    });

    this.removeToDoListBtn();
    this.editListBtnEvent();
    this.updateListBtnEvent();

    const event = new Event('listUpdated');
    document.dispatchEvent(event);
  };

  static addLists = (description) => {
    const toDoLists = this.getToDoListFromStorage();
    const index = toDoLists.length + 1;
    const newtask = new DataList(description, false, index);
    toDoLists.push(newtask);
    this.addListToStorage(toDoLists);
    this.showLists(document.getElementById('filterTasks').value);
  }

  static updateListBtnEvent = () => {
    document.querySelectorAll('.text').forEach((input) => input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const listID = input.id.replace('LIST', '');
        input.setAttribute('readonly', 'readonly');
        this.ListInputUpdate(input.value, Number(listID) - 1);
      }
    }));
  }

  static editListBtnEvent = () => {
    let previousList = null;
    document.querySelectorAll('.edit_list_btn').forEach((button) => button.addEventListener('click', (event) => {
      event.preventDefault();
      const listID = `LIST${event.currentTarget.id}`;
      const listItem = event.target.closest('li');
      const ulItem = event.target.closest('ul');

      if (previousList && previousList !== listItem) {
        const prevInput = previousList.querySelector('.text');
        if (prevInput) {
          prevInput.setAttribute('readonly', 'readonly');
          prevInput.closest('li').style.background = '';
          prevInput.closest('ul').style.background = '';
          prevInput.closest('.remove-edit').querySelector('.edit_list_btn').style.display = 'block';
          prevInput.closest('.remove-edit').querySelector('.remove_btn').style.display = 'none';
        }
      }

      listItem.style.background = 'rgb(230, 230, 184)';
      ulItem.style.background = 'rgb(230, 230, 184)';
      const input = document.getElementById(listID);
      input.removeAttribute('readonly');
      input.focus();
      input.style.background = 'rgb(230, 230, 184)';
      listItem.querySelector('.edit_list_btn').style.display = 'none';
      listItem.querySelector('.remove_btn').style.display = 'block';
      previousList = listItem;
    }));
  };
}