const button = document.querySelector("#action");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const output = document.querySelector("#output");

let tasks = JSON.parse(localStorage.getItem("focus-tasks") || "[]");

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet — start your plan.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = task;

    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.className = "done-btn";
    doneButton.textContent = "Done";
    doneButton.setAttribute("aria-label", `Mark ${task} as done`);

    doneButton.addEventListener("click", function () {
      tasks.splice(index, 1);
      localStorage.setItem("focus-tasks", JSON.stringify(tasks));
      renderTasks();
      output.textContent = `Completed: ${task}`;
    });

    item.append(label, doneButton);
    taskList.appendChild(item);
  });
}

button.addEventListener("click", function () {
  const task = taskInput.value.trim();

  if (!task) {
    output.textContent = "Type a task before saving it.";
    taskInput.focus();
    return;
  }

  tasks.push(task);
  localStorage.setItem("focus-tasks", JSON.stringify(tasks));
  renderTasks();

  output.textContent = `Added: ${task}`;
  taskInput.value = "";
  taskInput.focus();
});

renderTasks();
console.log("Focus planner loaded");

