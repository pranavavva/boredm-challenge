import { useEffect, useState, createContext, ReactNode } from "react";

const WEBSOCKET_URL = "ws://localhost:5000/ws";
const SOCKET_RECONNECT_TIMEOUT = 5000;

const websocket = new WebSocket(WEBSOCKET_URL);

export const SocketContext = createContext(websocket);

interface ISocketProvider {
    children: ReactNode;
}

export const SocketProvider = (props: ISocketProvider) => {
    const [ws, setWs] = useState<WebSocket>(websocket);

    useEffect(() => {
        const onClose = () => {
            setTimeout(() => {
                setWs(new WebSocket(WEBSOCKET_URL));
            }, SOCKET_RECONNECT_TIMEOUT);
        };

        ws.addEventListener("close", onClose);

        return () => {
            ws.removeEventListener("close", onClose);
        };
    }, [ws]);

    return (
        <SocketContext.Provider value={ws}>
            {props.children}
        </SocketContext.Provider>
    );
};
