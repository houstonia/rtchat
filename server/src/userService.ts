import type { IAddUserParams, IFindUserParams, IRemoveUserParams, IUser } from "./type";


export default class UsersService {
    private users: IUser[] = [];

    private stringFormatter(str: string): string {
        return (str || "").trim().toLowerCase();
    }

    addUser({ socket, name, room }: IAddUserParams): { user: IUser; isExist: boolean } {
        const existingUser = this.findUser({ name, room });
        if (existingUser) {
            return { user: existingUser, isExist: true };
        }

        const user: IUser = { id: socket.id, name: this.stringFormatter(name), room: this.stringFormatter(room) };
        this.users.push(user);
        return { user, isExist: false };
    }

    findUserById(id: string): IUser | undefined {
        return this.users.find(user => user.id === id);
    }

    findUser({ name, room }: IFindUserParams): IUser | undefined {
        const userName = this.stringFormatter(name);
        const userRoom = this.stringFormatter(room);
        return this.users.find(u => this.stringFormatter(u.name) === userName && this.stringFormatter(u.room) === userRoom);
    }

    getRoomUsers(room: string): IUser[] {
        return this.users.filter(u => u.room === this.stringFormatter(room));
    }

    removeUser(params: IRemoveUserParams): IUser | undefined {
        const userToRemove = params.id
            ? this.findUserById(params.id)
            : params.name && params.room
                ? this.findUser({ name: params.name, room: params.room })
                : undefined;

        if (userToRemove) {
            this.users = this.users.filter(user => user.id !== userToRemove.id);
        }
        return userToRemove;
    }

    kickUser(params: IRemoveUserParams): IUser | null {
        let index: number;

        if (params.id) {
            index = this.users.findIndex(user => user.id === params.id);
        } else if (params.name && params.room) {
            index = this.users.findIndex(
                user => this.stringFormatter(user.room) === this.stringFormatter(params.room!) && this.stringFormatter(user.name) === this.stringFormatter(params.name!)
            );
        } else {
            return null;
        }

        if (index !== -1) {
            return this.users.splice(index, 1)[0];
        }
        return null;
    }

    clearAllUsers(): void {
        this.users = [];
    }
}
