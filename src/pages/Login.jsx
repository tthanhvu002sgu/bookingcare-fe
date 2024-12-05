import axios from "../api/axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const loginUrl = "api/auth/login";
const signupUrl = "api/auth/register";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [state, setState] = useState("Signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  let redirectPath = "";

  const onSubmitHandle = async (e) => {
    e.preventDefault();

    try {
      const url = state === "Signup" ? signupUrl : loginUrl;
      const userCredentials = {
        email,
        password,
        ...(state === "Signup" && { name }),
      };

      const response = await axios.post(url, JSON.stringify(userCredentials), {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const accessToken = response?.data?.accessToken;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);

        const decodedToken = atob(accessToken.split(".")[1]);
        const decodedPayload = JSON.parse(decodedToken);
        const role = decodedPayload.role;

        setAuth({ email, role, accessToken });

        if (role.authority === "PATIENT") {
          redirectPath = "/";
        } else if (role.authority === "DOCTOR") {
          redirectPath = "/about";
        } else if (role.authority === "ADMIN") {
          redirectPath = "/contact";
        }

        navigate(redirectPath);
      } else {
        console.error("Unexpected response without access token");
      }
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Error during login/signup:", error);
      alert(errorData?.message ?? "An error occurred. Please try again later.");
    }
  };
  const handleGoogleLoginSuccess = async (response) => {
    console.log("Google login response:", response); // Kiểm tra dữ liệu trả về từ Google
    
    if (!response?.credential) {
      throw new Error("No credential received from Google");
    }
  
    const googleToken = response.credential; // Google ID Token
  
    try {
      // Gửi token lên backend
      const res = await axios.post("api/auth/google-login", 
        { token: googleToken }, // Đảm bảo gửi đúng cấu trúc dữ liệu { token: googleToken }
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
  
      // Kiểm tra phản hồi từ backend
      console.log("Backend response:", res);
  
      const accessToken = res?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        const decodedToken = atob(accessToken.split(".")[1]);
        const decodedPayload = JSON.parse(decodedToken);
        const role = decodedPayload.role;
  
        // Cập nhật thông tin auth
        setAuth({ email: decodedPayload.email, role, accessToken });
  
        navigate("/");
      } else {
        console.error("Server did not return access token.");
        alert("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google Login failed:", error);
      alert("Google login failed. Please try again.");
    }
  };
  
  
  
  

  return (
    <GoogleOAuthProvider clientId="828447381869-13uvm7s5nrvrat30ktrifr7ghkgo2tgv.apps.googleusercontent.com">
     <form
        className="min-h-[80vh] flex items-center"
        onSubmit={onSubmitHandle}
      >
        <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
          <p className="text-2xl font-semibold">
            {state === "Signup" ? "Create account" : "Login"}
          </p>
          <p>
            Please {state === "Signup" ? "Create account" : "Login"} to book
            appointment
          </p>
          {state === "Signup" && (
            <div className="w-full">
              <p>Full Name:</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
          )}

          <div className="w-full">
            <p>Email:</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="w-full">
            <p>Password:</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <button className="bg-primary text-white w-full p-2 rounded-md text-base">
            {state === "Signup" ? "Create account" : "Login"}
          </button>
          {/* Nút Google Login chỉ hiển thị khi ở form Login */}
          {state === "Login" && (
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                console.error("Google Login Failed");
              }}
              useOneTap
            />
          )}
          {state === "Signup" ? (
            <p>
              Already have account?{" "}
              <span
                onClick={() => {
                  setState("Login");
                }}
                className="text-primary underline cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create a new account?{" "}
              <span
                onClick={() => {
                  setState("Signup");
                }}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>

    </GoogleOAuthProvider>
  );
};

export default Login;