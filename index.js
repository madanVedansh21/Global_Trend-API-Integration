// task is to make a basic

import express from "express";
import { dataFetch } from "./datafetch/dataFetch.js";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
}); // allwed cors from any site

const PORT = 3000;
const url1 = "https://api.github.com/users?per_page=3";
const url2 = "https://jsonplaceholder.typicode.com/todos";

app.get("/", async (req, res) => {
  try {
    const userdata = await dataFetch(url1);
    const tododata = await dataFetch(url2);
    const responseData = { users: userdata, todos: tododata };

    fs.promises
      .writeFile(
        "./storeData/savadataoncall.txt",
        JSON.stringify(responseData, null, 2)
      )
      .catch((err) => console.error("File write error:", err));

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/filtered", async (req, res) => {
  try {
    const { id, name } = req.query;
    const [users, todos] = await Promise.all([
      dataFetch(url1),
      dataFetch(url2),
    ]);

    if (!id && !name) {
      throw new Error("Must provide either id or name");
    }

    let filteredUsers = users;
    let filteredTodos = todos;

    if (name && name.trim() !== "") {
      const nameToLower = name.toLowerCase();
      filteredUsers = users.filter((user) => {
        return user.login.toLowerCase().includes(nameToLower);
      });
    }

    if (id && id.trim() !== "") {
      const idNumber = Number(id);
      if (isNaN(idNumber)) {
        throw new Error("ID must be a number");
      }
      filteredTodos = todos.filter((todo) => {
        return todo.id === idNumber;
      });
    }

    const responseData = {
      users: filteredUsers,
      todos: filteredTodos,
    };

    fs.promises
      .writeFile(
        "./storeData/savadataoncall.txt",
        JSON.stringify(responseData, null, 2)
      )
      .catch((err) => console.error("File write error:", err));

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, (error) => {
  if (error) {
    console.error("Error starting the server:", error);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});
