const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");

let tasks = JSON.parse(localStorage.getItem("daily-tasks-v1")) || [];

function saveTasks() {
    localStorage.setItem("daily-tasks-v1", JSON.stringify(tasks));
}

function showTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task, index) {
        const row = document.createElement("li");
        row.className = task.completed ? "task completed" : "task";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as complete");
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            showTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const upButton = document.createElement("button");
        upButton.type = "button";
        upButton.textContent = "↑";
        upButton.setAttribute("aria-label", "Move task up");
        upButton.disabled = index === 0;
        upButton.addEventListener("click", function () {
            moveTask(index, index - 1);
        });

        const downButton = document.createElement("button");
        downButton.type = "button";
        downButton.textContent = "↓";
        downButton.setAttribute("aria-label", "Move task down");
        downButton.disabled = index === tasks.length - 1;
        downButton.addEventListener("click", function () {
            moveTask(index, index + 1);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            tasks.splice(index, 1);
            saveTasks();
            showTasks();
        });

        row.append(checkbox, text, upButton, downButton, deleteButton);
        taskList.appendChild(row);
    });

    taskCount.textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks");
    emptyMessage.style.display = tasks.length === 0 ? "block" : "none";
}

function moveTask(oldIndex, newIndex) {
    const task = tasks.splice(oldIndex, 1)[0];
    tasks.splice(newIndex, 0, task);
    saveTasks();
    showTasks();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = input.value.trim();
    if (taskText === "") {
        return;
    }

    tasks.push({
        text: taskText,
        completed: false
    });

    saveTasks();
    showTasks();
    form.reset();
    input.focus();
});

showTasks();
