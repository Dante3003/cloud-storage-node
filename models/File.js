const { model, Schema, ObjectId } = require("mongoose");

const File = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  accessLink: { type: String },
  access: { type: Object, default: {} },
  public: { type: Boolean, default: false },
  size: { type: Number, default: 0 },
  path: { type: String, default: "" },
  date: { type: Date, default: Date.now() },
  user: { type: ObjectId, ref: "User" },
  parent: { type: ObjectId, ref: "File" },
  childs: [{ type: ObjectId, ref: "File" }],
  availableFor: [{ type: ObjectId, ref: "User" }],
});

module.exports = model("File", File);
