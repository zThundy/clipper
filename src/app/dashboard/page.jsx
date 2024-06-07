"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Button, Checkbox, FormControlLabel, Switch, Snackbar, Alert, Modal, Pagination, Skeleton } from "@mui/material";
import Image from "next/image";
import { Delete, Download, Home, Info } from "@mui/icons-material";

import ModalContent from "./modal.content";

import style from "./page.module.css";
import modal from "./page.modal.module.css";

// const StyledPageButton = styled(Button)(({ theme }) => ({
//   color: theme.vars.palette.text.main,
//   backgroundColor: theme.vars.palette.primary.main,
//   fontWeight: "bold",
//   fontSize: "1.2rem",
//   borderRadius: "1rem",
//   padding: ".5rem 1rem .5rem 1rem",
//   transition: "border-radius .2s, color .2s",
//   "&:hover": {
//     backgroundColor: theme.vars.palette.primary.light,
//   }
// }));

const clipsDimenstions = {
  width: 380,
  height: 220
};

const clipsPerPage = 21;

function Loading({ }) {
  const [clipsNumber, setClipsNumber] = useState([]);

  useEffect(() => {
    let _clipsNumber = [];
    for (let i = 0; i < clipsPerPage - 9; i++) _clipsNumber.push(i);
    setClipsNumber(_clipsNumber);
  }, []);


  return (
    <>
      {
        clipsNumber.map((_, index) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            key={index}
          >
            <Skeleton
              variant="rectangular"
              width={clipsDimenstions.width}
              height={clipsDimenstions.height}
              style={{ margin: "0 4rem 1rem 4rem" }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width={clipsDimenstions.width}
              height={20}
              style={{ margin: "0 0 4rem 0" }}
              animation="wave"
            />
          </div>
        ))
      }
    </>
  )
}

function Clip({ clip, openModal, _ }) {
  const [_clip, setClip] = useState(clip);
  const [checked, setChecked] = useState(clip.checked || false);

  // const checked = useMemo(() => { return _clip.checked || false; }, [_clip.checked]);
  // const [checked, setChecked] = useState(clip.checked || false);

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
    <div className={style.clipContainer} data-checked={checked} data-link={clip.url} data-title={clip.title}>
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
    </div>
  );
}

function Dashboard({ }) {
  const [selectAll, setSelectAll] = useState(false);
  const [clips, setClips] = useState([]);
  const [modalData, setModalData] = useState(null);

  const [open, setOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteEnabled, setDeleteEnabled] = useState(false);

  useEffect(() => {
    console.log("fetching clips... or changing page...");
    localStorage.setItem("loggedIn", "true");

    // get the clips on page load using the api call /api/get-clips
    fetch(`/api/get-clips`)
      .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then(data => {
        if (!data) throw new Error("No data found in the response");
        console.log(data);

        // add the result to the clips array
        setClips((prev) => {
          if (selectAll) data.forEach(_ => _.checked = true);
          else data.forEach(_ => _.checked = false);
          return data;
        });
      })
      .catch(err => {
        setNotifType("error");
        handleOpen(`Error: ${err.message}`);
        if (err.redirect) window.location.href = err.redirectPath;
        setClips([]);
      });
  }, []);

  const handleClose = (e, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleOpen = (message) => {
    setOpen(true);
    setNotifMessage(message);
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notifType}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notifMessage}
        </Alert>
      </Snackbar>

      <Modal
        open={modalData !== null}
        onClose={() => setModalData(null)}
        className={modal.modalContainer}
      >
        <ModalContent clip={modalData} />
      </Modal>

      <div className={style.header}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          margin: "0 0 0 1rem",
        }}>
          <Button
            className={style.homeButton}
            color="primary"
            varuant="contained"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <Home />
          </Button>

          <div className={style.selectAllContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  color="secondary"
                  checked={selectAll}
                />
              }
              onChange={() => {
                clips.forEach(_ => _.checked = !selectAll);
                setClips(clips);
                setSelectAll(!selectAll);
              }}
              label="Select all"
            />
          </div>
        </div>

        <div
          style={{
            margin: "0 1rem 0 0",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Button
            className={style.downloadButton}
            startIcon={<Download />}
            onClick={() => {
              let selectedClips = clips.filter(_ => _.checked);
              if (selectedClips.length === 0) {
                setNotifType("error");
                handleOpen("No clips selected for download.");
                return;
              }

              let urls = selectedClips.map(_ => _.url);
              setNotifType("success");
              handleOpen(`Downloading ${urls.length} clips...`);
              // deselect all clips
              clips.forEach(_ => _.checked = false);
              console.log(urls);
              setSelectAll(false);
            }}
          >
            Download
          </Button>

          <Switch
            color="error"
            onChange={() => {
              setDeleteEnabled(!deleteEnabled);
            }}
          ></Switch>

          <Button
            className={style.deleteButton}
            startIcon={<Delete />}
            disabled={!deleteEnabled}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className={style.clipsContainer}>
        {
          useMemo(() => {
            if (clips.length === 0) return <Loading />;

            return clips
              .slice((currentPage - 1) * clipsPerPage, currentPage * clipsPerPage)
              .map((clip, index) => (
                <Clip
                  key={index}
                  checked={clip.checked}
                  clip={clip}
                  openModal={(__clip) => {
                    setModalData(__clip);
                  }}
                  _={() => {
                    // log all checked clips
                    console.log(clips.filter(_ => _.checked));
                  }}
                />
              ));
          }, [selectAll, clips, currentPage])
        }
      </div>

      <div className={style.pageSelector}>
        <Pagination
          count={Math.ceil(clips.length / clipsPerPage)}
          page={currentPage}
          showFirstButton
          showLastButton
          color="primary"
          size="large"
          onChange={(_, page) => {
            setCurrentPage(page);
          }}
        />
      </div>
    </>
  );
}

export default Dashboard;