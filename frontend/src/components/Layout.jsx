import React from "react";
import Header from "src/components/Header.jsx";
import Footer from "src/components/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return <div className="flex flex-col min-h-screen bg-gray-300">
        <Header></Header>
        <div className="flex flex-col flex-grow border border-gray-100 bg-gray-50">
            <Outlet></Outlet>
        </div>
        <Footer></Footer>
    </div>
}