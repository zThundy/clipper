"use client";

import { Checklist, Download, Login } from "@mui/icons-material";
import { Container, Stack, styled, Paper } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.main,
  padding: theme.spacing(3),
  textAlign: 'center',
  width: "20rem",
  // color: theme.vars.palette.text.main,
  "& .MuiSvgIcon-root": {
    margin: theme.spacing(1),
    backgroundColor: theme.vars.palette.primary.main,
    borderRadius: "50%",
    padding: theme.spacing(2),
    fontSize: "3rem",
    color: theme.vars.palette.primary.contrastText,
    border: `.5rem solid ${theme.vars.palette.primary.dark}`,
  },
}));

function Features({ }) {
  return (
    <div
      style={{
        width: "100%",
        height: "fit-content",
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        margin: "auto 0 auto 0",
      }}
    >
      <Stack
        direction={{ sm: 'column', md: 'row' }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
      >
        <Item>
          <Login fontSize="large" />
          <Container>
            <h2>Login</h2>
            <p>Sign in with your Twitch account to access your clips</p>
          </Container>
        </Item>
        <Item>
          <Checklist fontSize="large" />
          <Container>
            <h2>Select</h2>
            <p>Choose the clips you want to download or manage</p>
          </Container>
        </Item>
        <Item>
          <Download fontSize="large" />
          <Container>
            <h2>Download</h2>
            <p>Download your clips in original quality in no time!</p>
          </Container>
        </Item>
      </Stack>
    </div>
  );
}

export default Features;