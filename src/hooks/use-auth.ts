// my-app/src/hooks/use-auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // Update with your API URL


interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      return data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      console.log('token:', localStorage.getItem('token'));
      queryClient.setQueryData(['user'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: async (userData) => {
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        
        if (!token) {
          console.log('No token found in localStorage');
          return null;
        }

        console.log('Making request to:', `${API_URL}/auth/me`);
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true // If your API uses cookies
        });
        
        console.log('Auth response:', response);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Auth error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        } else {
          console.error('Unexpected error:', error);
        }
        // Clear invalid token
        localStorage.removeItem('token');
        return null;
      }
    },
    enabled: !!localStorage.getItem('token'),
    retry: 1, // Only retry once on failure
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['user'], null);
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
};