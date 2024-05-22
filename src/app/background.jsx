"use client";

import styled from '@emotion/styled';

const FirstRound = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.dark,
    borderRadius: "50%",
    zIndex: "-2",
    // blur filter
    filter: "blur(60px)"
  }
}));

const SecondRound = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.light,
    borderRadius: "50%",
    zIndex: "-1",
    // blur filter
    filter: "blur(60px)"
  }
}));

const StyledImg = styled("img")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    width: "100%",
    position: "absolute",
    bottom: "0",
    zIndex: "-3",
    backgroundColor: theme.vars.palette.background.dark,
    transform: "rotate(180deg)",
  }
}));

const StyledBackground = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    width: "100vw",
    height: "100vh",
    backgroundColor: theme.vars.palette.background.dark,
    zIndex: "-4",
  }
}));

function Background({ }) {
  return (
    <>
      <FirstRound
        style={{
          height: "60rem",
          width: "60rem",
          left: "-30rem",
          top: "-10rem",
        }}
      ></FirstRound>
      <SecondRound
        style={{
          height: "40rem",
          width: "40rem",
          left: "-20rem",
          top: "0rem",
        }}
      ></SecondRound>

      <FirstRound
        style={{
          height: "80rem",
          width: "80rem",
          right: "-40rem",
          top: "60rem",
        }}
      ></FirstRound>
      <SecondRound
        style={{
          height: "60rem",
          width: "60rem",
          right: "-30rem",
          top: "70rem",
        }}
      ></SecondRound>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: "1",
        userSelect: "none",
      }}>
        <StyledImg src="wave.svg" alt="wave" style={{ width: "100%" }} />
        <StyledBackground style={{ top: "38rem" }} />
        <StyledBackground style={{ top: "76rem" }} />
      </div>
    </>
  );
}

export { Background };