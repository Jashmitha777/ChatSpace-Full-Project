import { Room } from '../models/Room.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { emitNewMessage } from '../socket/index.js';

const populateMessage = (query) =>
  query.populate('sender', 'name email avatar').populate('room', 'name').populate({
    path: 'conversation',
    populate: {
      path: 'participants',
      select: 'name email avatar'
    }
  });

const toAttachment = (file) => {
  if (!file) {
    return undefined;
  }

  return {
    originalName: file.originalname,
    fileName: file.filename,
    fileUrl: `/uploads/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size
  };
};

export const getChatOverview = async (req, res) => {
  const [rooms, conversations] = await Promise.all([
    Room.find({ members: req.user._id }).populate('members', 'name email avatar'),
    Conversation.find({ participants: req.user._id }).populate('participants', 'name email avatar')
  ]);

  res.json({ rooms, conversations });
};

export const createRoom = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Room name is required.' });
  }

  const room = await Room.create({
    name,
    description,
    createdBy: req.user._id,
    members: [req.user._id]
  });

  const populatedRoom = await Room.findById(room._id).populate('members', 'name email avatar');
  res.status(201).json(populatedRoom);
};

export const joinRoom = async (req, res) => {
  const room = await Room.findById(req.params.roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  if (!room.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
    room.members.push(req.user._id);
    await room.save();
  }

  const populatedRoom = await Room.findById(room._id).populate('members', 'name email avatar');
  res.json(populatedRoom);
};

export const createOrGetConversation = async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    return res.status(400).json({ message: 'participantId is required.' });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, participantId], $size: 2 }
  }).populate('participants', 'name email avatar');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, participantId]
    });
    conversation = await Conversation.findById(conversation._id).populate('participants', 'name email avatar');
  }

  res.status(201).json(conversation);
};

export const getMessages = async (req, res) => {
  const { chatType, chatId } = req.params;

  const filter = chatType === 'room' ? { room: chatId } : { conversation: chatId };
  const messages = await populateMessage(
    Message.find({ chatType, ...filter }).sort({ createdAt: 1 })
  );

  res.json(messages);
};

export const sendMessage = async (req, res) => {
  const { chatType, chatId } = req.params;
  const { content = '' } = req.body;
  const attachment = toAttachment(req.file);

  if (!content.trim() && !attachment) {
    return res.status(400).json({ message: 'Message content or attachment is required.' });
  }

  const messagePayload = {
    sender: req.user._id,
    content,
    chatType,
    attachment
  };

  if (chatType === 'room') {
    messagePayload.room = chatId;
  } else {
    messagePayload.conversation = chatId;
  }

  const message = await Message.create(messagePayload);
  const populatedMessage = await populateMessage(Message.findById(message._id));
  emitNewMessage(req.app.get('io'), populatedMessage);

  res.status(201).json(populatedMessage);
};
