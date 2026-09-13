import axios from 'axios';

const FILES_URL = import.meta.env.VITE_FILES_URL;

export const filesClient = axios.create({
    baseURL: FILES_URL,
});