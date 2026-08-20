import { Collaborator } from "./board";

export interface RemoteCursor {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  lastUpdate: number;
}

export interface PresenceUser extends Collaborator {
  cursor?: {
    x: number;
    y: number;
  };
  selectedElementIds?: string[];
}
