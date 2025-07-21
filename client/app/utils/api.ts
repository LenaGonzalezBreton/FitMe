import axios from 'axios';

// You should replace this with your actual server URL, potentially from an environment variable
const API_URL = 'http://10.18.207.52:3000'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 