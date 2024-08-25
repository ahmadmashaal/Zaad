import { useReducer, createContext, useEffect } from "react";

// Initial state of the authentication context.
// This state will hold the user information, which is initially set to null.
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
// This component will provide the state and dispatch function to all its children.
const AuthProvider = ({ children }) => {
  // Initialize the state and dispatch function using useReducer with the authReducer and initialState.
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect hook to run a side effect when the AuthProvider component is mounted.
  // The effect retrieves the user information from localStorage (if any) and dispatches a "LOGIN" action to update the state.
  useEffect(() => {
    // Attempt to retrieve the user from localStorage, parse it, and dispatch the "LOGIN" action.
    dispatch({
      type: "LOGIN",
      payload: JSON.parse(window.localStorage.getItem("user")),
    });
  }, []); // The empty dependency array ensures this effect runs only once, when the component is mounted.

  // Create a context value object that contains the current state and the dispatch function.
  const contextValue = { state, dispatch };

  return (
    // Provide the context value (state and dispatch) to all children components.
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the AuthContext for use in other components that need to consume the auth state.
export { AuthContext, AuthProvider };
