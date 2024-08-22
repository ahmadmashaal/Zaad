import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { SyncOutlined } from "@ant-design/icons";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("ahmad@zaad.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.table({name, email, password});
    try {
      setLoading(true);
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API}/login`, {
        email,
        password,
      });
      console.log("LOGIN RESPONSE", data);
    //   setLoading(false);
    } catch (err) {
        if (err.response) {
          // Server responded with a status other than 200 range
          console.error(err.response.data);
        } else if (err.request) {
          // Request was made but no response was received
          console.error("No response from server. Please try again later.");
        } else {
          // Something else happened while setting up the request
          console.error("An unexpected error occurred. Please try again.");
        }
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="jumbotron bg-primary square">Login</h1>

      <div className="container col-md-4 offset-md-4 pb-5 text-center">
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
          Not yet registered?{" "}
          <Link href="/register">Register</Link>
        </p>
      </div>
    </>
  );
};

export default Login;
