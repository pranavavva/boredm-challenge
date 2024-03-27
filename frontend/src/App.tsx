// import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";

export default function App() {
    // simple websocket test
    const ws = new WebSocket("ws://localhost:5000/ws");
    ws.onopen = () => {
        ws.send(
            JSON.stringify({
                action: "customer:create",
                payload: [
                    {
                        name: "John Doe",
                        email: "john.doe@example.com",
                    },
                    {
                        name: "Jane Doe",
                        email: "jane.doeexample.com",
                    }
                ],
            })
        );

        ws.send(
            JSON.stringify({
                action: "customer:delete-all",
                payload: [],
            })
        );
    };

    ws.onmessage = (msg: MessageEvent) => {
        console.log(JSON.parse(msg.data));
    };

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                    </Typography>
                </Box>
            </Container>
        </>
    );
}
