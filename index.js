"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = require("sqlite3");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const db = new sqlite3_1.Database("../database/database.db");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Error handling middleware
const sendError = (res, err) => {
    res.status(500).json({ error: err.message });
};
// Route handlers
const getItems = (req, res) => {
    db.all("SELECT * FROM Items", (err, rows) => {
        if (err)
            return sendError(res, err);
        res.json(rows);
    });
};
const postItem = (req, res) => {
    const { name, category, price } = req.body;
    const id = (0, uuid_1.v4)();
    db.run("INSERT INTO Items (id, name, category, price) VALUES (?, ?, ?, ?)", [id, name, category, price], function (err) {
        if (err)
            return sendError(res, err);
        res.status(201).json({ id });
    });
};
const updateItem = (req, res) => {
    const { name, category, price } = req.body;
    const updates = [];
    let sql = "UPDATE Items SET ";
    if (name)
        updates.push("name = ?");
    if (category)
        updates.push("category = ?");
    if (price)
        updates.push("price = ?");
    sql += updates.join(", ") + " WHERE id = ?";
    const params = [name, category, price]
        .filter((param) => param !== undefined)
        .concat(req.params.id);
    if (updates.length) {
        db.run(sql, params, function (err) {
            if (err)
                return sendError(res, err);
            if (this.changes === 0)
                return res
                    .status(404)
                    .json({ message: "No such item or no update needed." });
            res.json({ message: "Record updated!", changes: this.changes });
        });
    }
    else {
        res.status(400).json({ message: "No valid fields provided for update." });
    }
};
const deleteItem = (req, res) => {
    db.run("DELETE FROM Items WHERE id = ?", [req.params.id], function (err) {
        if (err)
            return sendError(res, err);
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
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
