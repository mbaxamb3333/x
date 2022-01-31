import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './index.css';
import './styles';
import './scripts';
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
// import "./styles/reset.css";
import { MoralisProvider } from "react-moralis";



ReactDOM.render(
  <MoralisProvider appId="xn3srSKuYjWT4MOvQG2xpu9UAbqNyjpQhS5QmsfK" serverUrl="https://mxs6nn8pxyky.usemoralis.com:2053/server">
  <Provider store={store}>
    <App />
  </Provider>,
  </MoralisProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
