import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageComposer from '../components/MessageComposer.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatPage = () => {
  const { auth, logout } = useAuth();
  const socketRef = useRef(null);
  const activeChatRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [sendError, setSendError] = useState('');

  const currentUserId = auth?.user?._id;

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingChats(true);
      try {
        const [{ data: overview }, { data: userList }] = await Promise.all([
          api.get('/chat/overview'),
          api.get('/users')
        ]);

        setRooms(overview.rooms);
        setConversations(overview.conversations);
        setUsers(userList);

        if (overview.rooms[0]) {
          setActiveChat({ id: overview.rooms[0]._id, type: 'room', title: overview.rooms[0].name });
        } else if (overview.conversations[0]) {
          const other = overview.conversations[0].participants.find((item) => item._id !== currentUserId);
          setActiveChat({ id: overview.conversations[0]._id, type: 'private', title: other?.name || 'Direct chat' });
        }
      } finally {
        setLoadingChats(false);
      }
    };

    loadInitialData();
  }, [currentUserId]);

  useEffect(() => {
    if (!auth?.token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: auth.token }
    });

    socket.on('new-message', (message) => {
      const targetId = message.chatType === 'room' ? message.room?._id : message.conversation?._id;
      const currentChat = activeChatRef.current;

      if (targetId === currentChat?.id && message.chatType === currentChat?.type) {
        setMessages((current) =>
          current.some((item) => item._id === message._id) ? current : [...current, message]
        );
      }
    });

    socket.on('typing', ({ chatId, chatType, user }) => {
      const currentChat = activeChatRef.current;
      if (chatId === currentChat?.id && chatType === currentChat?.type && user._id !== currentUserId) {
        setTypingUser(user.name);
      }
    });

    socket.on('stop-typing', ({ chatId, chatType }) => {
      const currentChat = activeChatRef.current;
      if (chatId === currentChat?.id && chatType === currentChat?.type) {
        setTypingUser('');
      }
    });

    socket.on('conversation-updated', (conversation) => {
      setConversations((current) => {
        const exists = current.some((item) => item._id === conversation._id);
        return exists ? current : [conversation, ...current];
      });
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [auth?.token, currentUserId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat?.id) {
        setMessages([]);
        return;
      }

      const { data } = await api.get(`/chat/messages/${activeChat.type}/${activeChat.id}`);
      setMessages(data);
    };

    loadMessages();
  }, [activeChat]);

  const headerSubtitle = useMemo(() => {
    if (!activeChat) {
      return 'Choose a room or start a direct conversation.';
    }

    return activeChat.type === 'room' ? 'Shared room conversation' : 'Private conversation';
  }, [activeChat]);

  const handleCreateRoom = async () => {
    const roomName = window.prompt('Enter a room name');
    if (!roomName) {
      return;
    }

    setCreatingRoom(true);
    try {
      const { data } = await api.post('/chat/rooms', { name: roomName });
      setRooms((current) => [data, ...current]);
      setActiveChat({ id: data._id, type: 'room', title: data.name });
      socketRef.current?.emit('join-room', data._id);
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleStartConversation = async (user) => {
    const { data } = await api.post('/chat/conversations', { participantId: user._id });
    setConversations((current) => {
      const exists = current.some((item) => item._id === data._id);
      return exists ? current : [data, ...current];
    });
    setActiveChat({ id: data._id, type: 'private', title: user.name });
    socketRef.current?.emit('join-conversation', data._id);
  };

  const handleSendMessage = async ({ content, file }) => {
    if (!activeChat) {
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const { data } = await api.post(`/chat/messages/${activeChat.type}/${activeChat.id}`, formData);

      setMessages((current) => (current.some((item) => item._id === data._id) ? current : [...current, data]));
      socketRef.current?.emit('stop-typing', {
        chatType: activeChat.type,
        chatId: activeChat.id
      });
      setTypingUser('');
    } catch (error) {
      setSendError(error.response?.data?.message || 'Unable to send this file right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-shell">
      <Sidebar
        rooms={rooms}
        conversations={conversations}
        users={users}
        activeChat={activeChat}
        currentUserId={currentUserId}
        onSelectChat={setActiveChat}
        onCreateRoom={handleCreateRoom}
        onStartConversation={handleStartConversation}
        creatingRoom={creatingRoom}
      />

      <main className="chat-main">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Logged in as {auth?.user?.name}</p>
            <h2>{activeChat?.title || 'Welcome to ChatSpace'}</h2>
            <p>{headerSubtitle}</p>
          </div>
          <button className="secondary-button" onClick={logout}>
            Log out
          </button>
        </header>

        <section className="chat-body">
          {loadingChats ? (
            <div className="screen-center">Loading conversations...</div>
          ) : activeChat ? (
            <>
              <MessageList messages={messages} currentUserId={currentUserId} typingUser={typingUser} />
              <MessageComposer
                onSend={handleSendMessage}
                sending={sending}
                error={sendError}
                onTyping={() =>
                  socketRef.current?.emit('typing', { chatType: activeChat.type, chatId: activeChat.id })
                }
                onStopTyping={() =>
                  socketRef.current?.emit('stop-typing', { chatType: activeChat.type, chatId: activeChat.id })
                }
              />
            </>
          ) : (
            <div className="empty-state">
              <h3>No chat selected yet</h3>
              <p>Create a room or start a private conversation from the left panel.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChatPage;
