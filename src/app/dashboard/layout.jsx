
import style from "./layout.module.css";
import React from "react";

export default function DashboardLayout({ children }) {

  return (
    <div className={style.container}>
      {children}
    </div>
  );
}