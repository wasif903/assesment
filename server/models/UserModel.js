import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: [String],
    enum: ["User"],
    default: ["User"]
  },
  refreshToken: String
});
const UserModel = mongoose.model("users", UserSchema);
export default UserModel;
