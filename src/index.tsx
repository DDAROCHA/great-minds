import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Minds from "./components/Minds";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Minds />
  </React.StrictMode>
);

// Si querés medir rendimiento (opcional)
reportWebVitals();
