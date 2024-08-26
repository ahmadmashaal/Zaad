import { useState, useEffect, useContext } from "react";
import { Menu } from "antd";
import Link from "next/link";
import {
  AppstoreOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../context";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const { Item } = Menu;

const TopNav = () => {
  const [current, setCurrent] = useState("");

  const { state, dispatch } = useContext(AuthContext);
  const { user } = state;

  // Debugging user data
  // console.log("Current user:", user);

  const router = useRouter();

  useEffect(() => {
    process.browser && setCurrent(window.location.pathname);
  }, [process.browser && window.location.pathname]);

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    window.localStorage.removeItem("user");
    const { data } = await axios.get("http://localhost:8000/api/logout");
    toast(data.message);
    router.push("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <AppstoreOutlined />,
      label: <Link href="/">App</Link>,
      onClick: () => setCurrent("/"),
    },
  ];
  // Conditionally render Login and Register if user is not logged in
  if (!user) {
    menuItems.push(
      {
        key: "/login",
        icon: <LoginOutlined />,
        label: <Link href="/login">Login</Link>,
        onClick: () => setCurrent("/login"),
      },
      {
        key: "/register",
        icon: <UserAddOutlined />,
        label: <Link href="/register">Register</Link>,
        onClick: () => setCurrent("/register"),
      }
    );
  } else {
    // If user is logged in, show the user menu with a Logout option in a submenu
    menuItems.push(
      {
        key: "user",
        icon: <UserOutlined />,
        label: user.user.name || user.user.email, // Display user's name or email
        children: [
          {
            key: "/logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            onClick: logout,
          },
        ],
        style: { marginLeft: "auto" }, // Pushes the submenu to the right
      }
    );
  }

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[current]}
      items={menuItems} // Use `items` prop instead of children
    />
  );
};

export default TopNav;
