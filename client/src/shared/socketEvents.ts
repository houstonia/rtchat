export const SocketEvents = {
  JOIN: 'join',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE: 'message',
  ROOM: 'room',
  KICK_USER: 'kickUser',
  KICKED: 'kicked',
  LEFT_ROOM: 'leftRoom',
  DISCONNECT: 'disconnect',
  ROOMS_LIST: 'roomsList',
  GET_ROOMS: 'getRooms',
} as const;
