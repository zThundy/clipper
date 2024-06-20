import { useState, useEffect } from "react";
import Image from "next/image";

import style from "./page.module.css";
import modal from "./modal.content.module.css";

import { Button, Grid } from "@mui/material";
import { Info, VideoCameraFront } from "@mui/icons-material";

const clipsDimenstions = {
  width: 480,
  height: 272
};

function Clip({ clip, openModal, _ }) {
  const [_clip, setClip] = useState(clip);
  const [checked, setChecked] = useState(clip.checked || false);

  useEffect(() => {
    setChecked(clip.checked);
    setClip(clip);
  }, [clip.checked, clip]);

  const _click = () => {
    _clip.checked = !_clip.checked;
    setChecked(_clip.checked);
    setClip(_clip);
    _();
  }

  return (
    <Grid container className={style.clip} justifyContent={"center"} alignContent={"center"} flexDirection={"column"}>
      <Grid
        item
        xs={12}
        justifyContent={"center"}
        alignContent={"center"}
      >
        <div
          style={{
            width: clipsDimenstions.width + "px",
            height: clipsDimenstions.height + "px"
          }}
          className={style.clipImageContainer}
        >
          <Image
            src={_clip.thumbnail_url.replace("%{width}", clipsDimenstions.width).replace("%{height}", clipsDimenstions.height)}
            alt={_clip.title}
            width={clipsDimenstions.width}
            height={clipsDimenstions.height}
            className={checked ? style.clipImageChecked : null}
            draggable={false}
            onClick={_click}
            style={{
              borderRadius: "1rem",
            }}
          />

          <div className={style.watchButton}>
            <Button
              className={style.button}
              variant="contained"
              color="primary"
              href={_clip.url}
              target="_blank"
              rel="noreferrer"
              startIcon={<VideoCameraFront />}
              onClick={() => {
                // open the clip in a new tab
              }}
            >
              Watch on Twitch
            </Button>
          </div>
        </div>
      </Grid>

      <Grid item xs={12}>
        <Grid
          container
          justifyContent={"center"}
          alignContent={"center"}
          style={{
            marginTop: ".5rem",
          }}
        >
          <Grid
            item
            xs={1.5}
            justifyContent={"center"}
            alignContent={"center"}
            textAlign={"center"}
          >
            <div
              className={modal.clipInfoButton}
              onClick={() => {
                // open mui modal with the clip info
                openModal(_clip);
              }}
            >
              <Info fontSize="large" />
            </div>
          </Grid>
          <Grid item xs={10.5}>
            <div className={style.clipTitle}>
              <span
                style={{
                  lineBreak: "auto",
                  maxWidth: "24rem",
                }}
              >Title: {_clip.title}</span>
              {/* <span className={style.clipCreator}>Creator: {_clip.creator_name}</span> */}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Clip;