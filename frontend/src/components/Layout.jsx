import React from "react";
import Header from "src/components/Header.jsx";
import Footer from "src/components/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return <div>
        <Header></Header>
        <Outlet></Outlet>
        <Footer></Footer>
    </div>
}