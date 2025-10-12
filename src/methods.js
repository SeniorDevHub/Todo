/* eslint-disable object-curly-newline */
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
		const toDoLists = this.getToDoListFromStorage();
		const task = toDoLists[id];

		// eslint-disable-next-line no-restricted-globals
		if (task && confirm(`Are you sure you want to delete "${task.description}"?`)) {
			const filteredTasks = toDoLists.filter((item, index) => index !== id);
			this.newIndexNum(filteredTasks);
			this.addListToStorage(filteredTasks);
			return true;
		}
		return false;
	};

	// Format date for display
	static formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const today = new Date();
		const diffTime = date - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Tomorrow";
		if (diffDays === -1) return "Yesterday";
		if (diffDays > 1) return `In ${diffDays} days`;
		if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

		return date.toLocaleDateString();
	};

	// Check if task is overdue
	static isOverdue = (dateString) => {
		if (!dateString) return false;
		const dueDate = new Date(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		dueDate.setHours(0, 0, 0, 0);
		return dueDate < today;
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

	// section created dynamically with enhanced UI
	static toDoListsHtml = (
		{ description, index, dueDate, taskDescription },
		statusCheck,
		statusCompleted,
	) => {
		const ul = document.createElement("ul");
		ul.className = "to-do";

		const dueDateDisplay = dueDate ? this.formatDate(dueDate) : "";
		const isOverdue = this.isOverdue(dueDate);
		const overdueClass = isOverdue && !statusCheck ? "overdue" : "";

		ul.innerHTML = `
			<li class="task-checkbox">
				<input class="checkbox" id="${index}" type="checkbox" ${statusCheck}>
			</li>
			<li class="task-content">
				<div class="task-main">
					<input id="LIST${index}" type="text" class="text${statusCompleted}" value="${description}" readonly>
					<div class="task-meta">
						${
							dueDateDisplay
								? `<span class="due-date ${overdueClass}">
							<i class="fa fa-calendar-alt"></i> ${dueDateDisplay}
						</span>`
								: ""
						}
					</div>
				</div>
				${taskDescription ? `<div class="task-description" id="DESC${index}">${taskDescription}</div>` : ""}
			</li>
			<li class="task-actions">
				<button class="expand_btn" id="${index}" aria-label="Expand task" title="View details">
					<i class="fa fa-chevron-down icon"></i>
				</button>
				<button class="remove_btn" id="${index}" aria-label="Delete task" title="Delete task">
					<i class="fa fa-trash-can icon"></i>
				</button>
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
		this.expandTaskEvent(); // Remove editListBtnEvent and updateListBtnEvent from here

		const event = new Event("listUpdated");
		document.dispatchEvent(event);
	};

	// add a task to a list with enhanced data
	static addLists = (description, dueDate = null, taskDescription = "") => {
		const toDoLists = this.getToDoListFromStorage();
		const index = toDoLists.length + 1;
		const newtask = new DataList(description, false, index, dueDate, taskDescription);

		toDoLists.push(newtask);
		this.addListToStorage(toDoLists);
		const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
		this.showLists(activeFilter);
	};

	// Update task with new data
	static updateTask = (id, updates) => {
		const toDoLists = this.getToDoListFromStorage();
		const task = toDoLists[id];

		if (task) {
			Object.assign(task, updates);
			this.addListToStorage(toDoLists);
			const activeFilter =
				document.querySelector(".filter-btn.active")?.dataset.filter || "all";
			this.showLists(activeFilter);
		}
	};

	// Show task details in expanded view with editable title
	static showTaskDetails = (taskId) => {
		const toDoLists = this.getToDoListFromStorage();
		const task = toDoLists[taskId - 1];
		const taskElement = document.getElementById(`LIST${taskId}`).closest(".to-do");

		let detailsElement = taskElement.querySelector(".task-details");
		if (!detailsElement) {
			detailsElement = document.createElement("div");
			detailsElement.className = "task-details";
			taskElement.appendChild(detailsElement);
		}

		detailsElement.innerHTML = `
			<div class="task-detail-item">
				<label for="task-title-${taskId}">Task Title:</label>
				<input type="text"
					   id="task-title-${taskId}"
					   class="task-title-input"
					   value="${task.description}"
					   data-task-id="${taskId}"
					   placeholder="Enter task title...">
			</div>
			<div class="task-detail-item">
				<label for="due-date-${taskId}">Due Date:</label>
				<input type="date"
					   id="due-date-${taskId}"
					   class="due-date-input"
					   value="${task.dueDate || ""}"
					   data-task-id="${taskId}">
			</div>
			<div class="task-detail-item">
				<label for="task-desc-${taskId}">Description:</label>
				<textarea id="task-desc-${taskId}"
						  class="task-desc-input"
						  placeholder="Add task description..."
						  data-task-id="${taskId}">${task.taskDescription || ""}</textarea>
			</div>
			<div class="task-detail-actions">
				<button class="save-details-btn" data-task-id="${taskId}">
					<i class="fa fa-save"></i>
					Save Changes
				</button>
				<button class="cancel-details-btn" data-task-id="${taskId}">
					<i class="fa fa-times"></i>
					Cancel
				</button>
			</div>
		`;

		this.attachDetailEventListeners();

		// Focus on the title input for immediate editing
		const titleInput = detailsElement.querySelector(".task-title-input");
		if (titleInput) {
			titleInput.focus();
			titleInput.select();
		}
	};

	// Hide task details
	static hideTaskDetails = (taskId) => {
		const taskElement = document.getElementById(`LIST${taskId}`).closest(".to-do");
		const detailsElement = taskElement.querySelector(".task-details");
		if (detailsElement) {
			detailsElement.remove();
		}
	};

	// Attach event listeners for detail inputs
	static attachDetailEventListeners = () => {
		// Save details button
		document.querySelectorAll(".save-details-btn").forEach((btn) => {
			if (!btn.hasAttribute("data-listener-attached")) {
				btn.setAttribute("data-listener-attached", "true");
				btn.addEventListener("click", (e) => {
					const { taskId } = e.target.dataset;
					const taskElement = e.target.closest(".to-do");
					const titleInput = taskElement.querySelector(".task-title-input");
					const dueDateInput = taskElement.querySelector(".due-date-input");
					const descInput = taskElement.querySelector(".task-desc-input");

					// Update task with all new data
					this.updateTask(taskId - 1, {
						description: titleInput.value.trim() || "Untitled Task",
						dueDate: dueDateInput.value || null,
						taskDescription: descInput.value || "",
					});

					// Close the expanded view
					const expandBtn = taskElement.querySelector(".expand_btn");
					if (expandBtn) {
						const icon = expandBtn.querySelector("i");
						icon.className = "fa fa-chevron-down icon";
						taskElement.classList.remove("expanded");
						this.hideTaskDetails(taskId);
					}
				});
			}
		});

		// Cancel details button
		document.querySelectorAll(".cancel-details-btn").forEach((btn) => {
			if (!btn.hasAttribute("data-listener-attached")) {
				btn.setAttribute("data-listener-attached", "true");
				btn.addEventListener("click", (e) => {
					const { taskId } = e.target.dataset;
					const taskElement = e.target.closest(".to-do");

					// Close the expanded view without saving
					const expandBtn = taskElement.querySelector(".expand_btn");
					if (expandBtn) {
						const icon = expandBtn.querySelector("i");
						icon.className = "fa fa-chevron-down icon";
						taskElement.classList.remove("expanded");
						this.hideTaskDetails(taskId);
					}
				});
			}
		});

		// Enter key to save
		document.querySelectorAll(".task-title-input").forEach((input) => {
			if (!input.hasAttribute("data-listener-attached")) {
				input.setAttribute("data-listener-attached", "true");
				input.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						const saveBtn = e.target
							.closest(".task-details")
							.querySelector(".save-details-btn");
						if (saveBtn) saveBtn.click();
					}
					if (e.key === "Escape") {
						e.preventDefault();
						const cancelBtn = e.target
							.closest(".task-details")
							.querySelector(".cancel-details-btn");
						if (cancelBtn) cancelBtn.click();
					}
				});
			}
		});
	};

	static removeToDoListBtn = () => {
		document.querySelectorAll(".remove_btn").forEach((button) =>
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation(); // Prevent expand/collapse when clicking delete
				let id;
				if (button.id > 0) {
					id = button.id - 1;
				} else {
					id = 0;
				}

				if (this.deleteListData(id)) {
					const activeFilter =
						document.querySelector(".filter-btn.active")?.dataset.filter || "all";
					this.showLists(activeFilter);
				}
			}),
		);
	};

	// Add expand/collapse functionality
	static expandTaskEvent = () => {
		document.querySelectorAll(".expand_btn").forEach((button) =>
			button.addEventListener("click", (event) => {
				event.preventDefault();
				const taskElement = event.target.closest(".to-do");
				const icon = button.querySelector("i");

				taskElement.classList.toggle("expanded");
				if (taskElement.classList.contains("expanded")) {
					icon.className = "fa fa-chevron-up icon";
					this.showTaskDetails(button.id);
				} else {
					icon.className = "fa fa-chevron-down icon";
					this.hideTaskDetails(button.id);
				}
			}),
		);
	};
}
