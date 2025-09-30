const mongoose = require("mongoose");
const validator = require("validator");

const authSchema = new mongoose.Schema(
  {
    firstName: {
      type: "String",
      required: true,
      index: true,
      minLength: 3,
      maxLenght: 50,
    },

    lastName: {
      type: "String",
      required: true,
      minLength: 3,
      maxLenght: 50,
    },

    email: {
      type: "String",
      unique: true, // it is a feature of mongodb when we make any field unique it treat those field as index(when we make any field as index it makes search efficient fast when we search using a field which we have make unique or set index=true)
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email " + value);
        }
      },
    },

    password: {
      type: "String",
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must be 8-128 characters long, and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (example- !@#$%^&*)."
          );
        }
      },
    },

    age: {
      type: "Number",
      min: 18,
      default: 20,
    },

    city: {
      type: "String",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Auth", authSchema);
