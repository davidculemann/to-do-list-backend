import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";

const app = express();
const client = new Client({
  database: "tododb",
  // connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(cors());
dotenv.config();

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
      status: "succcess",
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
    const toDoById = await client.query("SELECT * FROM todos WHERE id = $1", [
      parseInt(todoId),
    ]);
    res.json(toDoById.rows);
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
    console.log(postData, res);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
});

export default app;
