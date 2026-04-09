import { getAssetUrl } from '../lib/api';

const formatTime = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

const MessageList = ({ messages, currentUserId, typingUser }) => (
  <div className="message-list">
    {messages.map((message) => {
      const isMine = message.sender?._id === currentUserId;
      const attachmentUrl = message.attachment?.fileUrl ? getAssetUrl(message.attachment.fileUrl) : '';
      const isImage = message.attachment?.mimeType?.startsWith('image/');

      return (
        <article key={message._id} className={`message-card ${isMine ? 'mine' : ''}`}>
          <div className="message-meta">
            <strong>{isMine ? 'You' : message.sender?.name || 'User'}</strong>
            <span>{formatTime(message.createdAt)}</span>
          </div>
          {message.content ? <p>{message.content}</p> : null}
          {attachmentUrl ? (
            isImage ? (
              <a href={attachmentUrl} target="_blank" rel="noreferrer">
                <img src={attachmentUrl} alt={message.attachment.originalName} className="message-image" />
              </a>
            ) : (
              <a href={attachmentUrl} target="_blank" rel="noreferrer" className="attachment-link">
                {message.attachment.originalName}
              </a>
            )
          ) : null}
        </article>
      );
    })}

    {typingUser ? <div className="typing-indicator">{typingUser} is typing...</div> : null}
  </div>
);

export default MessageList;
