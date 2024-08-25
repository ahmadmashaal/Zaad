import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { SyncOutlined } from "@ant-design/icons";
import Link from "next/link";
import { AuthContext } from "../context";
import { useRouter } from "next/router";

const Register = () => {
  const [name, setName] = useState("Ahmad Mashal");
  const [email, setEmail] = useState("ahmad@zaad.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [loading, setLoading] = useState(false);

  const { state } = useContext(AuthContext);

    // Destructure user from state
    const { user } = state;

  const router = useRouter();

    // Redirect Logged in user to home page if they try to access register page
    useEffect(() => {
      if (user !== null) {
        router.push("/");
      }
    }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.table({name, email, password});
    try {
      setLoading(true);
      const { data } = await axios.post(`http://localhost:8000/api/register`, {
        name,
        email,
        password,
      });
      //console.log("REGISTER RESPONSE", data);
      toast.success("Registration successful!");
      setLoading(false);
    } catch (err) {
      toast.error(err.response.data);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="jumbotron bg-primary square">Register</h1>

      <div className="container col-md-4 offset-md-4 pb-5 text-center">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-4 p-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
            required
          />

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
            disabled={!name || !email || !password || loading}
          >
            {loading ? <SyncOutlined spin /> : "Submit"}
          </button>
        </form>

        <p className="text-center p-3">
          Already Registered?{" "}
          <Link href="/login">Login</Link>
        </p>
      </div>
    </>
  );
};

export default Register;
