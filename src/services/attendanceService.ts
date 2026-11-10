import axios from 'axios';
import { API_BASE, ENDPOINTS } from '../config/api';
import { getAuthHeader } from './authService';

export interface Attendance {
  id: number;
  employeeId: number;
  checkIn: string;
  checkOut: string | null;
  workHours: number | null;
  latitude?: number | null;
  longitude?: number | null;
  eventType: 'CHECK_IN' | 'CHECK_OUT';
}

export const checkIn = async (
  employeeId: number,
  latitude?: number,
  longitude?: number
): Promise<Attendance> => {
  const headers = await getAuthHeader();
  const response = await axios.post(
    `${API_BASE}${ENDPOINTS.attendanceCheckIn}`,
    { employeeId, latitude, longitude },
    { headers }
  );
  return response.data;
};

export const checkOut = async (employeeId: number): Promise<Attendance> => {
  const headers = await getAuthHeader();
  const response = await axios.post(
    `${API_BASE}${ENDPOINTS.attendanceCheckOut}`,
    { employeeId },
    { headers }
  );
  return response.data;
};