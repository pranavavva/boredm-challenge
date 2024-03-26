import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import {
    customer_columns,
    customer_rows,
    inventory_columns,
    inventory_rows,
} from "./mock-data";

export default function App() {
    // simple websocket test
    const ws = new WebSocket("ws://localhost:5000/ws");
    ws.onopen = () => {
        ws.send(
            JSON.stringify({
                action: "echo",
                payload: {
                    message: "Hello, World!!!!!!!!",
                },
            })
        );
    };

    ws.onmessage = (msg: MessageEvent) => {
        console.log(`Message received: ${msg.data}`);
    };

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                    </Typography>

                    <Box sx={{ height: 400, width: "100%" }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Customers
                        </Typography>
                        <DataGrid
                            rows={customer_rows}
                            columns={customer_columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />

                        <Typography variant="h5" component="h2" gutterBottom>
                            Inventory
                        </Typography>
                        <DataGrid
                            rows={inventory_rows}
                            columns={inventory_columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    </Box>
                </Box>
            </Container>
        </>
    );
}
