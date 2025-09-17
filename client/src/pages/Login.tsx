import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styles from './Login.module.scss';
import { useSocket } from '../contexts/ChatContext';
import { SocketEvents } from '../shared/socketEvents';

const Login: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [existingRooms, setExistingRooms] = useState<string[]>([]);
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);

  useEffect(() => {
    socket.emit(SocketEvents.GET_ROOMS);

    const handleRoomsList = (rooms: string[]) => setExistingRooms(rooms);

    socket.on(SocketEvents.ROOMS_LIST, handleRoomsList);

    return () => {
      socket.off(SocketEvents.ROOMS_LIST, handleRoomsList);
    };
  }, [socket]);

  const handleNewRoomClick = () => setShowNewRoomInput(true);

  const handleLogin = (formData: FormData) => {
    const username = formData.get('username')?.toString().trim();
    const room = formData.get('room')?.toString().trim();

    if (!username || !room) {
      alert('Username and room are required');

      return;
    }

    navigate(`/chat?name=${username}&room=${room}`);
  };

  return (
    <div className={styles.Login}>
      <form action={handleLogin}>
        <h1 className={styles.Title}>Register</h1>
        <div className={styles.Container}>
          <input type="text" name={'username'} placeholder="Username" autoComplete="off" required />
        </div>

        <div className={styles.Container}>
          {!showNewRoomInput ? (
            <>
              <select name={'room'} required>
                <option value="">-- Select a Room --</option>
                {existingRooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleNewRoomClick}>
                Create New Room
              </button>
            </>
          ) : (
            <input
              type="text"
              name={'room'}
              placeholder="New Room Name"
              autoComplete="off"
              required
            />
          )}
        </div>

        <button type="submit">{showNewRoomInput ? 'Create Room' : 'Join'}</button>
      </form>
    </div>
  );
};

export default Login;
