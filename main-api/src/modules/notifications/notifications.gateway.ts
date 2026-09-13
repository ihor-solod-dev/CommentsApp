import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private userSocketMap = new Map<number, Set<string>>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                publicKey: this.configService.get<string>('JWT_ACCESS_PUBLIC_KEY'),
                algorithms: ['RS256'],
            });

            const userId: number = payload.sub;
            client.data.userId = userId;

            if (!this.userSocketMap.has(userId)) {
                this.userSocketMap.set(userId, new Set());
            }
            this.userSocketMap.get(userId)!.add(client.id);
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.userSocketMap.get(userId);
            sockets?.delete(client.id);
            if (sockets?.size === 0) this.userSocketMap.delete(userId);
        }
    }

    async notifyUser(userId: number, payload: Record<string, unknown>) {
        const socketIds = this.userSocketMap.get(userId);
        if (!socketIds?.size) return;

        for (const socketId of socketIds) {
            this.server.to(socketId).emit('notification', payload);
        }
    }
}