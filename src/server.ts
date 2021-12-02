import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const connectToHeroku = process.env.NODE_ENV === "production";

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: connectToHeroku
    ? {
        rejectUnauthorized: false,
      }
    : false,
};
console.log({ config, connectToHeroku, nodeEnv: process.env.NODE_ENV });

const client = new Client(config);

async function clientConnect() {
  await client.connect();
}
clientConnect();

const app = express();

app.use(express.json());
app.use(cors());

export interface Task {
  name: string;
  due: Date;
}

//===================ROUTES==========================

// app.get("/", (req, res) => {
//   const pathToFile = filePath("../public/index.html");
//   res.sendFile(pathToFile);
// });

// GET /items
app.get("/todos", async (req, res) => {
  try {
    const dbResult = await client.query("SELECT * FROM todos");
    const todos = dbResult.rows;
    res.status(200).json({
      status: "success",
      data: {
        todos,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const todoById = await client.query("SELECT * FROM todos WHERE id = $1", [
      parseInt(todoId),
    ]);
    if (todoById.rows.length === 1) {
      res.status(200).json({
        status: "success",
        data: {
          todoById,
        },
      });
    } else {
      res.status(400).json({
        status: "fail",
        data: {
          id: "Could not find a todo with that id identifier",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

// POST /items
app.post<{}, {}, Task>("/todos", async (req, res) => {
  try {
    const postData = req.body;
    const values = [postData.name, postData.due];
    const posted = await client.query(
      "INSERT INTO todos(name, due) VALUES($1, $2) RETURNING *",
      values
    );
    if (posted.rows.length === 1) {
      res.status(200).json({
        status: "success",
        data: {
          posted,
        },
      });
    } else {
      res.status(400).json({
        status: "fail",
        data: {
          id: "Did not successfully POST a new todo",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

//Update name
app.put("/todos/name/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const newName = req.body.name;
    const updateTodo = await client.query(
      "UPDATE todos SET name = $1 WHERE id = $2 RETURNING *",
      [newName, todoId]
    );
    if (updateTodo.rows.length === 1) {
      res.status(200).json({
        status: "success",
        data: {
          updateTodo,
        },
      });
    } else {
      res.status(400).json({
        status: "fail",
        data: {
          id: "Could not find a todo with that id",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

//Toggle status (upon clicking checkbox alter status between 0 and 1)
app.put("/todos/status/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const newStatus = req.body.status;
    const updateTodo = await client.query(
      "UPDATE todos SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, todoId]
    );
    if (updateTodo.rows.length === 1) {
      res.status(200).json({
        status: "success",
        data: {
          updateTodo,
        },
      });
    } else {
      res.status(400).json({
        status: "fail",
        data: {
          id: "Could not find a todo with that id",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

//Update due date
app.put("/todos/due/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const newDue = req.body.due;
    const updateTodo = await client.query(
      "UPDATE todos SET due = $1 WHERE id = $2 RETURNING *",
      [newDue, todoId]
    );
    if (updateTodo.rows.length === 1) {
      res.status(200).json({
        status: "success",
        data: {
          updateTodo,
        },
      });
    } else {
      res.status(400).json({
        status: "fail",
        data: {
          id: "Could not find a todo with that id",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const values = [parseInt(req.params.id)];
    const text = `DELETE FROM todos WHERE id = $1`;

    const queryResult = await client.query(text, values);
    const didRemove = queryResult.rowCount === 1;

    if (didRemove) {
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(404).json({
        status: "fail",
        data: {
          id: "Could not find a signature with that id identifier",
        },
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

export default app;
