import { useRef, useState } from 'react';

const MessageComposer = ({ onSend, sending, onTyping, onStopTyping, error }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim() && !file) {
      return;
    }

    await onSend({ content: message, file });
    setMessage('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer-main">
        <textarea
          rows={3}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (event.target.value) {
              onTyping();
            } else {
              onStopTyping();
            }
          }}
          onBlur={onStopTyping}
          placeholder="Type your message..."
        />
        <div className="composer-actions">
          <label className="file-picker">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            Attach file
          </label>
          {file ? <span className="file-name">{file.name}</span> : null}
          <button className="primary-button" type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {error ? <div className="form-error">{error}</div> : null}
      </div>
    </form>
  );
};

export default MessageComposer;
