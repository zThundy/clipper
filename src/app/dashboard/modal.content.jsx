import modal from "./page.modal.module.css";

export default function ModalContent({ clip }) {
  return (
    <div className={modal.modalStuffBg}>
      <div className={modal.modalStuff}>
        <h2>{clip.title}</h2>
        <p>{clip.description}</p>
        <img src={clip.image} alt={clip.title} />
        <a href={clip.url} target="_blank" rel="noreferrer">Watch</a>
      </div>
    </div>
  )
}