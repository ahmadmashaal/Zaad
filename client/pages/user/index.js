import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context";
import axios from "axios";

const UserIndex = () => {
  // State
  const [hidden, setHidden] = useState(true);

  const {
    state: { user },
  } = useContext(AuthContext);
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/current-user",
        {
          withCredentials: true,
        }
      );
      console.log("Fetched current user:", data); // Log the fetched user data
      setHidden(false);
    } catch (err) {
      console.log(err);
      setHidden(true);
    }
  };

  return (
    <>
      {!hidden && (
        <h1 className="jumbotron text-center square">
          <pre>{JSON.stringify(user, null, 4)}</pre>
        </h1>
      )}
    </>
  );
};

export default UserIndex;
