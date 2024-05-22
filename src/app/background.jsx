"use client";

import styled from '@emotion/styled';

const FirstRound = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.dark,
    borderRadius: "50%",
    zIndex: "-2",
    filter: "blur(60px)"
  }
}));

const SecondRound = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    backgroundColor: theme.vars.palette.primary.light,
    borderRadius: "50%",
    zIndex: "-1",
    filter: "blur(60px)"
  }
}));

const StyledBackground = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "absolute",
    width: "100vw",
    height: "160vh",
    top: "30rem",
    backgroundColor: theme.vars.palette.background.dark,
    zIndex: "-4",
  }
}));

const StyledImg = styled("img")(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
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
      <FirstRound
        style={{
          height: "40rem",
          width: "40rem",
          left: "-20rem",
          top: "0",
        }}
      ></FirstRound>
      <SecondRound
        style={{
          height: "20rem",
          width: "20rem",
          left: "-10rem",
          top: "10rem",
        }}
      ></SecondRound>

      <FirstRound
        style={{
          height: "50rem",
          width: "50rem",
          right: "-30rem",
          bottom: "-25rem",
        }}
      ></FirstRound>
      <SecondRound
        style={{
          height: "30rem",
          width: "30rem",
          right: "-20rem",
          bottom: "-16rem",
        }}
      ></SecondRound>

      <StyledBackground>
        <StyledImg src="wave.svg" alt="wave" />
      </StyledBackground>
    </div>
  );
}

export { Background };