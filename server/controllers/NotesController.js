import NotesModel from "../models/NotesModel.js";

// Create Note
// ENDPOINT: /api/refresh
// METHOD : POST
const createNote = async (req, res) => {
  try {
    const { title, desc } = req.body;

    const note = new NotesModel({
      userID: req.user.id,
      title,
      desc
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User's Notes (owned by user)
const getNotes = async (req, res) => {
  try {
    const notes = await NotesModel.find({ userID: req.user.id });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Note
const updateNote = async (req, res) => {
  try {
    const note = await NotesModel.findById(req.params.id);
    if (!note || note.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, desc } = req.body;

    note.title = title || note.title;
    note.desc = desc || note.desc;

    await note.save();
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Note
const deleteNote = async (req, res) => {
  try {
    const note = await NotesModel.findById(req.params.id);
    if (!note || note.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await NotesModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createNote, getNotes, updateNote, deleteNote };
