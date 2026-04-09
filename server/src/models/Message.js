import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    originalName: String,
    fileName: String,
    fileUrl: String,
    mimeType: String,
    size: Number
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true,
      default: ''
    },
    chatType: {
      type: String,
      enum: ['room', 'private'],
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation'
    },
    attachment: attachmentSchema
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
