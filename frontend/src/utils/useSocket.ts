import { useState, useCallback, useEffect, useContext } from "react";
import { SocketContext } from "./SocketProvider";
import { IPayload, IStateResponse } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isIPayload = (payload: any): payload is IPayload => {
    return (
        payload &&
        payload.action &&
        typeof payload.action === typeof "Action" &&
        payload.payload &&
        Array.isArray(payload.payload)
    );
};

export const useSocket = (): [IStateResponse | undefined, (payload: IPayload) => void] => {
    const socket = useContext(SocketContext);
    const [lastMessage, setLastMessage] = useState<IStateResponse | undefined>();

    const sendPayload = (payload: IPayload) => {
        if (!isIPayload(payload))
            throw new Error(
                "Invalid payload format. Please use the IPayload interface."
            );
        socket.send(JSON.stringify(payload));
    };

    const onMessage = useCallback((message: MessageEvent) => {
        const data = JSON.parse(message?.data);
        setLastMessage(data);
    }, []);

    useEffect(() => {
        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        };
    }, [socket, onMessage]);

    return [lastMessage, sendPayload];
};
