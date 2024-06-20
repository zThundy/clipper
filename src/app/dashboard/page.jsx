"use client";
"disable strict";

import { useMemo, useState, useEffect } from "react";
import { Button, Checkbox, FormControlLabel, Switch, Snackbar, Alert, Grid, Pagination, Skeleton, Tooltip } from "@mui/material";
import { Delete, Download, FilterAlt, Home } from "@mui/icons-material";

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import ModalClipContent from "./modal.content";
import ModalDownloadContent from "./modal.download";
import ModalFilterContent from "./modal.filter";
import Clip from "./clip";

import style from "./page.module.css";

const clipsDimenstions = {
  width: 480,
  height: 272
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

function Dashboard({ }) {
  const [selectAll, setSelectAll] = useState(false);
  const [clips, setClips] = useState([]);
  const [modalData, setModalData] = useState(null);

  const [open, setOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [selectedClips, setSelectedClips] = useState([]);

  const [clipsDownload, setClipsDownload] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const fetchClips = () => {
    // get the clips on page load using the api call /api/get-clips
    fetch(`/api/get-clips?currentPage=${currentPage}`)
      .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then(data => {
        if (!data) throw new Error("No data found in the response");
        let clips = data;

        // add the result to the clips array
        setClips((prev) => {
          setSelectAll(prev => {
            if (prev) clips.forEach(_ => _.checked = true);
            else clips.forEach(_ => _.checked = false);
            return prev;
          });

          setSelectedClips(clips.filter(_ => _.checked));
          return clips;
        });
      })
      .catch(err => {
        setNotifType("error");
        handleOpen(`Error: ${err.message}`);
        if (err.redirect) window.location.href = err.redirectPath;
        setClips([]);
      });

  }

  useEffect(() => {
    if (!(process.env.NODE_ENV === "development")) fetchClips();
    localStorage.setItem("loggedIn", "true");
    return () => {
      // REACT... FUCK YOU... GODDAMIT... FUUUUUUUUUUCKKKKKKKKKKK YOOOOOOOUUUUUUUUU
      if (process.env.NODE_ENV === "development") fetchClips();
    };
  }, []);

  useEffect(() => {
    // change this? Maybe? IDK
    if (currentPage % 2 === 0) fetchClips();
  }, [currentPage])

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
      <LocalizationProvider dateAdapter={AdapterMoment}>
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

        <ModalFilterContent open={openFilterModal} onClose={() => setOpenFilterModal(false)} />
        <ModalClipContent clip={modalData} setModalData={setModalData} />
        <ModalDownloadContent open={clipsDownload} selectedClips={selectedClips} setClipsDownload={setClipsDownload} setErrorMessage={(message) => {
          setNotifType("error");
          handleOpen(message);
          setClipsDownload(false);
        }} />

        <div className={style.header}>
          <div style={{
            display: "flex",
            flexDirection: "row",
            margin: "0 0 0 1rem",
          }}>
            <Tooltip title="Homepage">
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
            </Tooltip>

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
                  setSelectedClips(clips.filter(_ => _.checked));
                }}
                label="Select all"
              />
            </div>

            <Tooltip title="Filter">
              <Button
                className={style.filterButton}
                color="primary"
                variant="contained"
                onClick={() => {
                  setOpenFilterModal(true);
                }}
              >
                <FilterAlt />
              </Button>
            </Tooltip>
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
                // check if there are any clips selected
                if (selectedClips.length === 0) {
                  setNotifType("warning");
                  handleOpen("No clips selected");
                  return;
                }
                setClipsDownload(true);
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
              onClick={() => {
                setNotifType("warning");
                handleOpen("Not implemented yet :(");
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        <Grid container className={style.clipsContainer}>
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
                      // console.log(clips.filter(_ => _.checked));
                      setSelectedClips(clips.filter(_ => _.checked));
                    }}
                  />
                ));
            }, [selectAll, clips, currentPage])
          }
        </Grid>

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
      </LocalizationProvider>
    </>
  );
}

export default Dashboard;