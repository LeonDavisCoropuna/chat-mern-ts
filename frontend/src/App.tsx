import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import { useAuthContext } from "./context/AuthContext";
function App() {
  const { authUser } = useAuthContext();

  const handleCpuLoad = async () => {
    console.log('🔥 Iniciando carga de CPU en frontend...');
    const startTime = Date.now();

    // Carga intensiva en el navegador
    let result = 0;
    for (let i = 0; i < 5000000; i++) {
      result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`✅ Carga completadaaaaaaa en ${executionTime}ms. Resultado: ${result.toString().slice(0, 10)}`);
  };


  return (
    <div className="p-4 h-screen flex items-center justify-center ">
      <button
        onClick={handleCpuLoad}
      >
        CPU Load Test
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