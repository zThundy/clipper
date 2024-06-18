import { Divider, Grid, Modal, Button } from "@mui/material";

import Image from "next/image";
import modal from "./modal.content.module.css";
import { BookSharp, CalendarToday, Person, Timeline, VideoCameraFront, ViewStream } from "@mui/icons-material";

const clipSizes = {
  width: 320,
  height: 180
}

export default function ModalContent({ clip, setModalData }) {
  const formatDate = (date) => {
    let _date = new Date(date);
    // format as "dd-mm-yyyy hh:mm:ss"
    return `${_date.getDate()}-${_date.getMonth() + 1}-${_date.getFullYear()} ${_date.getHours()}:${_date.getMinutes()}:${_date.getSeconds()}`;
  }

  return (
    <Modal
      open={clip !== null}
      onClose={() => setModalData(null)}
      className={modal.modalContainer}
    >
      <div className={modal.modalStuffBg}>
        <Grid container className={modal.modalStuff} justifyContent="space-between">
          <Grid item xs={12} style={{
            display: "flex",
            flexDirection: "column",
            padding: "0 0 1rem 0"
          }}>
            <h2
              style={{
                margin: "0 0 1rem 1rem",
              }}
            >{clip?.title}</h2>
            <Divider
              style={{
                backgroundColor: "var(--mui-palette-background-paper)"
              }}
            />
          </Grid>
          <Grid item xs={12} className={modal.elementContainer}
            style={{
              padding: "3rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Image
              width={clipSizes.width}
              height={clipSizes.height}
              src={clip?.thumbnail_url.replace("%{width}", clipSizes.width).replace("%{height}", clipSizes.height)} alt={clip?.title}
            />
          </Grid>
          <Grid item xs={4} className={modal.elementContainer}>
            <p><Person /> Created By</p>
            <span>{clip?.creator_name}</span>
          </Grid>
          <Grid item xs={3} className={modal.elementContainer}>
            <p><Timeline /> Duration</p>
            <span>{Math.floor(Number(clip?.duration))} seconds</span>
          </Grid>
          <Grid item xs={4} className={modal.elementContainer}>
            <p><CalendarToday /> Created at</p>
            <span>{formatDate(clip?.created_at)}</span>
          </Grid>
          <Grid item xs={5.6} className={modal.elementContainer}>
            <p><ViewStream /> Views</p>
            <span>{Math.floor(Number(clip?.view_count))}</span>
          </Grid>
          <Grid item xs={5.6} className={modal.elementContainer}>
            <p><BookSharp /> Language</p>
            <span>{clip?.language}</span>
          </Grid>
          <Grid item className={modal.elementContainer}>
            <Button
              variant="contained"
              color="primary"
              href={clip?.url}
              target="_blank"
              rel="noreferrer"
              startIcon={<VideoCameraFront />}
              style={{
                width: "100%",
                height: "3rem",
              }}
            >
              Watch this clip on Twitch
            </Button>
          </Grid>
        </Grid>
      </div>
    </Modal>
  )
}