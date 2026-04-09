# ChatSpace - Real-Time Chat Application

ChatSpace is a **real-time chat application built using the MERN stack**.  
The main idea of this project is to allow users to communicate instantly using **WebSockets**, create chat rooms, have private conversations, and store chat history in MongoDB.

This project is inspired by the basic workflow of applications like **Slack, WhatsApp, and Microsoft Teams**.

---

## Features

- User signup and login with JWT authentication
- Real-time chat using Socket.IO
- Create and join chat rooms
- Private one-to-one conversations
- Messages stored in MongoDB for history
- File and image sharing
- Responsive UI for desktop and mobile

---

## Tech Stack

### Frontend
- React
- Vite
- Axios
- Socket.IO Client
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Multer
- JWT Authentication

---

## Project Structure

```text
client/
server/
docs/screenshots/
README.md
```

---

## Local Setup

### Prerequisites
Make sure these are installed:

- Node.js
- npm
- MongoDB (local or Atlas)

### Clone and install dependencies

```bash
git clone <your-repository-url>
cd ChatSpace-Full-Project
npm install
```

### Environment Variables

#### `server/.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

#### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Start the Application

Open two terminals from the project root.

### Backend

```bash
npm run dev:server
```

### Frontend

```bash
npm run dev:client
```

Then open:

```text
http://localhost:5173
```

---

## Core Workflows

### Authentication
- Users can create an account with name, email, and password
- Returning users can log in using existing credentials

### Room Chats
- Logged-in users can create chat rooms
- Rooms support persistent real-time messaging

### Private Conversations
- Users can start direct chats with any other registered user
- Direct chats are stored separately from room messages

### Media Sharing
- Users can upload files and images inside any chat
- Uploaded files are stored in `server/uploads`

---

## Screenshots

Screenshots of all major pages are added in the `docs/screenshots` folder and also attached in the submission email.

### Suggested Pages
- Login
- Signup
- Chat Dashboard
- Room Chat
- Private Chat
- Mobile View

---

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users
- `GET /api/users`

### Chat
- `GET /api/chat/overview`
- `POST /api/chat/rooms`
- `POST /api/chat/rooms/:roomId/join`
- `POST /api/chat/conversations`
- `GET /api/chat/messages/:chatType/:chatId`
- `POST /api/chat/messages/:chatType/:chatId`

---

## Notes
- Messages are stored in MongoDB for chat history
- Real-time updates are handled through Socket.IO
- Uploaded files are served from the backend under `/uploads`
- Current implementation stores uploads locally. For production, cloud storage like AWS S3 or Cloudinary can be used

---

## Future Improvements
- Read receipts
- Group room invitations
- Online presence and last seen indicators
- Message reactions and edits
- Deployment with Docker and cloud storage

---

## Project Screenshot

<img width="1832" height="915" alt="ChatSpace Screenshot" src="https://github.com/user-attachments/assets/c42330dc-84d3-4bf5-8657-ea7497f4493d" />
<img width="825" height="919" alt="Screenshot 2026-04-08 231527" src="https://github.com/user-attachments/assets/28f8bdae-99e0-4e02-b472-eabfab8d5234" />
<img width="1372" height="864" alt="Screenshot 2026-04-08 232816" src="https://github.com/user-attachments/assets/b967f3c4-4187-4ec1-87ab-990770ff5463" />
<img width="1854" height="926" alt="Screenshot 2026-04-08 231350" src="https://github.com/user-attachments/assets/613a2731-c757-49aa-8b90-9f3a35f4109e" />
<img width="1842" height="892" alt="Screenshot 2026-04-08 233018" src="https://github.com/user-attachments/assets/36288218-d806-4634-ab30-8b1820a0ee84" />


