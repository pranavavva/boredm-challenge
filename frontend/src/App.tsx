import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import useWebSocket from "./useWebSocket";

export default function App() {
    const { sendMessage, lastMessage, status } = useWebSocket(
        "ws://localhost:5000/ws"
    );

    React.useEffect(() => {
        if (lastMessage) {
            console.log("Received message:", lastMessage);
        }
    }, [lastMessage]);

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                        <button
                            onClick={() =>
                                sendMessage(
                                    JSON.stringify({
                                        action: "customer:create",
                                        payload: [
                                            {
                                                name: "Pranav Avva",
                                                email: "avva@prineton.edu",
                                            },
                                        ],
                                    })
                                )
                            }
                        >
                            Send Message
                        </button>
                    </Typography>
                </Box>
            </Container>
        </>
    );
}
