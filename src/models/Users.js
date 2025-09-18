const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ name: "text", email: "text" });

module.exports = mongoose.model("User", userSchema);
