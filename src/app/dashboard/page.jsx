"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Button, Checkbox, FormControlLabel, Switch, Snackbar, Alert, Modal, Pagination } from "@mui/material";
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

function Clip({ clip, openModal, _ }) {
  const [_clip, setClip] = useState(clip);
  const [checked, setChecked] = useState(clip.checked);

  // const checked = useMemo(() => { return _clip.checked || false; }, [_clip.checked]);

  // const [checked, setChecked] = useState(clip.checked || false);

  useEffect(() => {
    setChecked(clip.checked);
    setClip(clip);
  }, [clip]);

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
    // if the page is odd, the cursor is forced to null so we don't fetch shit
    if (currentPage !== 1 && currentPage % 4 !== 0) return;

    let cursors = JSON.parse(localStorage.getItem("cursors")) || {};
    // get the cursor for the previous page
    let cursor = cursors[currentPage - 3] || "null";
    // get the clips on page load using the api call /api/get-clips
    fetch(`/api/get-clips?cursor=${cursor}`)
      .then(res => res.json())
      .then(data => {
        // save cursors in localStorage with the page number
        cursors[currentPage] = data.pagination?.cursor || "null";
        localStorage.setItem("cursors", JSON.stringify(cursors));

        // add the result to the clips array
        setClips((prev) => {
          data.data.forEach(_ => _.checked = false);
          if (selectAll) data.data.forEach(_ => _.checked = true);

          // check if the clip id is already in the clips array
          let newClips = data.data.filter(_ => !prev.some(clip => clip.id === _.id));
          return [...prev, ...newClips];
        });
      })
      .catch(err => {
        setNotifType("error");
        handleOpen(`Failed to fetch clips. Error: ${err}`);
        setClips([]);
      });
  }, [currentPage]);

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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
        {/* <ButtonGroup>
          <StyledPageButton
            onClick={() => {
              if (currentPage === 1) return;
              setCurrentPage(currentPage - 1)
              // window.scrollTo(0, 0);
            }}
          ><ArrowBack /></StyledPageButton>
          {useMemo(() => {
            let pages = [];
            const maxButtons = 5;
            // show only a maximum of 5 pages at a time
            for (let i = Math.max(1, currentPage - maxButtons); i <= Math.min(Math.ceil(clips.length / clipsPerPage), currentPage + maxButtons); i++) {
              pages.push(
                <StyledPageButton
                  key={i}
                  onClick={() => {
                    setCurrentPage(i);
                    window.scrollTo(0, 0);
                  }}
                  sx={currentPage === i ? { color: "var(--mui-palette-primary-dark)" } : {}}
                >
                  {i}
                </StyledPageButton>
              );
            }
            return pages;
          }, [clips, currentPage])}
          <StyledPageButton
            onClick={() => {
              // if there is a cursor in localStorage, show the next page button
              if (localStorage.getItem("cursor").cursor !== "null") return setCurrentPage(currentPage + 1);
              if (currentPage === Math.ceil(clips.length / clipsPerPage)) return;
              setCurrentPage(currentPage + 1);
              // window.scrollTo(0, 0);
            }}
          ><ArrowForward /></StyledPageButton>
        </ButtonGroup> */}

        <Pagination
          count={Math.ceil(clips.length / clipsPerPage)}
          page={currentPage}
          showFirstButton
          showLastButton
          onChange={(_, page) => {
            setCurrentPage(page);
          }}
        />
      </div>
    </>
  );
}

export default Dashboard;