
const express = require("express");
const mongoose = require("mongoose");
const Todo = require("../models/Todo");

const router = express.Router();

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Add a task
router.post("/", async (req, res) => {
  try {
    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    if (!title || title.length > 200) {
      return res.status(400).json({
        message: "Enter a task of 1–200 characters",
      });
    }

    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// Mark complete/incomplete or edit the title
router.patch("/:id", async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.completed === "boolean") {
      updates.completed = req.body.completed;
    }

    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();

      if (!title || title.length > 200) {
        return res.status(400).json({
          message: "Enter a task of 1–200 characters",
        });
      }

      updates.title = title;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid updates provided",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
