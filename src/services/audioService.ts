import axios from 'axios';
import { API_BASE, ENDPOINTS } from '../config/api';
import { getAuthHeader } from './authService';

export const uploadVoiceNote = async (
  id: number,
  uri: string
): Promise<{ voiceNoteUrl: string }> => {
  const headers = await getAuthHeader();
  
  // Create a form data object to send the file
  const formData = new FormData();
  
  // Append the audio file
  formData.append('file', {
    uri,
    name: `voice_${id}.m4a`,
    type: 'audio/m4a', // Standard audio format for iOS and Android
  } as any);

  // Send the POST request to the backend endpoint we created in Step 3
  const response = await axios.post(
    `${API_BASE}${ENDPOINTS.employees}/${id}/voice-note`,
    formData,
    { 
      headers: { 
        ...headers, 
        'Content-Type': 'multipart/form-data' 
      } 
    }
  );
  
  return response.data;
};
