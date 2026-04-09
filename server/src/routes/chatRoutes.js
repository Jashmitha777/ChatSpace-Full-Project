import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createOrGetConversation,
  createRoom,
  getChatOverview,
  getMessages,
  joinRoom,
  sendMessage
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/overview', protect, asyncHandler(getChatOverview));
router.post('/rooms', protect, asyncHandler(createRoom));
router.post('/rooms/:roomId/join', protect, asyncHandler(joinRoom));
router.post('/conversations', protect, asyncHandler(createOrGetConversation));
router.get('/messages/:chatType/:chatId', protect, asyncHandler(getMessages));
router.post('/messages/:chatType/:chatId', protect, upload.single('file'), asyncHandler(sendMessage));

export default router;
