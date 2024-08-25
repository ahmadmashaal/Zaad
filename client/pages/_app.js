//import TopNav from '../components/TopNav';

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import "../public/css/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../context";

import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";

const TopNav = dynamic(() => import("../components/TopNav"), { ssr: false });

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastContainer position="top-center"/>
      <TopNav />
      <Component {...pageProps} />
    </ AuthProvider>
  );
}

export default MyApp;
