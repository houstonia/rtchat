import React, { useEffect, useState } from 'react';

import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './Chat.module.scss';
import { Messages } from '../components/Messages';
import { useSocket } from '../contexts/ChatContext';
import { stringFormatter } from '../shared/helper';
import { SocketEvents } from '../shared/socketEvents';

interface Params {
  name: string;
  room: string;
}

interface ChatMessage {
  user: { name: string };
  message: string;
}

export const Chat: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [params, setParams] = useState<Params>({
    name: '',
    room: '',
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState(0);
  const [userList, setUserList] = useState<string[]>([]);
  const [creator, setCreator] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract query params and join room once
  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search)) as Record<string, string>;
    const params: Params = {
      name: searchParams.name || '',
      room: searchParams.room || '',
    };

    setParams(params);

    socket.emit(SocketEvents.JOIN, params);
  }, [search, socket]);

  // Socket listeners
  useEffect(() => {
    const handleMessage = ({ data }: { data: ChatMessage }) =>
      setMessages((prev) => [...prev, data]);

    const handleRoom = ({ data: { users, creator } }: any) => {
      setUsers(users.length);

      setUserList(users.map((u: any) => u.name));

      setCreator(creator || '');
    };

    const handleKicked = () => {
      alert('You were kicked from the chat.');

      navigate('/');
    };

    socket.on(SocketEvents.MESSAGE, handleMessage);

    socket.on(SocketEvents.ROOM, handleRoom);

    socket.on(SocketEvents.KICKED, handleKicked);

    return () => {
      socket.off(SocketEvents.MESSAGE, handleMessage);

      socket.off(SocketEvents.ROOM, handleRoom);

      socket.off(SocketEvents.KICKED, handleKicked);
    };
  }, [navigate, socket]);

  const handleKick = (userToKick: string) => {
    socket.emit(SocketEvents.KICK_USER, {
      userToKick,
      room: params.room,
    });
  };

  const leaveRoom = () => {
    socket.emit(SocketEvents.LEFT_ROOM, { params });

    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  // Action for sending messages
  const sendMessageAction = (formData: FormData) => {
    const message = formData.get('message')?.toString().trim();
    if (!message) return;

    socket.emit(SocketEvents.SEND_MESSAGE, {
      message,
      params,
    });

    // Clear input after sending
    formData.delete('message');
  };

  const filteredUsers = userList.filter((u) => u.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={styles.Chat}>
      <div className={styles.ChatHeader}>
        <div className={styles.ChatTitle}>
          <h2>{params.room}</h2>
          <span>{users} members</span>
        </div>
        <button className={styles.left} onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <Messages messages={messages} name={params.name} />

      <form action={(formData: FormData) => sendMessageAction(formData)}>
        <input type="text" name="message" placeholder="Your message" autoComplete="off" required />
        <button type="submit">Send</button>
      </form>

      <div className={styles.Sidebar}>
        <h3>Members</h3>
        <div className={styles.Search}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <ul>
          {filteredUsers.map((user) => (
            <li key={user}>
              {user}
              {creator &&
                stringFormatter(params.name) === stringFormatter(creator) &&
                stringFormatter(user) !== stringFormatter(params.name) && (
                  <button className={styles.KickBtn} onClick={() => handleKick(user)}>
                    <X color="black" />
                  </button>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
