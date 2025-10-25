import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import { useAuthContext } from "./context/AuthContext";
import axiosInstance from "./config/axios";
function App() {
  const { authUser } = useAuthContext();

  // Función simple para hacer load test
  const handleLoadTest = async () => {
    try {
      const response = await axiosInstance.get('/load-test');
      const data = await response.data;
      console.log('Load test response:', data);
    } catch (error) {
      console.error('Load test failed:', error);  
    }
  };

  return (
    <div className="p-4 h-screen flex items-center justify-center ">
      {/* Botón simple para load test */}
      <button 
        onClick={handleLoadTest}
      >
        Load Test
      </button>
      
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>
    </div>
  );
}

export default App;