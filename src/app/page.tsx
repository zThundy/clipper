import { Container } from "@mui/material";

import style from "./page.module.css";

export default function Home() {
  return (
    <>
      <section
        style={{
          width: "100%",
          height: "60vh",
          display: "flex",
          justifyContent: "center",
        }}
        id="home"
      >
        <Container className={style.container}>
          <div className={style.textWhite}>The <span className={style.textHighlight}>easyest</span> way to manage your</div>
          <h1 className={style.textTwitch}>Twitch Clips</h1>
        </Container>
      </section>

      <section
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
        id="about"
      >
        <Container className={style.secondaryContainer}>
          <h1 className={style.textTwitch}>About</h1>
          <div style={{
            color: "var(--mui-palette-text-primary)",
          }}>
            Clipper is a comprehensive website designed to help Twitch streamers manage their clips effortlessly.<br />
            With Clipper, users can organize, edit, and share their Twitch clips in just a few clicks.<br />
            The platform offers powerful tools for categorizing clips, trimming and combining footage, and adding custom thumbnails and annotations.<br />
            Additionally, Clipper provides advanced search features and analytics to track the performance of clips, making it easier for streamers to highlight their best moments and engage their audience.<br />
            Whether you're a seasoned streamer or just starting, Clipper streamlines the clip management process, allowing you to focus on creating great content.
          </div>
        </Container>
      </section>
    </>
  );
}