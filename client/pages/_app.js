//import TopNav from '../components/TopNav';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import "../public/css/styles.css";

import dynamic from 'next/dynamic';

const TopNav = dynamic(() => import('../components/TopNav'), { ssr: false });

function MyApp ({Component, pageProps}) {
    return (
    <>
        <TopNav />
        <Component {...pageProps} />
    </>
    );
};

export default MyApp;