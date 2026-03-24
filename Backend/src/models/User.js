const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, 
    },
    role: {
      type: String,
      enum: {
        values: ["citizen", "official", "admin"],
        message: "Role must be citizen, official, or admin",
      },
      default: "citizen",
    },
    location: {
      type: String,
      required: [true, "Please provide your location"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    governmentId: {
      type: String,
      default: null,
    },
    verificationDocument: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

// hashing the password before saving the user--
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

// compareing  password--
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
