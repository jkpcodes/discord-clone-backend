import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.Object,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.Object,
    ref: 'User',
  }],
});

export const Server = mongoose.model('Server', serverSchema);