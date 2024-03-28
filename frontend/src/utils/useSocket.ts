import { useCallback, useEffect, useContext } from "react";
import { SocketContext } from "./SocketProvider";

export const useSocket = () => {
    const socket = useContext(SocketContext);

    const onMessage = useCallback((message: MessageEvent) => {
        const data = JSON.parse(message?.data);
        console.log(data);
    }, []);

    useEffect(() => {
        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        };
    }, [socket, onMessage]);

    return socket;
};
