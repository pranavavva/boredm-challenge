import { GridColDef } from "@mui/x-data-grid";

export const customer_rows = [
    { id: 1, name: "John Doe", email: "john.doe@example.com" },
    { id: 2, name: "Jane Doe", email: "jane.doe@example.com" },
    { id: 3, name: "Bob Smith", email: "bob.smith@example.com" },
];

export const customer_columns: GridColDef<(typeof customer_rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
];

export const inventory_rows = [
    { id: 1, name: "Apple", quantity: 23, price: 0.50 },
    { id: 2, name: "Pencils", quantity: 54, price: 0.99 },
    { id: 3, name: "Water Bottle", quantity: 12, price: 1.99 },
];

export const inventory_columns: GridColDef<(typeof inventory_rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "quantity", headerName: "Quantity", width: 150 },
    { field: "price", headerName: "Price", width: 150 },
];