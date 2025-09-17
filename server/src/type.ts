export interface IUser {
  id: string;
  name: string;
  room: string;
}

export interface IAddUserParams {
  socket: { id: string };
  name: string;
  room: string;
}

export interface IFindUserParams {
  name: string;
  room: string;
}

export interface IRemoveUserParams {
  id?: string;
  name?: string;
  room?: string;
}
