
import style from "./layout.module.css";

export const metadata = {
  title: "Clipper - Dashboard",
  description: "The best way to manage your twitch clips",
};

export default async function DashboardLayout({ children }) {

  return (
    <div className={style.container}>
      {children}
    </div>
  );
}