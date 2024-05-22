import { Container } from "@mui/material";

import style from "./page.module.css";

export default function Home() {
  return (
    <section style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
    }}>
      <Container className={style.container}>
        <div className={style.textWhite}>The <span className={style.textHighlight}>easyest</span> way to manage your</div>
        <h1 className={style.textTwitch}>Twitch Clips</h1>
      </Container>
    </section>
  );
}
