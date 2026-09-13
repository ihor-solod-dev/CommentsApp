import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getAccessToken } from '../api/axios.instance';

const WS_URL = import.meta.env.VITE_WS_URL;

let socket: Socket | null = null;

export function useWebSocket(isAuthenticated: boolean) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            socketRef.current?.disconnect();
            socket = null;
            return;
        }

        const token = getAccessToken();
        if (!token) return;

        if (socket?.connected) return;

        socket = io(WS_URL, {
            auth: { token },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('notification', (data: { type: string; message: string }) => {
            if (data.type === 'reply') {
                toast(data.message, { icon: '💬', duration: 5000 });
            }
        });

        socket.on('connect_error', () => {
            console.warn('WebSocket connection failed');
        });

        return () => {
            socket?.disconnect();
            socket = null;
        };
    }, [isAuthenticated]);
}