import "./styles.css";

const app = document.querySelector("#app");

const setLocalStorage = () => {
  localStorage.setItem("todo-state", JSON.stringify(state));
};

const getState = () => {
  const defaultState = {
    input: "",
    todos: [],
    filter: "not-done",
    currentTodoId: -1
  };

  const savedState = JSON.parse(localStorage.getItem("todo-state"));

  return savedState || defaultState;
};

const state = getState();

// Templates
// --------------------------------------
const generateFilterButtonTemplate = ({ id, filterName, text }) => {
  return `
    <div class='grid__item'>
      <button
        class='button'
        data-id='${id}'
        data-filter='${filterName}'
      >
        ${text}
      </button>
    </div>
  `;
};

const getFilteredTodos = () => {
  if (state.filter === "all") {
    return state.todos;
  }

  return state.todos.filter((todo) => {
    return todo.status === state.filter;
  });
};

const generateTodoActionsTemplate = (item) => {
  const { id, status } = item;

  const notDoneButton =
    status !== "not-done"
      ? generateFilterButtonTemplate({
          id,
          filterName: "not-done",
          text: "Not Done"
        })
      : "";

  const pendingButton =
    status !== "pending"
      ? generateFilterButtonTemplate({
          id,
          filterName: "pending",
          text: "Pending"
        })
      : "";

  const doneButton =
    status !== "done"
      ? generateFilterButtonTemplate({ id, filterName: "done", text: "Done" })
      : "";

  const removeButton = `<div class='button--remove' data-id='${id}'><i /></div>`;

  return `
    <div class='todo-item__actions'>
      <div class='grid'>
        ${notDoneButton}
        ${pendingButton}
        ${doneButton}
        ${removeButton}
      </div>
    </div>
  `;
};

const generateTodoItemsTemplate = (arr) => {
  return arr.reduce((acc, item) => {
    const todoActionsTemplate = generateTodoActionsTemplate(item);

    return (
      acc +
      `
      <div class='todo-list__item'>
        <div class='todo-item'>
          <div class='grid'>
            <div class='grid__item grid__item--grow'>
              <div class='todo-item__text'>${item.text}</div>
            </div>
            <div class='grid__item grid__item--shrink'>
              ${todoActionsTemplate}
            </div>
          </div>
        </div>
      </div>
    `
    );
  }, "");
};

const getFiltersTemplate = () => {
  const filters = [
    { value: "not-done", text: "Not Done" },
    { value: "pending", text: "Pending" },
    { value: "done", text: "Done" },
    { value: "all", text: "All" }
  ];

  const elements = filters.map((item) => {
    const classes = ["tab"];

    if (item.value === state.filter) {
      classes.push("tab--active");
    }

    return `
      <div class='grid__item'>
        <div class='${classes.join(" ")}' data-filter='${item.value}'>
          <span>${item.text}</span>
        </div>
      </div>
    `;
  });

  return elements.join("");
};

const createFiltersTemplate = () => {
  const todoFilters = document.createElement("div");
  todoFilters.classList.add("todo-filters");

  const template = `
    <div class='section'>
      <div class='section__body'>
        <div class='grid'>
          ${getFiltersTemplate()}
        </div>
      </div>
    </div>
  `;

  todoFilters.innerHTML = template;

  return todoFilters;
};

const createDefaultMessageTemplate = () => {
  const defaultMessageTemplate = `
    <div class="default-message-container">
      <span class="default-message">There is nothing saved</span>
    </div>
  `;
  return defaultMessageTemplate;
};

const createTodoHeaderTemplate = () => {
  const todoHeader = document.createElement("div");
  todoHeader.classList.add("todo__header");

  const template = `
    <div class='section'>
      <div class='section__header'>
        <span>ADD A TODO</span>
      </div>
      <div class='section__body'>
        <div class="grid">
          <div class='grid__item'>
            <input class="input" type="text" placeholder="Your todo.." />
          </div>
          <div class='grid__item'>
            <button class="button">Create</button>
          </div>
        </div>
      </div>
    </div>
  `;

  todoHeader.innerHTML = template;

  return todoHeader;
};

