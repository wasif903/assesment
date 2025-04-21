import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import { createNotes } from "../validations/NotesValidation.js";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  getAllNotes
} from "../controllers/NotesController.js";
import validate from "../middlewares/ValidationHandler.js";

const router = express.Router();

router.use(AuthMiddleware);

router.post("/create-note", validate(createNotes), createNote);
router.get("/my-notes", getNotes);
router.get("/all-notes", getAllNotes);
router.patch("/update-note/:id", validate(createNotes), updateNote);
router.delete("/delete-note/:id", deleteNote);

export default router;
