import React, { useEffect, useRef } from 'react';

import styles from './Messages.module.scss';
import { stringFormatter } from '../shared/helper';

interface ChatMessage {
  user: { name: string };
  message: string;
}

interface MessagesProps {
  messages: ChatMessage[];
  name: string;
}

export const Messages: React.FC<MessagesProps> = ({ messages, name }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.Messages}>
      {messages.map(({ user, message }) => {
        const isMine = stringFormatter(user.name) === stringFormatter(name);
        return (
          <div className={`${styles.Message} ${isMine ? styles.MyMessage : styles.OtherMessage}`}>
            <span className={styles.MessageSender}>{user.name}</span>
            <span className={styles.MessageBody}>{message}</span>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
