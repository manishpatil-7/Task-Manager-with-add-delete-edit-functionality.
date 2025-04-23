 $(document).ready(function() {
            // Load tasks from localStorage
            let tasks = [];
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                tasks = JSON.parse(storedTasks);
            }
            
            let currentFilter = 'all';
            let currentSort = 'priority';
            
            // Save tasks to localStorage
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
            }
            
            // Add a new task
            function addTask(title, priority, dueDate) {
                const newTask = {
                    id: Date.now().toString(),
                    title: title,
                    priority: priority,
                    dueDate: dueDate,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                tasks.push(newTask);
                saveTasks();
            }
            
            // Delete a task
            function deleteTask(id) {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
            }
            
            // Toggle task completion status
            function toggleTaskStatus(id) {
                const task = tasks.find(task => task.id === id);
                if (task) {
                    task.completed = !task.completed;
                    saveTasks();
                }
            }
            
            // Edit a task
            function editTask(id, title, priority, dueDate) {
                const task = tasks.find(task => task.id === id);
                if (task) {
                    task.title = title;
                    task.priority = priority;
                    task.dueDate = dueDate;
                    saveTasks();
                }
            }
            
            // Get a task by ID
            function getTask(id) {
                return tasks.find(task => task.id === id);
            }
            
            // Filter tasks based on current filter
            function getFilteredTasks() {
                switch(currentFilter) {
                    case 'active':
                        return tasks.filter(task => !task.completed);
                    case 'completed':
                        return tasks.filter(task => task.completed);
                    default:
                        return tasks;
                }
            }
            
            // Sort tasks based on current sort method
            function sortTasks(tasksToSort) {
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                
                return [...tasksToSort].sort((a, b) => {
                    switch(currentSort) {
                        case 'priority':
                            return priorityOrder[a.priority] - priorityOrder[b.priority];
                        case 'date':
                            if (!a.dueDate) return 1;
                            if (!b.dueDate) return -1;
                            return new Date(a.dueDate) - new Date(b.dueDate);
                        case 'name':
                            return a.title.localeCompare(b.title);
                        default:
                            return 0;
                    }
                });
            }
            
            // Render tasks to the DOM
            function renderTasks() {
                const filteredTasks = getFilteredTasks();
                const sortedTasks = sortTasks(filteredTasks);
                
                const $taskList = $('#taskList');
                $taskList.empty();
                
                if (sortedTasks.length === 0) {
                    $('#emptyState').show();
                } else {
                    $('#emptyState').hide();
                    
                    sortedTasks.forEach(task => {
                        const dueDateFormatted = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
                        
                        const $taskItem = $(`
                            <div class="list-group-item task-item d-flex justify-content-between align-items-center priority-${task.priority} ${task.completed ? 'completed-task' : ''}" data-id="${task.id}">
                                <div class="d-flex align-items-center">
                                    <div class="form-check">
                                        <input class="form-check-input task-check" type="checkbox" ${task.completed ? 'checked' : ''}>
                                    </div>
                                    <div class="ms-3">
                                        <div class="fw-bold">${task.title}</div>
                                        <div class="text-muted small">
                                            <span class="date-badge">${dueDateFormatted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex">
                                    <button class="btn btn-sm btn-action btn-outline-primary edit-task-btn">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                    <button class="btn btn-sm btn-action btn-outline-danger delete-task-btn">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        `);
                        
                        $taskList.append($taskItem);
                    });
                }
                
                // Update task count
                $('#taskCount').text(`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`);
            }
            
            // Initial render
            renderTasks();
            
            // Form submission to add a new task
            $('#taskForm').on('submit', function(e) {
                e.preventDefault();
                
                const title = $('#taskTitle').val().trim();
                const priority = $('#taskPriority').val();
                const dueDate = $('#taskDueDate').val();
                
                if (title) {
                    addTask(title, priority, dueDate);
                    $('#taskTitle').val('');
                    $('#taskPriority').val('low');
                    $('#taskDueDate').val('');
                }
            });
            
            // Reset the form
            $('#resetBtn').on('click', function() {
                $('#taskTitle').val('');
                $('#taskPriority').val('low');
                $('#taskDueDate').val('');
            });
            
            // Toggle task completion status
            $(document).on('change', '.task-check', function() {
                const taskId = $(this).closest('.task-item').data('id');
                toggleTaskStatus(taskId);
            });
            
            // Delete a task
            $(document).on('click', '.delete-task-btn', function() {
                const taskId = $(this).closest('.task-item').data('id');
                
                if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(taskId);
                }
            });
            
            // Open edit modal
            $(document).on('click', '.edit-task-btn', function() {
                const taskId = $(this).closest('.task-item').data('id');
                const task = getTask(taskId);
                
                if (task) {
                    $('#editTaskId').val(task.id);
                    $('#editTaskTitle').val(task.title);
                    $('#editTaskPriority').val(task.priority);
                    $('#editTaskDueDate').val(task.dueDate);
                    
                    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
                    editModal.show();
                }
            });
            
            // Save edited task
            $('#saveTaskBtn').on('click', function() {
                const id = $('#editTaskId').val();
                const title = $('#editTaskTitle').val().trim();
                const priority = $('#editTaskPriority').val();
                const dueDate = $('#editTaskDueDate').val();
                
                if (title) {
                    editTask(id, title, priority, dueDate);
                    const modalElement = document.getElementById('editTaskModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            });
            
            // Filter tasks
            $('.filter-option').on('click', function() {
                currentFilter = $(this).data('filter');
                $('.filter-option').removeClass('active');
                $(this).addClass('active');
                renderTasks();
            });
            
            // Sort tasks
            $('#sortSelect').on('change', function() {
                currentSort = $(this).val();
                renderTasks();
            });
        });
