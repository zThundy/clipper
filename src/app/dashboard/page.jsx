"use client";

import { useMemo, useState, useEffect } from "react";
import style from "./page.module.css";
import { Button, ButtonGroup, Checkbox, FormControlLabel, styled } from "@mui/material";
import Image from "next/image";
import { ArrowBack, ArrowForward, Delete, Download } from "@mui/icons-material";

const StyledPageButton = styled(Button)(({ theme }) => ({
  color: theme.vars.palette.text.main,
  backgroundColor: theme.vars.palette.primary.main,
  fontWeight: "bold",
  fontSize: "1.2rem",
  borderRadius: "1rem",
  padding: ".5rem 1rem .5rem 1rem",
  transition: "border-radius .2s, color .2s",
  "&:hover": {
    backgroundColor: theme.vars.palette.primary.light,
  }

}));

let _clips = []
for (var i = 0; i < 1325; i++) {
  _clips.push({
    title: `Clip ${i + 1}`,
    image: `https://picsum.photos/420/280?random=${i + 1}`,
    url: `https://picsum.photos/420/280?random=${i + 1}`,
    checked: false
  });
}

function Clip({ clip, clipIndex, page }) {
  const [_clip, setClip] = useState(clip);
  const [checked, setChecked] = useState(clip.checked || false);

  useEffect(() => {
    setChecked(clip.checked);
  }, [clip.checked]);

  useEffect(() => {
    setClip(clip);
  }, [clip]);

  return (
    <div className={style.clipContainer} data-checked={checked} data-link={clip.url} data-title={clip.title}>
      <div className={style.clip}>
        <div
          className={style.clipImage}
          onClick={() => {
            _clip.checked = !_clip.checked;
            setChecked(_clip.checked);
            setClip(_clip);
          }}
        >
          <Checkbox
            color="primary"
            className={style.clipCheckbox}
            checked={checked}
            data-checked={checked}
          />

          <Image
            src={_clip.image}
            alt={_clip.title}
            className={checked ? style.clipImageChecked : null}
            width={420}
            height={280}
            draggable={false}
          />

          <div className={style.clipTitle}>
            {_clip.title}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ }) {
  const [selectAll, setSelectAll] = useState(false);
  const [clips, setClips] = useState(_clips);

  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <div className={style.header}>
        <div className={style.selectAllContainer}>
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                checked={selectAll}
              />
            }
            onChange={() => {
              _clips.forEach(_ => _.checked = !selectAll);
              setSelectAll(!selectAll);
            }}
            label="Select all"
          />
        </div>

        <div
          style={{
            margin: "0 1rem 0 0"
          }}
        >
          <Button
            className={style.downloadButton}
            startIcon={<Download />}
          >
            Download
          </Button>
          <div className={style.enableDeleteContainer}>
            
          </div>
          <Button
            className={style.deleteButton}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className={style.clipsContainer}>
        {/* show max 12 clips per page */}
        {clips.slice((currentPage - 1) * 12, currentPage * 12).map((clip, index) => (
          <Clip key={index} clip={clip} clipIndex={index} page={currentPage} />
        ))}
      </div>

      <div className={style.pageSelector}>
        <ButtonGroup>
          <StyledPageButton
            onClick={() => {
              if (currentPage === 1) return;
              setCurrentPage(currentPage - 1)
              window.scrollTo(0, 0);
            }}
          ><ArrowBack /></StyledPageButton>
          {useMemo(() => {
            let pages = [];
            const maxButtons = 5;
            // show only a maximum of 5 pages at a time
            for (let i = Math.max(1, currentPage - maxButtons); i <= Math.min(Math.ceil(clips.length / 12), currentPage + maxButtons); i++) {
              pages.push(
                <StyledPageButton
                  key={i}
                  onClick={() => {
                    setCurrentPage(i);
                    window.scrollTo(0, 0);
                  }}
                  sx={ currentPage === i ? { color: "var(--mui-palette-primary-dark)" } : {}}
                >
                  {i}
                </StyledPageButton>
              );
            }
            return pages;
          }, [clips, currentPage])}
          <StyledPageButton
            onClick={() => {
              if (currentPage === Math.ceil(clips.length / 12)) return;
              setCurrentPage(currentPage + 1)
              window.scrollTo(0, 0);
            }}
          ><ArrowForward /></StyledPageButton>
        </ButtonGroup>
      </div>
    </>
  );
}

export default Dashboard;