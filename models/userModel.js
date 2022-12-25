import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String
    //required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    //required: [true, 'Please provide your email'],
    //unique: true,
    lowercase: true
    //validate: [validator.isEmail, 'Please provide a valid email']
  },
  myCourses: {
    type: Array,
    default: []
  },
  facebookId: String,
  googleId: String,
  githubId: String,
  username: String,
  photo: String,
  phoneNumber: String,
  sex: String,
  birthday: String,
  address: String,
  role: {
    type: String,
    enum: ['user', 'lecturer', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    //required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordChangedAt: Date,
  userVerifyToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


const User = mongoose.model('User', userSchema);

export default User;
