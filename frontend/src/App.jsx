import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Chatbot from "./components/Chatbot/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import LoanTypes from "./pages/LoanTypes";
import LoanSchemes from "./pages/LoanSchemes/LoanSchemes";
import Eligibility from "./pages/Eligibility/Eligibility";
import CibilScore from "./pages/CibilScore/CibilScore";
import Documents from "./pages/Documents/Documents";
import LoanDetails from "./pages/LoanDetails/LoanDetails";
import ApplyLoan from "./pages/ApplyLoan/ApplyLoan";
import ApplicationStatus from "./pages/ApplicationStatus/ApplicationStatus";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Authentication / Entry */}
        <Route path="/" element={<Welcome />} />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================= HOME ================= */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navbar />
              <Home />
              <Chatbot />
            </ProtectedRoute>
          }
        />


        {/* ================= LOAN TYPES ================= */}

        <Route
          path="/loan-types"
          element={
            <ProtectedRoute>
              <Navbar />
              <LoanTypes />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loan-types/:loanId"
          element={
            <ProtectedRoute>
              <Navbar />
              <LoanDetails />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loan-schemes"
          element={
            <ProtectedRoute>
              <Navbar />
              <LoanSchemes />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/eligibility"
          element={
            <ProtectedRoute>
              <Navbar />
              <Eligibility />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cibil-score"
          element={
            <ProtectedRoute>
              <Navbar />
              <CibilScore />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Navbar />
              <Documents />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/application-status"
          element={
            <ProtectedRoute>
              <Navbar />
              <ApplicationStatus />
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply/:loanId"
          element={
            <ProtectedRoute>
              <Navbar />
              <ApplyLoan />
              <Chatbot />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;