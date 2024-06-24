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
  const [selectAll, setSelectAll] = useState([]);
  const [clips, setClips] = useState([]);
  const [modalData, setModalData] = useState(null);

  const [open, setOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [selectedFilters, setSelectedFilters] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  // const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [selectedClips, setSelectedClips] = useState([]);

  const [clipsDownload, setClipsDownload] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const fetchClips = (localFilters) => {
    const parameters = new URLSearchParams();
    if (localFilters) { parameters.append("filters", JSON.stringify(localFilters)); }
    if (!localFilters && selectedFilters) { parameters.append("filters", JSON.stringify(selectedFilters)); }
    parameters.append("currentPage", currentPage);

    // get the clips on page load using the api call /api/get-clips
    fetch(`/api/get-clips?${parameters.toString()}`)
      .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then(data => {
        if (!data) throw new Error("No data found in the response");
        let clips = data;

        // add the result to the clips array
        setClips((prev) => {
          setSelectedClips(clips.filter(_ => _.checked));
          // replace the checked value of "clips" to the one in prev
          clips.forEach(clip => {
            const _clip = prev.find(_ => _.id === clip.id);
            if (_clip) clip.checked = _clip.checked;
          });
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

  useEffect(() => {
    const filters = localStorage.getItem("filters");
    console.log(filters);
    setSelectedFilters(() => {
      const _filters = filters ? JSON.parse(filters) : {}
      if (!openFilterModal) fetchClips(_filters);
      return _filters;
    });
    // if (!filters) fetchClips();
  }, [openFilterModal]);

  const handleClose = (e, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleOpen = (message) => {
    setOpen(true);
    setNotifMessage(message);
  };

  const selectAllInCurrentPage = (_page) => {
    if (!_page) _page = currentPage;
    const startIndex = ((_page - 1) * clipsPerPage)
    const endIndex = startIndex + clipsPerPage;
    // set checked to the clips in this range
    // copy selectAll to the new object
    let _selectAll = [...selectAll];
    // find if _selectAll contains currentPage, if so, change selected from true to false
    const currentPageExists = _selectAll.some(item => item.page === _page);
    if (currentPageExists) {
      _selectAll = _selectAll.map(item => {
        if (item.page === _page) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
    } else {
      _selectAll.push({ page: _page, selected: true });
    }
    // set the new selectAll
    setSelectAll((prev) => { return _selectAll; });
    // update clips
    let _clips = [...clips];
    _clips.slice(startIndex, endIndex).forEach(clip => clip.checked = _selectAll.find(_ => _.page === _page).selected);
    setClips(_clips);
  }

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

        <ModalFilterContent open={openFilterModal} onClose={() => setOpenFilterModal(false)} clips={clips} />
        <ModalClipContent clip={modalData} setModalData={setModalData} />
        <ModalDownloadContent open={clipsDownload} selectedClips={selectedClips} setClipsDownload={setClipsDownload} setErrorMessage={(message) => {
          setNotifType("error");
          handleOpen(message);
          setClipsDownload(false);
        }} />

        <Grid
          container
          justifyContent={"center"}
          alignContent={"center"}
        >
          <Grid item xs={12}>
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
                        checked={selectAll.find(_ => _.page === currentPage)?.selected || false}
                      />
                    }
                    onChange={() => {
                      selectAllInCurrentPage();
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
                    disableElevation
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

                {/* <Switch
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
                </Button> */}
              </div>
            </div>
          </Grid>

          <Grid item xs={12}>
            <Grid
              container
              style={{
                marginTop: "8rem"
              }}
              justifyContent={"center"}
              alignContent={"center"}
            >
              {
                useMemo(() => {
                  if (clips.length === 0) return <Loading />;

                  return clips
                    .slice((currentPage - 1) * clipsPerPage, currentPage * clipsPerPage)
                    .map((clip, index) => (
                      <Grid xs={4} item className={style.clipContainer} key={index}>
                        <Clip
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
                      </Grid>
                    ));
                }, [selectAll, clips, currentPage])
              }
            </Grid>
          </Grid>

          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default Dashboard;