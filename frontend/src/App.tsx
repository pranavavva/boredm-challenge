import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { useSocket } from "./utils/useSocket";
import { Action } from "./utils/types";

export default function App() {
    const [lastMessage, sendPayload] = useSocket();

    React.useEffect(() => {
        console.log(lastMessage);
    }, [lastMessage]);

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
