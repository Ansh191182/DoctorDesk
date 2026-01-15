import React from "react";
import AuthForm from "./components/SignUp";
import PatientDashboard from "./components/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctForm from "./components/DoctForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/landing" element={<PatientDashboard />} />
          <Route path="/doctInfo" element={<DoctForm />} />
        </Routes>{" "}
      </BrowserRouter>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
};

export default App;
