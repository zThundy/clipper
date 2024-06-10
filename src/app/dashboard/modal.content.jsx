import { Divider, Modal } from "@mui/material";

import modal from "./page.modal.module.css";

export default function ModalContent({ clip, setModalData }) {
  console.log(clip)

  return (
    <Modal
      open={clip !== null}
      onClose={() => setModalData(null)}
      className={modal.modalContainer}
    >
      <div className={modal.modalStuffBg}>
        <div className={modal.modalStuff}>
          <h2>{clip?.title}</h2>
          <Divider
            style={{
              backgroundColor: "var(--mui-palette-background-paper)"
            }}
          />
          <p>{clip?.description}</p>
          {/* <img src={clip.thumbnail_url.replace("%{width}", 240).replace("%{height}", 110)} alt={clip.title} /> */}
          <video src={clip?.url} controls width="100%" />
          <a href={clip?.url} target="_blank" rel="noreferrer">Watch</a>
        </div>
      </div>
    </Modal>
  )
}