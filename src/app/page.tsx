import { Container, Grid } from "@mui/material";
import style from "./page.module.css";

import Features from "./features";
import { Warning } from "@mui/icons-material";

export default function Home({ }) {
  return (
    <Grid container>
      <Grid
        item
        xs={12}
        style={{
          width: "100%",
          height: "fit-content",
          display: "flex",
          justifyContent: "center",
        }}
        id="home"
      >
        <Container className={style.container}>
          <div className={style.textWhite}>The <span className={style.textHighlight}>easyest</span> way to manage your</div>
          <h1 className={style.textTwitch}>Twitch Clips</h1>
        </Container>
      </Grid>

      <Grid
        item
        xs={12}
        style={{
          width: "100%",
          display: "flex",
          height: "fit-content",
          justifyContent: "center",
        }}
        id="features"
      >
        <Features />
      </Grid>

      <Grid
        item
        xs={11}
        style={{
          // width: "calc(100vw - 5rem)",
          height: "calc(100vh + 10rem)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
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
            margin: "1rem 0",
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
            margin: "1rem 0",
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
      </Grid>
    </Grid>
  );
}