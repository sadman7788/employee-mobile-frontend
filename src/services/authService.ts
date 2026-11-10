import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { API_BASE, ENDPOINTS } from '../config/api';

export const login = async (username: string, password: string): Promise<string> => {
  const response = await axios.post(`${API_BASE}${ENDPOINTS.login}`, {
    username,
    password,
  });
  const token = response.data.token;
  
  // Use SecureStore instead of AsyncStorage
  await SecureStore.setItemAsync('jwt_token', token);
  
  return token;
};

export const getToken = async (): Promise<string | null> => {
  // Use SecureStore instead of AsyncStorage
  return await SecureStore.getItemAsync('jwt_token');
};

export const logout = async (): Promise<void> => {
  // Use SecureStore instead of AsyncStorage
  await SecureStore.deleteItemAsync('jwt_token');
};

export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserRole = async (): Promise<string | null> => {
  const token = await getToken();
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role ? decoded.role.replace('ROLE_', '') : null;
  } catch (e) {
    return null;
  }
};