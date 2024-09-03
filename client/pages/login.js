import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { SyncOutlined } from "@ant-design/icons";
import Link from "next/link";
import { AuthContext } from "../context"; // Import the authentication context
import { useRouter } from "next/router"; // Import Next.js router for navigation

// Login component handles user login functionality
const Login = () => {
  // Local state to manage form input values and loading status
  const [email, setEmail] = useState("ahmad@zaad.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [loading, setLoading] = useState(false);

  // Accessing global authentication state and dispatch function from AuthContext
  const { state, dispatch } = useContext(AuthContext);

  // Destructure user from state
  const { user } = state;

  // Next.js router for navigation
  const router = useRouter();

  // Redirect Logged in user to home page if they try to access login page
  useEffect(() => {
    if (user !== null) {
      router.push("/");
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      setLoading(true); // Set loading state to true while request is in progress
      const { data } = await axios.post(
        `http://localhost:8000/api/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Dispatch the "LOGIN" action to update the global authentication state
      dispatch({
        type: "LOGIN",
        payload: data,
      });

      // Save the user data in local storage to persist the session
      window.localStorage.setItem("user", JSON.stringify(data));

      // Redirect the user to the home page after successful login
      router.push("/");

      // No need to set loading to false here because the component will unmount
    } catch (err) {
      // Error handling for failed login attempt
      if (err.response) {
        // Server responded with a status other than 200 range
        toast.error(err.response.data); // Show error message from server
      } else if (err.request) {
        // Request was made but no response was received
        console.error("No response from server. Please try again later.");
      } else {
        // Something else happened while setting up the request
        console.error("An unexpected error occurred. Please try again.");
      }
      setLoading(false); // Set loading state to false after error handling
    }
  };

  return (
    <>
      <h1 className="jumbotron bg-primary square">Login</h1>

      <div className="container col-md-4 offset-md-4 pb-5 text-center">
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-4 p-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />

          <input
            type="password"
            className="form-control mb-4 p-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
          />

          <button
            type="submit"
            className="btn btn-block btn-primary"
            disabled={!email || !password || loading}
          >
            {loading ? <SyncOutlined spin /> : "Submit"}
          </button>
        </form>

        <p className="text-center p-3">
          Not yet registered? <Link href="/register">Register</Link>
        </p>

        <p className="text-center pt-1">
          <Link href="/forgot-password">Forgot Password</Link>
        </p>
      </div>
    </>
  );
};

export default Login;
