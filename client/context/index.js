import { useReducer, createContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// Initial state of the authentication context.
// This state will hold the user information, initially set to null.
const initialState = {
  user: null,
};

// Create an authentication context using React's createContext.
// This context will be used to provide and consume the authentication state throughout the app.
const AuthContext = createContext();

// Reducer function to manage the authentication state.
// It listens to dispatched actions and updates the state accordingly.
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      // When the "LOGIN" action is dispatched, update the state with the user information.
      return { ...state, user: action.payload };
    case "LOGOUT":
      // When the "LOGOUT" action is dispatched, remove the user information from the state.
      return { ...state, user: null };
    default:
      // If the action type is not recognized, return the current state unchanged.
      return state;
  }
};

// AuthProvider component to wrap around any part of the app that needs access to the auth context.
// This component will provide the state and dispatch function to all its children components.
const AuthProvider = ({ children }) => {
  // Initialize the state and dispatch function using useReducer with the authReducer and initialState.
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Next.js router hook for navigation
  const router = useRouter();

  // useEffect hook to run a side effect when the AuthProvider component is mounted.
  // The effect retrieves the user information from localStorage (if any) and dispatches a "LOGIN" action to update the state.
  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []); // The empty dependency array ensures this effect runs only once, when the component is mounted.

  // Setting up an axios interceptor to handle 401 errors globally.
  // If a 401 error occurs, it triggers a logout process.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Any status code that lies within the range of 2xx causes this function to trigger
        return response;
      },
      (error) => {
        // Any status code that falls outside the range of 2xx causes this function to trigger
        const res = error.response;
        if (res && res.status === 401 && !res.config.__isRetryRequest) {
          // Perform a logout if a 401 error is encountered
          return new Promise((resolve, reject) => {
            axios
              .get("http://localhost:8000/api/logout")
              .then(() => {
                console.log("/401 error > logout");
                dispatch({ type: "LOGOUT" });
                window.localStorage.removeItem("user");
                router.push("/login");
              })
              .catch((err) => {
                console.error("AXIOS INTERCEPTOR ERR", err);
                reject(error);
              });
          });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor when the component is unmounted
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch, router]);

  // Create a context value object that contains the current state and the dispatch function.
  const contextValue = { state, dispatch };

  // useEffect to fetch the CSRF token when the AuthProvider component mounts.
  // This ensures that every subsequent request will include the CSRF token in the headers.
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        // Fetch the CSRF token from the server.
        const { data } = await axios.get("http://localhost:8000/api/csrf-token");
        console.log("CSRF", data);

        // Correct the setting of the Axios default headers.
        axios.defaults.headers["X-CSRF-Token"] = data.csrfToken;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    getCsrfToken(); // Execute the function to get the CSRF token.
  }, []); // Empty dependency array to ensure this runs only once when the component mounts.

  
  return (
    // Provide the context value (state and dispatch) to all children components.
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Export the AuthContext for use in other components that need to consume the auth state.
export { AuthContext, AuthProvider };
