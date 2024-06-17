import { Container } from "@mui/material";
import style from "./page.module.css";

import Features from "./features";
import { Warning } from "@mui/icons-material";

export default function Home({ }) {
  return (
    <>
      <section
        style={{
          width: "100%",
          height: "50vh",
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
          height: "100vh",
          justifyContent: "center",
        }}
        id="features"
      >
        <Features />
      </section>

      <section
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        id="about"
      >
        <Container className={style.secondaryContainer}>
          <h1 className={style.textTwitch}>About</h1>
          <div style={{
            color: "var(--mui-palette-text-primary)",
          }}>
            Clipmaner is a comprehensive website designed to help Twitch streamers manage their clips effortlessly.<br />
            With Clipmaner, users can organize, edit, and share their Twitch clips in just a few clicks.<br />
            The platform offers powerful tools for categorizing clips, trimming and combining footage, and adding custom thumbnails and annotations.<br />
            Additionally, Clipmaner provides advanced search features and analytics to track the performance of clips, making it easier for streamers to highlight their best moments and engage their audience.<br />
            Whether you&apos;re a seasoned streamer or just starting, Clipmaner streamlines the clip management process, allowing you to focus on creating great content.
            <br />
            <br />
            Oh by the way, this was ChatGPT, nothing is real... You can just download clips and (soon™) delete them.
          </div>
        </Container>

        <Container
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            textAlign: "left",
            flexDirection: "row",
            width: "100%",
            height: "fit-content",
            backgroundColor: "var(--mui-palette-warning-main)",
            border: ".3rem solid var(--mui-palette-warning-light)",
            padding: ".4rem",
            margin: "2rem 0",
            borderRadius: "1rem",
          }}
        >
          <Warning
            style={{
              fontSize: "2rem",
              color: "var(--mui-palette-warning-contrastText)",
            }}
          />
          <div style={{
            color: "var(--mui-palette-warning-contrastText)",
            marginLeft: ".6rem",
          }}>
            This website is still in beta, so expect bugs.
          </div>
        </Container>
        <Container
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            textAlign: "left",
            flexDirection: "row",
            width: "100%",
            height: "fit-content",
            backgroundColor: "var(--mui-palette-warning-main)",
            border: ".3rem solid var(--mui-palette-warning-light)",
            padding: ".4rem",
            borderRadius: "1rem",
          }}
        >
          <Warning
            style={{
              fontSize: "2rem",
              color: "var(--mui-palette-warning-contrastText)",
            }}
          />
          <div style={{
            color: "var(--mui-palette-warning-contrastText)",
            marginLeft: ".6rem",
          }}>
            This website is optimized for desktop 1920x1080 resolution.
          </div>
        </Container>
      </section>
    </>
  );
}