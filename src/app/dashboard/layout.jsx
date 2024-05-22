import { Container, Checkbox, FormControlLabel } from "@mui/material";

import style from "./layout.module.css";

export default function DashboardLayout({ children }) {
  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.selectAllContainer}>
          <FormControlLabel
            control={<Checkbox color="secondary" />}
            label="Select all"
          />
        </div>

        
      </div>
      {children}
    </div>
  );
}