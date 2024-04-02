import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSocket } from "./utils/useSocket";
import { Action, IItem, ICustomer } from "./utils/types";

export default function App() {
    const [lastMessage, sendPayload] = useSocket();

    // these could be undefined on first render (before the websocket connection is established)
    const [items, setItems] = React.useState<IItem[]>([]);
    const [customers, setCustomers] = React.useState<ICustomer[]>([]);

    // update the state when a new message is received
    // if the lastMessage isn't defined, keep the existing state
    React.useEffect(() => {
        setCustomers(lastMessage?.customer ? lastMessage.customer : customers);
        setItems(lastMessage?.item ? lastMessage.item : items);
    }, [lastMessage]);

    const customerColumns: GridColDef<(typeof customers)[number]>[] =
        React.useMemo(
            () => [
                { field: "customer_id", headerName: "Customer ID", width: 200 },
                {
                    field: "name",
                    headerName: "Name",
                    editable: true,
                    width: 200,
                },
                {
                    field: "email",
                    headerName: "Email",
                    editable: true,
                    width: 200,
                },
            ],
            []
        );

    const itemColumns: GridColDef<(typeof items)[number]>[] = React.useMemo(
        () => [
            { field: "item_id", headerName: "Item ID", width: 200 },
            { field: "name", headerName: "Name", editable: true, width: 200 },
            {
                field: "quantity",
                headerName: "Quantity",
                editable: true,
                width: 200,
            },
            { field: "price", headerName: "Price", editable: true, width: 200 },
        ],
        []
    );

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                    </Typography>
                    <Box sx={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={customers}
                            columns={customerColumns}
                            getRowId={(row) => row.customer_id}
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
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={items}
                        columns={itemColumns}
                        getRowId={(row) => row.item_id}
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
            </Container>
        </>
    );
}
