class Task {
    constructor(id, title, priority, dueDate, completed = false) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.loadTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks).map(task => {
                return new Task(task.id, task.title, task.priority, task.dueDate, task.completed);
            });
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateTaskCount();
    }

    addTask(title, priority, dueDate) {
        const id = Date.now().toString();
        const task = new Task(id, title, priority, dueDate);
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(id, title, priority, dueDate) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.title = title;
            task.priority = priority;
            task.dueDate = dueDate;
            this.saveTasks();
            this.renderTasks();
        }
    }

    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // Apply filter
        if (this.currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Apply sort
        return this.sortTasks(filteredTasks);
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'date':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            taskList.style.display = 'block';
            emptyState.style.display = 'none';

            taskList.innerHTML = filteredTasks.map(task => `
                <div class="list-group-item task-item ${task.completed ? 'completed-task' : ''} priority-${task.priority} new-task">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
                                onclick="taskManager.toggleTaskStatus('${task.id}')">
                            <label class="form-check-label">${task.title}</label>
                        </div>
                        <div class="d-flex align-items-center">
                            <span class="date-badge me-2">${task.dueDate || 'No due date'}</span>
                            <button class="btn btn-action btn-outline-primary" onclick="editTaskModal('${task.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-action btn-outline-danger" onclick="taskManager.deleteTask('${task.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTasks();
        
        // Update active filter UI
        document.querySelectorAll('.filter-option').forEach(option => {
            option.classList.toggle('active', option.dataset.filter === filter);
        });
    }

    setSort(sort) {
        this.currentSort = sort;
        this.renderTasks();
    }

    updateTaskCount() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        document.getElementById('taskCount').textContent = 
            `${totalTasks} tasks (${completedTasks} completed)`;
    }
}

// Initialize TaskManager
const taskManager = new TaskManager();

// Event Listeners
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    taskManager.addTask(title, priority, dueDate);
    this.reset();
});

document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('taskForm').reset();
});

// Filter event listeners
document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', function() {
        taskManager.setFilter(this.dataset.filter);
    });
});

// Sort event listeners
document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', function() {
        taskManager.setSort(this.dataset.sort);
    });
});

// Edit task modal functions
function editTaskModal(taskId) {
    const task = taskManager.getTask(taskId);
    if (task) {
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskId').value = task.id;
        
        const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        editModal.show();
    }
}

document.getElementById('editTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    
    taskManager.editTask(id, title, priority, dueDate);
    bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
});
