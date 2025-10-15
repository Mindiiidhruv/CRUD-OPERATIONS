const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },

    location: {
      type: String,
      minLength: 4,
      maxLength: 20,
      required: true,
      index: true,
    },

    city: {
      type: String,
      minLength: 3,
      maxLength: 20,
      required: true,
      index: true,
    },
    state: {
      type: String,
      minLength: 3,
      maxLength: 20,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", addressSchema);
