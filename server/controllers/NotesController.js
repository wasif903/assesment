import mongoose from "mongoose";
import NotesModel from "../models/NotesModel.js";

// Create Note
// ENDPOINT: /api/notes/create-note
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
// ENDPOINT: /api/notes/my-notes
// METHOD : GET
const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [results] = await NotesModel.aggregate([
      { $match: { userID: new mongoose.Types.ObjectId(req.user.id)  } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ]);
    const total = results.totalCount[0]?.count || 0;
    res.status(200).json({
      data: results.data,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Notes (owned by user)
// ENDPOINT: /api/notes/all-notes
// METHOD : GET
const getAllNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [results] = await NotesModel.aggregate([
      {
        $lookup: {
          from: 'users', 
          localField: 'userID',
          foreignField: '_id',
          as: 'createdBy'
        }
      },
      {
        $unwind: {
          path: '$createdBy',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                title: 1,
                content: 1,
                createdAt: 1,
                createdBy: {
                  _id: '$createdBy._id',
                  username: '$createdBy.username'
                }
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const total = results.totalCount[0]?.count || 0;

    res.status(200).json({
      data: results.data,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Update Note
// ENDPOINT: /api/notes/update-note/:id
// METHOD : PATCH
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
// ENDPOINT: /api/notes/delete-note/:id
// METHOD : PATCH
const deleteNote = async (req, res) => {
  try {
    const note = await NotesModel.findById(req.params.id);
    if (!note || note.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await NotesModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createNote, getNotes, getAllNotes, updateNote, deleteNote };
