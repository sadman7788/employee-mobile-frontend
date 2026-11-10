import axios from 'axios';
import { API_BASE, ENDPOINTS } from '../config/api';
import { getAuthHeader } from './authService';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  rfid: string;
  status: string;
  photoUrl?: string | null;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE}${ENDPOINTS.employees}`, { headers });
  return response.data;
};

export const createEmployee = async (employee: Partial<Employee>): Promise<Employee> => {
  const headers = await getAuthHeader();
  const response = await axios.post(`${API_BASE}${ENDPOINTS.employees}`, employee, { headers });
  return response.data;
};

export const updateEmployeeStatus = async (id: number, status: string): Promise<Employee> => {
  const headers = await getAuthHeader();
  const response = await axios.patch(
    `${API_BASE}${ENDPOINTS.employees}/${id}/status`,
    { status },
    { headers }
  );
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  const headers = await getAuthHeader();
  await axios.delete(`${API_BASE}${ENDPOINTS.employees}/${id}`, { headers });
};

export const uploadEmployeePhoto = async (
  id: number,
  uri: string
): Promise<{ photoUrl: string }> => {
  const token = await getAuthHeader();
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `photo_${id}.jpg`,
    type: 'image/jpeg',
  } as any);

  const response = await axios.post(
    `${API_BASE}${ENDPOINTS.employees}/${id}/photo`,
    formData,
    {
      headers: {
        ...token,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
