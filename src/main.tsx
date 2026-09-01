import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { I18nProvider } from "./i18n";
import { ApplicantProvider } from "./context/ApplicantContext";
import { ToastProvider } from "./components/ui/Toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <I18nProvider>
          <ApplicantProvider>
            <App />
          </ApplicantProvider>
        </I18nProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