const generateTodosTemplate = () => {
  const newTodos = getFilteredTodos();

  return newTodos.length === 0
    ? createDefaultMessageTemplate()
    : generateTodoItemsTemplate(newTodos);
};

// Utilities
// -------------------------------------
const isKeyEnter = (event) => {
  return event.keyCode === 13;
};

const resetInput = () => {
  const input = document.querySelector(".input");

  input.value = "";
  state.input = "";

  setLocalStorage();
};

const addTodoActionEvents = () => {
  const todoButtons = [...document.querySelectorAll(".todo-item button")];

  todoButtons.forEach((button) => {
    button.addEventListener("click", handleTodoButtonClick);
  });
};

const addRemoveButtonsEvents = () => {
  const removeButtons = [
    ...document.querySelectorAll(".todo-item .button--remove")
  ];

  removeButtons.forEach((button) => {
    button.addEventListener("click", handleRemoveButtonClick);
  });
};

const updateTodos = () => {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = generateTodosTemplate();

  addTodoActionEvents();
  addRemoveButtonsEvents();
};

const addTodo = () => {
  state.todos.push({
    status: state.filter === "all" ? "not-done" : state.filter,
    text: state.input,
    id: state.currentTodoId + 1
  });

  state.currentTodoId += 1;

  setLocalStorage();
  updateTodos();
  resetInput();
};

const addEvents = () => {
  // filter events
  // ------------------------------------
  const todoFiltersItem = [...document.querySelectorAll(".todo-filters .tab")];

  todoFiltersItem.forEach((element) => {
    element.addEventListener("click", handleTodoFiltersItemClick);
  });

  // input events
  // ------------------------------------
  const input = document.querySelector(".input");
  input.addEventListener("keyup", handleInputKeyUp);

  // button events
  const button = document.querySelector(".button");
  button.addEventListener("click", handleEnterButtonCLick);

  // filter events
  addTodoActionEvents();

  // remove buttons events
  addRemoveButtonsEvents();
};

// events
// -------------------------------------
const handleInputKeyUp = (event) => {
  const inputValue = event.target.value;
  state.input = inputValue;

  if (isKeyEnter(event) && state.input !== "") {
    addTodo();
  }

  setLocalStorage();
};

const handleEnterButtonCLick = () => {
  if (state.input !== "") {
    addTodo();
  }
};

const handleTodoFiltersItemClick = (event) => {
  const filter = event.currentTarget.dataset.filter;
  const todoFiltersItem = [...document.querySelectorAll(".todo-filters .tab")];

  todoFiltersItem.forEach((element) => {
    element.classList.remove("tab--active");
  });

  state.filter = filter;

  event.currentTarget.classList.add("tab--active");

  setLocalStorage();
  updateTodos();
};

const handleTodoButtonClick = (event) => {
  const filter = event.currentTarget.dataset.filter;
  const id = Number(event.currentTarget.dataset.id);

  const index = state.todos.findIndex((item) => {
    return id === item.id;
  });

  state.todos[index].status = filter;

  setLocalStorage();
  updateTodos();
};

const handleRemoveButtonClick = (event) => {
  const id = Number(event.currentTarget.dataset.id);
  const index = state.todos.findIndex((item) => {
    return item.id === id;
  });

  state.todos.splice(index, 1);

  setLocalStorage();
  updateTodos();
};

// HTML Elements
// -------------------------------------
const createTodo = () => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  return todo;
};

const createToDoList = () => {
  const todoList = document.createElement("div");
  todoList.classList.add("todo-list");
  todoList.innerHTML = generateTodosTemplate();

  return todoList;
};

// render
// ------------------------------------
const render = () => {
  const todo = createTodo();

  [
    createTodoHeaderTemplate(),
    createFiltersTemplate(),
    createToDoList()
  ].forEach((item) => {
    todo.appendChild(item);
  });

  app.appendChild(todo);

  addEvents();
};

render();
