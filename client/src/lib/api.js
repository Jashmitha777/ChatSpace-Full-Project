import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL
});

export const attachToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getAssetUrl = (fileUrl) => {
  if (!fileUrl) {
    return '';
  }

  const baseUrl = API_URL.replace(/\/api$/, '');
  return `${baseUrl}${fileUrl}`;
};
