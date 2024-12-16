export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error?: string;
}