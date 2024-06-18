import { useState, useEffect } from "react";
import Image from "next/image";

import style from "./page.module.css";
import modal from "./modal.content.module.css";

import { Checkbox, Grid } from "@mui/material";
import { Info } from "@mui/icons-material";

const clipsDimenstions = {
  width: 400,
  height: 240
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
    <Grid xs={4} item className={style.clipContainer} data-checked={checked} data-link={clip.url} data-title={clip.title}>
      <div className={style.clip}>
        <div className={style.clipImage}>
          <Checkbox
            color="primary"
            className={style.clipCheckbox}
            checked={checked}
            data-checked={checked}
            onClick={_click}
          />

          <Image
            src={_clip.thumbnail_url.replace("%{width}", clipsDimenstions.width).replace("%{height}", clipsDimenstions.height)}
            alt={_clip.title}
            className={checked ? style.clipImageChecked : null}
            width={clipsDimenstions.width}
            height={clipsDimenstions.height}
            draggable={false}
            onClick={_click}
          />

          <div
            className={modal.clipInfoButton}
            onClick={() => {
              // open mui modal with the clip info
              openModal(_clip);
            }}
          >
            <Info />
          </div>

          <div className={style.clipTitle}>
            {_clip.title}
          </div>
        </div>
      </div>
    </Grid>
  );
}

export default Clip;