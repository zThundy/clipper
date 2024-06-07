import { Container } from '@mui/material';

import style from './not-found.module.css';

export default function NotFound() {
  return (
    <Container className={style.secondaryContainer}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <h1 className={style.textTwitch}>Sorry </h1>
        <h2 style={{
          fontSize: "3.5rem",
          margin: "0",
        }}>😢</h2>
        </div>
      <div style={{
        color: "var(--mui-palette-text-primary)",
      }}>
        We couldn&apos;t find the page you were looking for.
      </div>
    </Container>
  );
}