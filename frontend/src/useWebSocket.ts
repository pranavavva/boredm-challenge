import * as React from "react";

// A custom hook to handle WebSocket connections
const useWebSocket = (url: string) => {
    const [lastMessage, setLastMessage] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState("CLOSED");
    const websocket = React.useRef<WebSocket | null>(null);

    // Function to send a message through the WebSocket
    const sendMessage = React.useCallback((message: string) => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            websocket.current.send(message);
        }
    }, []);

    React.useEffect(() => {
        // Create WebSocket connection
        websocket.current = new WebSocket(url);
        setStatus('CONNECTING');

        // Connection opened
        websocket.current.onopen = () => setStatus('CONNECTED');

        // Listen for messages
        websocket.current.onmessage = (event) => {
            setLastMessage(event.data);
        };

        // Listen for potential errors
        websocket.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setStatus('error');
        };

        // Connection closed
        websocket.current.onclose = () => setStatus('CLOSED');

        // Cleanup on unmount
        return () => {
            if (websocket.current?.readyState !== WebSocket.CLOSED) websocket.current?.close();
            websocket.current = null;
        };
    }, [url]);

    return { sendMessage, lastMessage, status };
}

export default useWebSocket;