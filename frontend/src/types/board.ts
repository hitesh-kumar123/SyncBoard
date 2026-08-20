export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export type BoardCategory = "ACTIVE" | "DESIGN" | "ARCHIVE";

export type CanvasTool =
  | "select"
  | "pan"
  | "rectangle"
  | "circle"
  | "pencil"
  | "text"
  | "eraser"
  | "zoom";

export type SyncStatus = "CONNECTED" | "SYNCING" | "OFFLINE" | "RECONNECTING" | "SYNCED";

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: BoardRole;
  color: string;
  isOnline?: boolean;
  lastActive?: string;
}

export type ElementType = "rectangle" | "circle" | "pencil" | "text";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation?: number;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RectElementData extends BaseElement {
  type: "rectangle";
  width: number;
  height: number;
  cornerRadius?: number;
}

export interface CircleElementData extends BaseElement {
  type: "circle";
  radius: number;
}

export interface FreehandElementData extends BaseElement {
  type: "pencil";
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface TextElementData extends BaseElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily?: string;
  width?: number;
}

export type BoardElement =
  | RectElementData
  | CircleElementData
  | FreehandElementData
  | TextElementData;

export interface Board {
  id: string;
  title: string;
  description?: string;
  category: BoardCategory;
  createdAt: string;
  updatedAt: string;
  owner: Collaborator;
  collaborators: Collaborator[];
  elements: BoardElement[];
  thumbnailUrl?: string;
}
