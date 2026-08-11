import React from "react";
import Navbar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";
import WhatsAppFloat from "../components/whatsapp/WhatsappButton";

export default function BasicLayout() {
  return (
    <div className="cx-site" style={{
      margin: 0,
      padding: 0,
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <Navbar />
      
      {/* Main SIN NADA de padding */}
      <main style={{ 
        margin: 0,
        padding: 0,
        width: '100%', 
        minHeight: '80vh'
      }}>
        <Outlet />
      </main>
      
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}