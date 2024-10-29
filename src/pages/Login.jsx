import axios from "../api/axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";

const loginUrl = "api/auth/login";
const signupUrl = "api/auth/register";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  console.log(AuthContext)

  const [state, setState] = useState("Signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  let redirectPath = ""

  const onSubmitHandle = async (e) => {
    e.preventDefault();

    try {
      const url = state === "Signup" ? signupUrl : loginUrl; // Use appropriate URL
      const userCredentials = {
        email,
        password,
        ...(state === "Signup" && { name }), // Include name only for signup
      };

      const response = await axios.post(url, JSON.stringify(userCredentials), {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Include for handling cookies/sessions
      });

      const accessToken = response?.data?.accessToken;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);

        const decodedToken = atob(accessToken.split('.')[1]);
        const decodedPayload = JSON.parse(decodedToken);
        const role = decodedPayload.role;

        setAuth({ email, role, accessToken });

        if(role.authority === 'PATIENT') {
          redirectPath = '/';
        } else if (role.authority === 'DOCTOR'){
          redirectPath = '/about';
        } else if (role.authority === 'ADMIN'){
          redirectPath = '/contact';
        }
        
        navigate(redirectPath);

      } else {
        console.error("Unexpected response without access token");
        // Handle unexpected response here (e.g., display error message)
      }
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Error during login/signup:", error);
      alert(
        errorData?.message ?? "An error occurred. Please try again later."
      );
    }
  };

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandle}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state == "Signup" ? "Create account" : "Login"}
        </p>
        <p>
          Please {state == "Signup" ? "Create account" : "Login"} to book
          appointment{" "}
        </p>
        {state == "Signup" && (
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
          {state == "Signup" ? "Create account" : "Login"}
        </button>
        {state == "Signup" ? (
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
  );
};

export default Login;

