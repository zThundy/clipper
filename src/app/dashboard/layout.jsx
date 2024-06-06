
import style from "./layout.module.css";
import React from "react";

export const metadata = {
  title: "Clipper - Dashboard",
  description: "The best way to manage your twitch clips",
};

export default function DashboardLayout({ children }) {

  return (
    <div className={style.container}>
      {children}
    </div>
  );
}