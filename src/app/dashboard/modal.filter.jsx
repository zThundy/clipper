
import { Modal } from '@mui/material';

import style from "./modal.filter.module.css";

function ModalFilter({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} className={style.modal}>
      <div className={style.modalContent}>
        <h1>Filter</h1>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default ModalFilter;