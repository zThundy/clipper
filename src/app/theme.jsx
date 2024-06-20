"use client";

import {
  createTheme,
  experimental_extendTheme as extendTheme
} from '@mui/material/styles';

const augment = createTheme({});
const theme = extendTheme({
  palette: {
    primary: {
      main: 'rgb(134, 82, 246)'
    },
    secondary: {
      main: 'rgb(185, 163, 227)'
    },
    // background: {
    //   main: 'rgb(38, 38, 38)'
    // },
    background: augment.palette.augmentColor({
      color: {
        main: "rgb(38, 38, 38)",
      }
    }),
    warning: {
      main: 'rgb(200, 200, 0)'
    },
    text: {
      main: "rgb(255, 255, 255)",
      primary: 'rgb(255, 255, 255)',
      light: 'rgb(255, 255, 255)',
      dark: 'rgb(200, 200, 200)',
      darker: 'rgb(150, 150, 150)',
      lightgray: 'rgb(120, 120, 120)',
      gray: 'rgb(60, 60, 60)',
      darkgray: 'rgb(40, 40, 40)',
      black: 'rgb(0, 0, 0)'
    },
    accent: {
      main: 'rgb(153, 0, 255)',
      contrastText: 'rgb(255, 255, 255)',
      light: 'rgb(153, 0, 255)',
      dark: 'rgb(153, 0, 255)'
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
        }),
        contained: ({ theme }) => ({
          // backgroundColor: theme.vars.palette.primary.light,
          // color: theme.vars.palette.text.black,
          fontWeight: "bold",
          fontSize: "1.2rem",
          // borderRadius: "2rem",
          padding: "1rem 2rem 1rem 2rem",
          // transition: "border-radius .2s, color .2s",
          // "&:hover": {
          //   backgroundColor: theme.vars.palette.primary.light,
          //   borderRadius: ".5rem",
          // }
        }),
      }
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          borderRadius: '2px',
          borderWidth: '1px',
          borderColor: theme.vars.palette.text.main,
          border: '1px solid',
          fontWeight: 'bold',
          backgroundColor: theme.vars.palette.background.main,

          weekDaysLabel: {
            color: theme.vars.palette.text.main,
          },
        }),
      }
    },
    MuiDayCalendar: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          "&.Mui-selected": {
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.text.main,
          },
          "&.Mui-disabled": {
            color: theme.vars.palette.text.darkgray,
          },
        }),
        weekDayLabel: ({ theme }) => ({
          color: theme.vars.palette.secondary.main,
          fontWeight: 'bold',
        }),
      }
    },
    MuiPickersDay: {
      styleOverrides: {
        today: ({ theme }) => ({
          color: theme.vars.palette.primary.light,
          borderRadius: '50%',
          border: '2px solid ' + theme.vars.palette.primary.main,
          backgroundColor: theme.vars.palette.background.light,
          "&:hover": {
            backgroundColor: theme.vars.palette.background.light,
          },
        }),
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          transition: "border-radius .2s, color .2s",
          "&:hover": {
            backgroundColor: theme.vars.palette.background.light,
            borderRadius: '50%',
            border: '2px solid ' + theme.vars.palette.primary.main,
          },
        }),
      }
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          backgroundColor: theme.vars.palette.background.main,
          "& button": {
            color: theme.vars.palette.text.main,
          }
        }),
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          borderColor: theme.vars.palette.text.main,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          backgroundColor: theme.vars.palette.background.main,
          "&.Mui-focused": {
            border: "none"
          },
        }),
        input: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          input: {
            color: theme.vars.palette.text.main,
          }
        }),
        adornedEnd: ({ theme }) => ({
          color: theme.vars.palette.text.main,
          button: {
            color: theme.vars.palette.text.main,
          }
        }),
        inputHiddenLabel: ({ theme }) => ({
          color: theme.vars.palette.text.main,
        }),
      }
    }
  }
});

// console.log(theme);

export default theme;