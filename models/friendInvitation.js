import mongoose from 'mongoose';

const friendInvitationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

export const FriendInvitation = mongoose.model('FriendInvitation', friendInvitationSchema);
