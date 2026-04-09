const Sidebar = ({
  rooms,
  conversations,
  users,
  activeChat,
  currentUserId,
  onSelectChat,
  onCreateRoom,
  onStartConversation,
  creatingRoom
}) => {
  const roomName = (room) => room.name;
  const conversationName = (conversation, currentUserId) =>
    conversation.participants.find((participant) => participant._id !== currentUserId)?.name || 'Direct chat';

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Rooms</h3>
          <button className="secondary-button" onClick={onCreateRoom} disabled={creatingRoom}>
            {creatingRoom ? 'Creating...' : 'New room'}
          </button>
        </div>
        <div className="chat-list">
          {rooms.map((room) => (
            <button
              key={room._id}
              className={`chat-list-item ${activeChat?.id === room._id && activeChat.type === 'room' ? 'active' : ''}`}
              onClick={() => onSelectChat({ id: room._id, type: 'room', title: roomName(room) })}
            >
              <strong># {room.name}</strong>
              <span>{room.members.length} members</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Direct messages</h3>
        </div>
        <div className="chat-list">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              className={`chat-list-item ${activeChat?.id === conversation._id && activeChat.type === 'private' ? 'active' : ''}`}
              onClick={() =>
                onSelectChat({
                  id: conversation._id,
                  type: 'private',
                  title: conversationName(conversation, currentUserId)
                })
              }
            >
              <strong>{conversationName(conversation, currentUserId)}</strong>
              <span>Private conversation</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Start a chat</h3>
        </div>
        <div className="user-list">
          {users.map((user) => (
            <button key={user._id} className="user-chip" onClick={() => onStartConversation(user)}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
