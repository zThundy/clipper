import { Modal, LinearProgress, List } from "@mui/material";

import { useEffect, useState } from "react";

import classes from "./modal.download.module.css";

function ModalDownload({ open, setClipsDownload, selectedClips }) {
  const [progresses, setProgresses] = useState({});

  useEffect(() => {
    if (!open) return;
    selectedClips.forEach((clip) => progresses[clip.id] = "Ready");
    setProgresses(progresses);
    // if (open) downloadClips();
  }, [open]);

  const downloadClips = () => {
    fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clips: selectedClips,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      })
  }

  return (
    <Modal
      open={open}
      onClose={() => setClipsDownload(false)}
      className={classes.modal}
    >

      <div className={classes.modalContent}>
        <List className={classes.list}>
          {selectedClips.map((clip) => (
            <div key={clip.id} className={classes.listItem}>
              <span className={classes.text}>{clip.title}</span>
              <span className={classes.status}>{progresses[clip.id]}</span>
              { progresses[clip.id] === "Downloading" ? <LinearProgress className={classes.progress} /> : <LinearProgress className={classes.progress} variant="determinate" value={0} /> }
            </div>
          ))}
        </List>
      </div>

    </Modal>
  )
}

export default ModalDownload;