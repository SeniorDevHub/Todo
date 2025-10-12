/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-tabs */
// data list
export default class DataList {
	constructor(description, completed = false, index, dueDate = null, taskDescription = "") {
		this.description = description; // Task title
		this.completed = completed;
		this.index = index;
		this.dueDate = dueDate; // Due date for the task
		this.taskDescription = taskDescription; // Detailed description
		this.createdAt = new Date().toISOString(); // When task was created
	}
}
