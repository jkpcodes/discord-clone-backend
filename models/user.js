import mongoose from 'mongoose';
import {
  USER_NAME_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
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
    minlength: PASSWORD_MIN_LENGTH,
    maxlength: PASSWORD_MAX_LENGTH,
    validate: {
      validator: (v) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/.test(v);
      },
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  },
});

export const User = mongoose.model('user', userSchema);
