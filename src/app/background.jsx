"use client";

import styled from '@emotion/styled';

const BGElemLeftBig = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "30rem",
    width: "30rem",
    left: "-15rem",
    top: "5rem",
    ////////////
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.dark,
    borderRadius: "50%",
    zIndex: "-2",
    filter: "blur(60px)"
  }
}));

const BGElemLeftSmall = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "20rem",
    width: "20rem",
    left: "-10rem",
    top: "10rem",
    ////////////
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.light,
    borderRadius: "50%",
    zIndex: "-1",
    filter: "blur(60px)"
  }
}));

const BGElemRightBig = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "30rem",
    width: "30rem",
    right: "-15rem",
    top: "40rem",
    ////////////
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.dark,
    borderRadius: "50%",
    zIndex: "-2",
    filter: "blur(60px)"
  }
}));

const BGElemRightSmall = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "20rem",
    width: "20rem",
    right: "-10rem",
    top: "45rem",
    ////////////
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.light,
    borderRadius: "50%",
    zIndex: "-1",
    filter: "blur(60px)"
  }
}));

const StyledImg = styled("img")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "absolute",
    top: "0",
    zIndex: "-3",
    backgroundColor: theme.vars.palette.background.dark,
    transform: "rotate(180deg)",
  }
}));

function Background({ }) {
  return (
    <div style={{
      maxWidth: "100vw",
      maxHeight: "200vh",
      top: "0",
      left: "0",
      zIndex: "-5",
    }}>
      <BGElemLeftBig />
      <BGElemLeftSmall />

      <BGElemRightBig />
      <BGElemRightSmall />

        <StyledImg src="wave.svg" alt="wave" style={{
          position: "absolute",
          // top: "20rem",
        }} />
    </div>
  );
}

export { Background };