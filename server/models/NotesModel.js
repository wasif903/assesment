import mongoose from "mongoose";
const { Schema } = mongoose;

const NotesSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  title: {
    type: String,
  },
  desc: {
    type: String,
  }
});
const NotesModel = mongoose.model("notes", NotesSchema);
export default NotesModel;
