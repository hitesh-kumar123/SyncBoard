export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
