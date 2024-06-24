
import { useState, useEffect } from 'react';

import { Modal, Grid, Divider, Typography, TextField, Button, FormControl, Select, MenuItem, Switch } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import moment from 'moment';

import style from "./modal.filter.module.css";
import { Check, Close, Delete, Warning } from '@mui/icons-material';

function ModalFilter({ open, onClose, filterApplied, clips }) {
  const [errored, setErrored] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState('');
  const [authorList, setAuthorList] = useState([]);
  const [type, setType] = useState("clips");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const _startDate = localStorage.getItem("startDate");
    const _endDate = localStorage.getItem("endDate");

    // console.log(_startDate, _endDate)
    // console.log(moment(_startDate).isValid(), moment(_endDate).isValid())

    // check with moment if the date is valid
    if (moment(_startDate).isValid()) setStartDate(moment(_startDate));
    else setStartDate(null);
    // check with moment if the date is valid
    if (moment(_endDate).isValid()) setEndDate(moment(_endDate));
    else setEndDate(null);
  }, [])

  useEffect(() => {
    let _authorList = clips.map(clip => clip.creator_name);
    // remove duplicates
    _authorList = [...new Set(_authorList)];
    setAuthorList(_authorList);
    // console.log("_authorList", _authorList)
  }, [clips])

  const handleChange = (event) => {
    setAuthor(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  }

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  }

  const applyFilters = () => {
    if (errored) return;

    const filters = {
      startDate: startDate,
      endDate: endDate,
      title: title,
      author: author,
      type: type,
      sortBy: sortBy,
    }

    localStorage.setItem("filters", JSON.stringify(filters));
  }

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setTitle("");
    setAuthor("");
    setSortBy("date");
    setType("clips");
    localStorage.removeItem("filters");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
  }

  useEffect(() => {
    // check if errored
    if (startDate && endDate && startDate > endDate) {
      setErrored(true);
    } else {
      setErrored(false);
    }

    if (type !== "clips" && type !== "video") {
      setType("clips");
    }

    if (sortBy !== "date" && sortBy !== "views" && sortBy !== "title" && sortBy !== "duration") {
      setSortBy("date");
    }
  }, [startDate, endDate, title, author, type, sortBy])

  return (
    <Modal open={open} onClose={onClose} className={style.modal}>
      <Grid container className={style.modalContent}>
        <Grid item xs={12}>
          <h1
            style={{
              color: "var(--mui-palette-text-primary)",
            }}
          >Filter</h1>
        </Grid>
        <Grid item xs={12}>
          <Divider
            style={{
              backgroundColor: "var(--mui-palette-background-paper)"
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <div className={style.warningContainer}>
            <Warning
              style={{
                fontSize: "2rem",
                color: "var(--mui-palette-warning-contrastText)",
              }}
            />
            <p>For a more accurate filtering experience, please scroll through as many pages as possible so that we can create a cache of your clips.<br /> If you want to delete your cache, you can do it from the settings.</p>
          </div>
        </Grid>
        <Grid item xs={4} className={style.datePickerContainer}>
          <Typography
            style={{
              fontSize: "2.5rem",
            }}
          >
            Start Date
          </Typography>
          <DatePicker
            color="primary"
            views={['year', 'month', 'day']}
            fixedWeekNumber={4}
            value={startDate}
            onChange={(value) => {
              // console.log(value);
              setStartDate(value);
              localStorage.setItem("startDate", value);
            }}
            renderInput={(params) => <input {...params} />}
          />
        </Grid>
        <Grid item xs={4} className={style.datePickerContainer}>
          <Typography
            style={{
              fontSize: "2.5rem",
            }}
          >
            End Date
          </Typography>
          <DatePicker
            color="primary"
            views={['year', 'month', 'day']}
            fixedWeekNumber={5}
            value={endDate}
            minDate={startDate}
            onError={(reason) => {
              setErrored(true);
            }}
            onChange={(value) => {
              // console.log(value);
              setErrored(false);
              setEndDate(value);
              localStorage.setItem("endDate", value);
            }}
            renderInput={(params) => <input {...params} />}
          />
        </Grid>
        <Grid item xs={4} className={style.datePickerContainer}>
          <Typography
            style={{
              fontSize: "2.5rem",
            }}
          >
            Type
          </Typography>
          <FormControl
            sx={{
              width: "60%"
            }}
          >
            <Select
              value={type}
              onChange={handleTypeChange}
            >
              {/* <MenuItem value="all">All</MenuItem> */}
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="clips">Clips</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{
          margin: "3rem 0"
        }}>
          <Divider
            style={{
              backgroundColor: "var(--mui-palette-background-paper)"
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="space-between"
            alignContent="center"
          >
            <Grid item xs={4} className={style.datePickerContainer}>
              <Typography
                style={{
                  fontSize: "2.5rem",
                }}
              >
                Title
              </Typography>
              <TextField
                sx={{
                  width: "60%"
                }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                fullWidth
                color="primary"
                className={style.textField}
              />
            </Grid>
            <Grid item xs={4} className={style.datePickerContainer}>
              <Typography
                style={{
                  fontSize: "2.5rem",
                }}
              >
                Author
              </Typography>
              <FormControl
                sx={{
                  width: "60%"
                }}
              >
                <Select
                  value={author}
                  onChange={handleChange}
                >
                  {
                    authorList.map((author, index) => (
                      <MenuItem key={index} value={author}>{author}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} className={style.datePickerContainer} sx={{
              display: "flex",
              flexDirection: "row",
            }}>
              <Typography
                style={{
                  fontSize: "2.5rem",
                }}
              >
                Sort by
              </Typography>
              <FormControl
                sx={{
                  width: "60%"
                }}
              >
                <Select
                  value={sortBy}
                  onChange={handleSortByChange}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="views">Views</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="duration">Duration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          alignContent="flex-end"
        >
          <Grid
            container
            justifyContent="end"
          >
            <Grid
              item
              xs={2}
              justifyContent="center"
              alignContent="center"
              textAlign="center"
            >
              <Button
                variant="contained"
                color={errored ? "error" : "success"}
                // disabled={errored}
                startIcon={errored ? <Close /> : <Check />}
                disableElevation
                onClick={applyFilters}
                // classess={{ disabled: buttonStyle.disabledButton }}
                sx={{ margin: "2rem 0" }}
              >
                Apply
              </Button>
            </Grid>
            <Grid
              item
              xs={2}
              justifyContent="center"
              alignContent="center"
              textAlign="center"
            >
              <Button
                variant="contained"
                color="warning"
                startIcon={<Delete />}
                disableElevation
                onClick={clearFilters}
                sx={{ margin: "2rem 0" }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
}

export default ModalFilter;