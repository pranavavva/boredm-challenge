import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { useSocket } from "./utils/useSocket";

export default function App() {
    const socket = useSocket();

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                        <button
                            onClick={() => {
                                socket.send(
                                    JSON.stringify({
                                        action: "customer:create",
                                        payload: [
                                            {
                                                name: "Pranav Avva",
                                                email: "avva@princeton.edu",
                                            },
                                        ],
                                    })
                                );
                                socket.send(
                                    JSON.stringify({
                                        action: "customer:create",
                                        payload: [
                                            {
                                                name: "Mary Jane",
                                                email: "mary.jane@example.com",
                                            },
                                        ],
                                    })
                                );
                            }}
                        >
                            Send Message
                        </button>
                    </Typography>
                </Box>
            </Container>
        </>
    );
}
