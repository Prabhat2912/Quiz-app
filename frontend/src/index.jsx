import React from "react";
import ReactDOM from "react-dom/client";
// Ant Design v5+ ships styles at runtime via CSS-in-JS — no dist CSS file
// to import (the old antd.min.css import breaks the build). Component
// styles inject after this sheet, so brand-critical overrides below use
// !important or higher specificity to hold.
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import { registerSW } from "virtual:pwa-register";

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
