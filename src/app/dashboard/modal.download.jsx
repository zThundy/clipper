import { Modal, LinearProgress } from "@mui/material";

import classes from "./modal.download.module.css";
import { useEffect, useState } from "react";

function ModalDownload({ clips, open, setClipsDownload, selectedClips }) {

  const downloadClips = () => {
    let selectedClips = clips.filter(_ => _.checked);
    if (selectedClips.length === 0) {
      setNotifType("error");
      handleOpen("No clips selected for download.");
      return;
    }

    fetch(`/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(selectedClips)
    })
      .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then(data => {
        console.log(data);
        setNotifType("success");
        handleOpen(`Downloading ${selectedClips.length} clips...`);
        // deselect all clips
        clips.forEach(_ => _.checked = false);
        setClips(clips);
        setSelectAll(false);
      })
      .catch(err => {
        setNotifType("error");
        handleOpen(`Error: ${err.message}`);
      });
  }

  return (
    <Modal
      open={open}
      onClose={() => setClipsDownload(false)}
      className={classes.modal}
    >
      <>
        <div>
          <h2>Downloading {selectedClips.length} clips</h2>
        </div>
        <LinearProgress color="primary" sx={{ zIndex: 5, width: "90%" }} />
      </>
    </Modal>
  )
}

export default ModalDownload;