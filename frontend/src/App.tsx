import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
} from "@mui/x-data-grid";

import { useSocket } from "./utils/useSocket";
import { Action, IItem, ICustomer } from "./utils/types";
import { v4 as uuidv4 } from "uuid";
import {
    Button,
    Container,
    Box,
    Typography,
    TextField,
    Stack,
} from "@mui/material";
// import EditToolbar from "./EditToolbar";

export default function App() {
    const [lastMessage, sendPayload] = useSocket();

    const [items, setItems] = React.useState<IItem[]>([]);
    const [customers, setCustomers] = React.useState<ICustomer[]>([]);

    // form control
    const [customerName, setCustomerName] = React.useState("");
    const [customerEmail, setCustomerEmail] = React.useState("");
    const [itemName, setItemName] = React.useState("");
    const [itemQuantity, setItemQuantity] = React.useState(0);
    const [itemPrice, setItemPrice] = React.useState(0);

    // form control error state
    const [customerNameError, setCustomerNameError] = React.useState(false);
    const [customerEmailError, setCustomerEmailError] = React.useState(false);
    const [itemNameError, setItemNameError] = React.useState(false);
    const [itemQuantityError, setItemQuantityError] = React.useState(false);
    const [itemPriceError, setItemPriceError] = React.useState(false);

    // update the state when a new message is received, if the lastMessage isn't defined, keep the existing state
    React.useEffect(() => {
        setCustomers((customers) =>
            lastMessage?.customer ? lastMessage.customer : customers
        );
        setItems((items) => (lastMessage?.item ? lastMessage.item : items));
    }, [lastMessage]);

    const customerColumns: GridColDef<(typeof customers)[number]>[] =
        React.useMemo(
            () => [
                { field: "id", headerName: "Customer ID", width: 200 },
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
                {
                    field: "actions",
                    type: "actions",
                    headerName: "Actions",
                    width: 100,
                    cellClassName: "actions",
                    getActions: ({ id }) => {
                        return [
                            <GridActionsCellItem
                                icon={<DeleteIcon />}
                                label="Delete"
                                onClick={() => {
                                    // optimistically delete the row from the internal state
                                    // if the server errors, it will also send back the old state
                                    setCustomers((oldCustomers) =>
                                        oldCustomers.filter(
                                            (customer) => customer.id !== id
                                        )
                                    );
                                    sendPayload({
                                        action: Action.CUSTOMER_DELETE,
                                        payload: [id as string],
                                    });
                                }}
                            />,
                        ];
                    },
                },
            ],
            [sendPayload]
        );

    const itemColumns: GridColDef<(typeof items)[number]>[] = React.useMemo(
        () => [
            { field: "id", headerName: "Item ID", width: 200 },
            { field: "name", headerName: "Name", editable: true, width: 200 },
            {
                field: "quantity",
                headerName: "Quantity",
                editable: true,
                width: 200,
            },
            { field: "price", headerName: "Price", editable: true, width: 200 },
            {
                field: "actions",
                type: "actions",
                headerName: "Actions",
                width: 100,
                cellClassName: "actions",
                getActions: ({ id }) => {
                    return [
                        <GridActionsCellItem
                            icon={<DeleteIcon />}
                            label="Delete"
                            onClick={() => {
                                // optimistically delete the row from the internal state
                                // if the server errors, it will also send back the old state
                                setItems((oldItems) =>
                                    oldItems.filter((item) => item.id !== id)
                                );
                                sendPayload({
                                    action: Action.ITEM_DELETE,
                                    payload: [id as string],
                                });
                            }}
                        />,
                    ];
                },
            },
        ],
        [sendPayload]
    );

    const dataGridInitialState = {
        pagination: {
            paginationModel: {
                pageSize: 5,
            },
        },
    };

    const handleRowEditStop: GridEventListener<"rowEditStop"> = (
        params,
        event
    ) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = false;
        }
    };

    // genericized row update function
    const processRowUpdate =
        (action: Action) =>
        <R extends object>(newRow: R) => {
            sendPayload({
                action,
                payload: [newRow],
            });

            return newRow;
        };

    const customerValidate = React.useCallback((): boolean => {
        // Customer name cannot be empty or only whitespace
        // customer email must be a valid email format
        // set error states if validation fails and return false
        // return true if validation passes

        let valid = true;

        if (customerName.trim() === "") {
            setCustomerNameError(true);
            valid = false;
        }

        if (!customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setCustomerEmailError(true);
            valid = false;
        }

        return valid;
    }, [customerEmail, customerName]);

    const itemValidate = React.useCallback((): boolean => {
        // Item name cannot be empty or only whitespace
        // Item quantity must be a positive integer
        // Item price must be a positive number

        let valid = true;

        if (itemName.trim() === "") {
            setItemNameError(true);
            valid = false;
        }

        if (itemQuantity <= 0) {
            setItemQuantityError(true);
            valid = false;
        }

        if (itemPrice <= 0) {
            setItemPriceError(true);
            valid = false;
        }

        return valid;
    }, [itemName, itemPrice, itemQuantity]);

    const createCustomer = React.useCallback(() => {
        if (!customerValidate()) {
            return;
        }

        // validation passed, clear error states
        setCustomerNameError(false);
        setCustomerEmailError(false);

        const newCustomer: ICustomer = {
            id: uuidv4(),
            name: customerName,
            email: customerEmail,
        };

        sendPayload({
            action: Action.CUSTOMER_CREATE,
            payload: [newCustomer],
        });

        setCustomerName("");
        setCustomerEmail("");
    }, [customerEmail, customerName, customerValidate, sendPayload]);

    const createItem = React.useCallback(() => {
        if (!itemValidate()) {
            return;
        }

        // validation passed, clear error states
        setItemNameError(false);
        setItemQuantityError(false);
        setItemPriceError(false);

        const newItem: IItem = {
            id: uuidv4(),
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice,
        };

        sendPayload({
            action: Action.ITEM_CREATE,
            payload: [newItem],
        });

        setItemName("");
        setItemQuantity(0);
        setItemPrice(0);
    }, [itemName, itemPrice, itemQuantity, itemValidate, sendPayload]);

    return (
        <>
            <Container>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        BoreDM Full Stack Developer Final Challenge
                    </Typography>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Customers
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ my: 1 }}>
                        <TextField
                            id="customer-name"
                            label="Customer Name"
                            variant="outlined"
                            size="small"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            error={customerNameError}
                            helperText={
                                customerNameError
                                    ? "Required. Must not be empty."
                                    : ""
                            }
                        />
                        <TextField
                            id="customer-email"
                            label="Customer Email"
                            variant="outlined"
                            size="small"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            error={customerEmailError}
                            helperText={
                                customerEmailError
                                    ? "Required. Must be a valid email."
                                    : ""
                            }
                        />
                        <Button
                            color="primary"
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={createCustomer}
                        >
                            Add customer
                        </Button>
                    </Stack>
                    <Box sx={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={customers}
                            columns={customerColumns}
                            getRowId={(row) => row.id}
                            editMode="row"
                            initialState={dataGridInitialState}
                            processRowUpdate={processRowUpdate(
                                Action.CUSTOMER_UPDATE
                            )}
                            onProcessRowUpdateError={(error) => {
                                console.error("error", error);
                            }}
                            onRowEditStop={handleRowEditStop}
                            pageSizeOptions={[5]}
                        />
                    </Box>
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                    Items
                </Typography>
                <Stack direction="row" spacing={2} sx={{ my: 1 }}>
                    <TextField
                        id="item-name"
                        label="Item Name"
                        variant="outlined"
                        size="small"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        error={itemNameError}
                        helperText={
                            itemNameError ? "Required. Must not be empty." : ""
                        }
                    />
                    <TextField
                        id="item-quantity"
                        label="Item Quantity"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={itemQuantity}
                        onChange={(e) =>
                            setItemQuantity(Math.floor(+e.target.value))
                        }
                        error={itemQuantityError}
                        helperText={
                            itemQuantityError
                                ? "Required. Must be a positive integer."
                                : ""
                        }
                    />
                    <TextField
                        id="item-price"
                        label="Item Price"
                        variant="outlined"
                        size="small"
                        type="number"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(+e.target.value)}
                        error={itemPriceError}
                        helperText={
                            itemPriceError
                                ? "Required. Must be a positive number."
                                : ""
                        }
                    />
                    <Button
                        color="primary"
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        onClick={createItem}
                    >
                        Add item
                    </Button>
                </Stack>
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={items}
                        columns={itemColumns}
                        getRowId={(row) => row.id}
                        editMode="row"
                        initialState={dataGridInitialState}
                        processRowUpdate={processRowUpdate(Action.ITEM_UPDATE)}
                        onProcessRowUpdateError={(error) => {
                            console.error("error", error);
                        }}
                        pageSizeOptions={[5]}
                    />
                </Box>
            </Container>
        </>
    );
}
