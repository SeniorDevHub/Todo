/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable indent */
/* eslint-disable no-tabs */
/* eslint-disable quotes */
// import from src modules folder

import DataList from "./datalist.js";

// get listed inputs from local storage

export default class display {
	static getToDoListFromStorage = () => {
		let toDoLists;

		if (JSON.parse(localStorage.getItem("LocalDataList")) === null) {
			toDoLists = [];
		} else {
			toDoLists = JSON.parse(localStorage.getItem("LocalDataList"));
		}
		return toDoLists;
	};

	// add listed inputs to the local storage
	static addListToStorage = (toDoLists) => {
		const item = JSON.stringify(toDoLists);
		localStorage.setItem("LocalDataList", item);
	};

	// index list inputs by number
	static newIndexNum = (toDoLists) => {
		toDoLists.forEach((item, i) => {
			item.index = i + 1;
		});
	};

	// delete from local storage
	static deleteListData = (id) => {
		let toDoLists = this.getToDoListFromStorage();
		const ListItemToDelete = toDoLists[id];

		toDoLists = toDoLists.filter((item) => item !== ListItemToDelete);

		this.newIndexNum(toDoLists);
		this.addListToStorage(toDoLists);
	};

	static ListInputUpdate = (newDescription, id) => {
		const toDoLists = this.getToDoListFromStorage();
		const updateList = toDoLists[id];

		toDoLists.forEach((item) => {
			if (item === updateList) {
				item.description = newDescription;
			}
		});

		this.addListToStorage(toDoLists);
		// Get current filter from active button
		const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
		this.showLists(activeFilter);
	};

	static removeToDoListBtn = () => {
		document.querySelectorAll(".remove_btn").forEach((button) =>
			button.addEventListener("click", (event) => {
				event.preventDefault();
				let id;
				if (button.id > 0) {
					id = button.id - 1;
				} else {
					id = 0;
				}
				this.deleteListData(id);
				// Get current filter from active button
				const activeFilter =
					document.querySelector(".filter-btn.active")?.dataset.filter || "all";
				this.showLists(activeFilter);
			}),
		);
	};

	// section created dynamiclly
	static toDoListsHtml = ({ description, index }, statusCheck, statusCompleted) => {
		const ul = document.createElement("ul");
		ul.className = "to-do";
		ul.innerHTML = `
        <li><input class="checkbox" id="${index}" type="checkbox" ${statusCheck}></li>
        <li><input id="LIST${index}" type="text" class="text${statusCompleted}" value="${description}" readonly></li>
        <li class="remove-edit">
        <button class="edit_list_btn" id="${index}" aria-label="Edit task"><i class="fa fa-ellipsis-v icon"></i></button>
        <button class="remove_btn" id="${index}" aria-label="Delete task"><i class="fa fa-trash-can icon"></i></button>
        </li>
      `;
		return ul;
	};

	// show listed tasks
	static showLists = (filter = "all") => {
		const toDoLists = this.getToDoListFromStorage();
		document.querySelector(".toDoListContainer").innerHTML = "";

		// Filter tasks based on the current filter
		let filteredTasks = toDoLists;
		if (filter === "completed") {
			filteredTasks = toDoLists.filter((item) => item.completed === true);
		} else if (filter === "todo") {
			filteredTasks = toDoLists.filter((item) => item.completed === false);
		}

		filteredTasks.forEach((item) => {
			let statusCheck;
			let statusCompleted;
			if (item.completed === true) {
				statusCheck = "checked";
				statusCompleted = "completed";
			} else {
				statusCheck = "";
				statusCompleted = "";
			}
			document
				.querySelector(".toDoListContainer")
				.appendChild(this.toDoListsHtml(item, statusCheck, statusCompleted));
		});

		this.removeToDoListBtn();
		this.editListBtnEvent();
		this.updateListBtnEvent();

		const event = new Event("listUpdated");
		document.dispatchEvent(event);
	};

	// add a task to a list
	static addLists = (description) => {
		const toDoLists = this.getToDoListFromStorage();
		const index = toDoLists.length + 1;
		const newtask = new DataList(description, false, index);

		toDoLists.push(newtask);
		this.addListToStorage(toDoLists);
		// Get current filter from active button
		const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
		this.showLists(activeFilter);
	};

	// update to do list
	static updateListBtnEvent = () => {
		document.querySelectorAll(".text").forEach((input) =>
			input.addEventListener("keypress", (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					const inputListId = "LIST";
					const ListIdSelected = event.currentTarget.id;
					let listID;

					if (!ListIdSelected.includes("LIST")) {
						listID = inputListId.concat(ListIdSelected);
					} else {
						listID = ListIdSelected;
					}

					document.getElementById(listID).setAttribute("readonly", "readonly");
					this.ListInputUpdate(
						document.getElementById(listID).value,
						Number(listID.replace("LIST", "")) - 1,
					);
				}
			}),
		);
	};

	// Reset editing state for all items
	static resetAllEditStates = () => {
		document.querySelectorAll(".text, .textcompleted").forEach((input) => {
			input.setAttribute("readonly", "readonly");
			input.style.background = "";
			const parentUl = input.closest("ul");
			if (parentUl) {
				parentUl.style.background = "";
				const editBtn = parentUl.querySelector(".edit_list_btn");
				const removeBtn = parentUl.querySelector(".remove_btn");
				if (editBtn) editBtn.style.display = "block";
				if (removeBtn) removeBtn.style.display = "none";
			}
		});
	};

	// Enable editing for a specific item
	static enableEditMode = (listID, ulItem, inputElement) => {
		ulItem.style.background = "rgb(230, 230, 184)";
		inputElement.removeAttribute("readonly");
		inputElement.focus();
		inputElement.style.background = "rgb(230, 230, 184)";

		const editBtn = ulItem.querySelector(".edit_list_btn");
		const removeBtn = ulItem.querySelector(".remove_btn");
		if (editBtn) editBtn.style.display = "none";
		if (removeBtn) removeBtn.style.display = "block";

		// Add event listeners
		inputElement.addEventListener(
			"blur",
			() => {
				this.saveEdit(inputElement, ulItem);
			},
			{ once: true },
		);

		inputElement.addEventListener(
			"keydown",
			(e) => {
				if (e.key === "Escape") {
					this.saveEdit(inputElement, ulItem);
				}
			},
			{ once: true },
		);
	};

	// edit list
	static editListBtnEvent = () => {
		document.querySelectorAll(".edit_list_btn").forEach((button) =>
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const ListIdSelected = event.currentTarget.id;
				const listID = ListIdSelected.includes("LIST")
					? ListIdSelected
					: `LIST${ListIdSelected}`;

				this.resetAllEditStates();

				const ulItem = event.target.closest("ul");
				const inputElement = document.getElementById(listID);

				if (inputElement && ulItem) {
					this.enableEditMode(listID, ulItem, inputElement);
				}
			}),
		);
	};

	// Save edit helper method
	static saveEdit = (inputElement, ulItem) => {
		inputElement.setAttribute("readonly", "readonly");
		inputElement.style.background = "";
		ulItem.style.background = "";

		const editBtn = ulItem.querySelector(".edit_list_btn");
		const removeBtn = ulItem.querySelector(".remove_btn");
		if (editBtn) editBtn.style.display = "block";
		if (removeBtn) removeBtn.style.display = "none";

		// Update the task in storage
		const listId = inputElement.id.replace("LIST", "");
		this.ListInputUpdate(inputElement.value, Number(listId) - 1);
	};
}
