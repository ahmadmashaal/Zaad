import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { SyncOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { AuthContext } from "../context";
import Link from "next/link";
import { useRouter } from "next/router";

const getCsrfToken = () => {
  // If using cookies
  return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN'))?.split('=')[1];

};

/**
 * ForgotPassword component handles the password reset functionality
 * It provides two forms: one for requesting a password reset and another for setting a new password
 */
const ForgotPassword = () => {
  // State variables for form inputs and UI control
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  
  // Access the global authentication context
  const { state } = useContext(AuthContext);
  
  // Destructure user from state
  const { user } = state;
  
  // Next.js router for navigation
  const router = useRouter();

  // Effect hook to redirect logged-in users to home page
  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  /**
   * Handles the submission of the forgot password form
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Get the CSRF token from a cookie or meta tag
      const csrfToken = getCsrfToken(); // You'll need to implement this function
      const { data } = await axios.post("http://localhost:8000/api/forgot-password", 
        { email },
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        setSuccess(true);
        toast.success("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      console.error("Forgot password error:", err.response?.data);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the submission of the password reset form
   * @param {Event} e - The form submission event
   */
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:8000/api/reset-password", { newPassword, code });
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Password reset successfully");
        router.push("/login");
      }
    } catch (err) {
      console.error("Reset password error:", err.response?.data);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="jumbotron bg-primary square">Forgot Password</h1>
      {success ? (
        // Display the password reset form after successful email submission
        <div className="container col-md-4 offset-md-4 pb-5">
          <form onSubmit={handleReset}>
            <input
              type="password"
              className="form-control mb-4 p-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <input
              type="text"
              className="form-control mb-4 p-4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              required
            />
            <button
              type="submit"
              className="btn btn-block btn-primary"
              disabled={loading}
            >
              {loading ? <SyncOutlined spin /> : "Reset Password"}
            </button>
          </form>
        </div>
      ) : (
        // Display the initial forgot password form
        <div className="container col-md-4 offset-md-4 pb-5">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="form-control mb-4 p-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <SyncOutlined spin /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ForgotPassword;
