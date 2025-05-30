import mongoose from 'mongoose';
import {
  USER_NAME_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '../constants/validators.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: USER_NAME_MIN_LENGTH,
    maxlength: USER_NAME_MAX_LENGTH,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: true,
  },
  friends: [{
    type: mongoose.Schema.Types.Object,
    ref: 'User',
  }],
});

export const User = mongoose.model('User', userSchema);
