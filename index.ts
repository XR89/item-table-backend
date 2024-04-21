import express, { Request, Response } from "express";
import cors from "cors";
import { Database } from "sqlite3";
import { v4 as uuidv4 } from "uuid";

const app = express();
const db = new Database("../database/database.db");

app.use(cors());
app.use(express.json());

// Error handling middleware
const sendError = (res: Response, err: Error): void => {
  res.status(500).json({ error: err.message });
};

// Route handlers
const getItems = (req: Request, res: Response): void => {
  db.all("SELECT * FROM Items", (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
};

const postItem = (req: Request, res: Response): void => {
  const { name, category, price } = req.body;
  const id = uuidv4();
  db.run(
    "INSERT INTO Items (id, name, category, price) VALUES (?, ?, ?, ?)",
    [id, name, category, price],
    function (err) {
      if (err) return sendError(res, err);
      res.status(201).json({ id });
    }
  );
};

const updateItem = (req: Request, res: Response): void => {
  const { name, category, price } = req.body;
  const updates = [];
  let sql = "UPDATE Items SET ";

  if (name) updates.push("name = ?");
  if (category) updates.push("category = ?");
  if (price) updates.push("price = ?");

  sql += updates.join(", ") + " WHERE id = ?";

  const params = [name, category, price]
    .filter((param) => param !== undefined)
    .concat(req.params.id);

  if (updates.length) {
    db.run(sql, params, function (err) {
      if (err) return sendError(res, err);
      if (this.changes === 0)
        return res
          .status(404)
          .json({ message: "No such item or no update needed." });
      res.json({ message: "Record updated!", changes: this.changes });
    });
  } else {
    res.status(400).json({ message: "No valid fields provided for update." });
  }
};

const deleteItem = (req: Request, res: Response): void => {
  db.run("DELETE FROM Items WHERE id = ?", [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.status(204).send();
  });
};

// Routing
app.get("/items", getItems);
app.post("/items", postItem);
app.put("/items/:id", updateItem);
app.delete("/items/:id", deleteItem);

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
