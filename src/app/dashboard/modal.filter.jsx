
import { useState } from 'react';

import { Modal, Grid, Divider, Typography, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import moment from 'moment';

import style from "./modal.filter.module.css";
import { useEffect } from 'react';
import { Warning } from '@mui/icons-material';

function ModalFilter({ open, onClose }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const _startDate = localStorage.getItem("startDate");
    const _endDate = localStorage.getItem("endDate");

    console.log(_startDate, _endDate)
    console.log(moment(_startDate).isValid(), moment(_endDate).isValid())

    // check with moment if the date is valid
    if (moment(_startDate).isValid()) setStartDate(moment(_startDate));
    else setStartDate(null);
    // check with moment if the date is valid
    if (moment(_endDate).isValid()) setEndDate(moment(_endDate));
    else setEndDate(null);
  }, [])

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
        <Grid item xs={6} className={style.datePickerContainer}>
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
        <Grid item xs={6} className={style.datePickerContainer}>
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
            onChange={(value) => {
              // console.log(value);
              setEndDate(value);
              localStorage.setItem("endDate", value);
            }}
            renderInput={(params) => <input {...params} />}
          />
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
        <Grid item xs={12} className={style.datePickerContainer}>
          <Typography
            style={{
              fontSize: "2.5rem",
            }}
          >
            Title
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            color="primary"
            className={style.textField}
          />
        </Grid>
      </Grid>
    </Modal>
  );
}

export default ModalFilter;