import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme.ts";
import { SocketProvider } from "./utils/SocketProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <SocketProvider>
                <CssBaseline />
                <App />
            </SocketProvider>
        </ThemeProvider>
    </React.StrictMode>
);
