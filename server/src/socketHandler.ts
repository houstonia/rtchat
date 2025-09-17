import { Server, Socket } from "socket.io";
import { SocketEvents } from "./events";
import UsersService from "./userService";

interface JoinParams {
  name: string;
  room: string;
}

interface SendMessageParams {
  message: string;
  params: { name: string; room: string };
}

interface KickParams {
  userToKick: string;
  room: string;
}

interface LeftRoomParams {
  params: { id?: string; name?: string; room?: string };
}

export default class SocketHandler {
  private io: Server;
  private usersService: UsersService;
  private activeRooms: Set<string> = new Set();
  private roomCreators: Map<string, string> = new Map();

  constructor(io: Server, usersService: UsersService) {
    this.io = io;
    this.usersService = usersService;
    this.init();
  }

  private init() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`New connection: ${socket.id}`);

      // Send current rooms list to newly connected socket
      socket.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));

      socket.on(SocketEvents.JOIN, (params: JoinParams) => this.handleJoin(socket, params));
      socket.on(SocketEvents.KICK_USER, (params: KickParams) => this.handleKick(socket, params));
      socket.on(SocketEvents.SEND_MESSAGE, (params: SendMessageParams) => this.handleSendMessage(params));
      socket.on(SocketEvents.LEFT_ROOM, (params: LeftRoomParams) => this.handleLeftRoom(params));
      socket.on(SocketEvents.DISCONNECT, () => this.handleDisconnect(socket));
      socket.on(SocketEvents.GET_ROOMS, () => {
        socket.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));
      });

    });
  }

  private handleJoin(socket: Socket, { name, room }: JoinParams) {
    socket.join(room);

    // Create room if it does not exist
    if (!this.activeRooms.has(room)) {
      this.activeRooms.add(room);
      this.roomCreators.set(room, name);
      console.log(`New room created: ${room} by ${name}`);

      // Notify all clients about updated rooms list
      this.io.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));
    }

    const { user, isExist } = this.usersService.addUser({ socket, name, room });

    // Welcome message only to the new user
    const welcomeMessage = isExist ? `${user.name}, welcome back!` : `Hello ${user.name}`;

    socket.emit(SocketEvents.MESSAGE, {
      data: { user: { name: "Admin" }, message: welcomeMessage }
    });
    // Notify all other users in the room
    socket.broadcast.to(user.room).emit(SocketEvents.MESSAGE, {
      data: { user: { name: "Admin" }, message: `${user.name} joined the room` }
    });

    // Send updated room info to all users in the room
    this.io.to(user.room).emit(SocketEvents.ROOM, {
      data: {
        users: this.usersService.getRoomUsers(user.room),
        creator: this.roomCreators.get(user.room),
      },
    });
  }

  private handleKick(socket: Socket, { userToKick, room }: KickParams) {
    const creator = this.roomCreators.get(room);
    const requester = this.usersService.findUserById(socket.id);

    if (requester && requester.name === creator) {
      const user = this.usersService.findUser({ name: userToKick, room });
      if (user) {
        const kickedSocket = this.io.sockets.sockets.get(user.id);
        if (kickedSocket) {
          kickedSocket.emit(SocketEvents.KICKED);
          kickedSocket.leave(room);
        }

        this.usersService.removeUser({ id: user.id });

        this.io.to(room).emit(SocketEvents.MESSAGE, {
          data: { user: { name: "Admin" }, message: `${userToKick} was kicked` },
        });
        this.io.to(room).emit(SocketEvents.ROOM, { data: { users: this.usersService.getRoomUsers(room) } });
      }
    }

    if (this.usersService.getRoomUsers(room).length === 0) {
      this.activeRooms.delete(room);
      this.roomCreators.delete(room);
      this.io.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));
    }

  }

  private handleSendMessage({ message, params }: SendMessageParams) {
    const user = this.usersService.findUser(params);
    if (user) {
      this.io.to(user.room).emit(SocketEvents.MESSAGE, { data: { user, message } });
    }
  }

  private handleLeftRoom({ params }: LeftRoomParams) {
    const user = this.usersService.removeUser(params);
    if (user) {
      this.io.to(user.room).emit(SocketEvents.MESSAGE, {
        data: { user: { name: "Admin" }, message: `${user.name} left the room` },
      });
      this.io.to(user.room).emit(SocketEvents.ROOM, { data: { users: this.usersService.getRoomUsers(user.room) } });

      if (this.usersService.getRoomUsers(user.room).length === 0) {
        this.activeRooms.delete(user.room);
        this.roomCreators.delete(user.room);
        this.io.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));
      }
    }
  }

  private handleDisconnect(socket: Socket) {
    const user = this.usersService.removeUser({ id: socket.id });
    if (user) {
      this.io.to(user.room).emit(SocketEvents.MESSAGE, {
        data: { user: { name: "Admin" }, message: `${user.name} disconnected` },
      });
      this.io.to(user.room).emit(SocketEvents.ROOM, { data: { users: this.usersService.getRoomUsers(user.room) } });

      if (this.usersService.getRoomUsers(user.room).length === 0) {
        this.activeRooms.delete(user.room);
        this.roomCreators.delete(user.room);
        this.io.emit(SocketEvents.ROOMS_LIST, Array.from(this.activeRooms));
      }
    }
    console.log(`Disconnected: ${socket.id}`);
  }

}
