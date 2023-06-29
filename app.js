const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let dataBase = null;
const initializeServerAndDb = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is starting at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Server Error: ${error.message}`);
  }
};

initializeServerAndDb();

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  console.log(status);
  let getTodoQuery = null;
  switch (true) {
    case status !== undefined && priority !== undefined:
      getTodoQuery = `SELECT * FROM todo
          WHERE status = '${status}' AND priority = '${priority}'; `;
      break;
    case status !== undefined:
      getTodoQuery = `SELECT * FROM todo
          WHERE status = '${status}';`;
      break;
    case priority !== undefined:
      getTodoQuery = `SELECT * FROM todo
          WHERE priority = '${priority}'; `;
      break;
    case search_q !== undefined:
      getTodoQuery = `SELECT * FROM todo
          WHERE todo LIKE '${search_q}'; `;
      break;
  }
  const todoArray = await dataBase.all(getTodoQuery);
  response.send(todoArray);
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    where id = ${todoId};`;
  const todo = await dataBase.get(getTodoQuery);
  response.send(todo);
  console.log(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `
    INSERT INTO todo
    (id,todo,priority,status)
    VALUES(
        ${id},'${todo}','${priority}','${status}'
    );`;
  await dataBase.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4 TO CONTINUE
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  switch (true) {
    case status !== undefined:
      let StatusUpdateQuery = `
            UPDATE todo
            SET 
            status = '${status}'
            WHERE id = ${todoId};`;
      await dataBase.run(StatusUpdateQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      let PriorityUpdateQuery = `
            UPDATE todo
            SET 
            priority = '${priority}'
            WHERE id = ${todoId};`;
      await dataBase.run(PriorityUpdateQuery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      let todoUpdateQuery = `
            UPDATE todo
            SET 
            todo = '${todo}'
            WHERE id = ${todoId};`;
      await dataBase.run(todoUpdateQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await dataBase.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
