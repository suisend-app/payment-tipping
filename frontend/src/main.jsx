import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import './styles.css';

import { WalletProvider } from "@mysten/wallet-kit";

const root = createRoot(document.getElementById('root'));

root.render(
  <WalletProvider>
    <App />
  </WalletProvider>
);
