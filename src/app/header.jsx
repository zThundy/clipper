"use client";

import { usePathname } from 'next/navigation';
import Image from "next/image";

import { useEffect, useState } from 'react';
import { Grid, Button, Avatar, Badge } from '@mui/material';
import styled from '@emotion/styled';
import { Dashboard, Login } from '@mui/icons-material';

const StyledHeaderContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "fixed",
    margin: "auto",
    width: "80%",
    backgroundColor: theme.vars.palette.background.main,
    borderRadius: "50rem",
    color: theme.vars.palette.text.primary,
    padding: "1.5rem 2rem 1.5rem 2rem",
    display: "flex",
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
    border: "2px solid " + theme.vars.palette.background.light,
    userSelect: "none",
    transition: "box-shadow .2s",
    "&:hover": {
      boxShadow: "0 0 15px 2px " + theme.vars.palette.background.light,
    }
  }
}));

const StyledTitle = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "fit-content",
  height: "100%",
  cursor: "pointer",
  [theme.breakpoints.up('xs')]: {
    "& .spanTitle": {
      display: "none"
    }
  },
  [theme.breakpoints.up('md')]: {
    "& .spanTitle": {
      display: "flex",
      fontSize: "1.6rem",
      fontWeight: "bold",
      margin: "0 0 0 1rem"
    }
  }
}));

const StyledNav = styled("nav")(({ theme }) => ({
  [theme.breakpoints.up("xs")]: {
    display: "none",
    "& a": {
      display: "none",
    }
  },
  [theme.breakpoints.up("sm")]: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    width: "fit-content",
    height: "100%",
    "& a": {
      display: "flex",
      color: theme.vars.palette.text.dark,
      textDecoration: "none",
      margin: "0 1.5rem 0 1.5rem",
      fontSize: "1.1rem",
      fontWeight: "bold",
      transition: "color .1s",
      "&:hover": {
        color: theme.vars.palette.text.light
      }
    }
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  "@keyframes gradient": {
    "0%": {
      backgroundColor: theme.vars.palette.primary.dark,
      color: theme.vars.palette.text.darkgray,
    },
    "50%": {
      backgroundColor: theme.vars.palette.primary.light,
      color: theme.vars.palette.text.gray,
    },
    "100%": {
      backgroundColor: theme.vars.palette.primary.dark,
      color: theme.vars.palette.text.darkgray,
    }
  },
  [theme.breakpoints.up('xs')]: {
    color: theme.vars.palette.text.gray,
    animation: "gradient 8s infinite ease",
    padding: "1rem 2rem 1rem 2rem",
    borderRadius: "2rem",
    // border: "2px solid " + theme.vars.palette.primary.dark,
    fontSize: "1.2rem",
    fontWeight: "bold",
    transition: "color .4s, background-color .2s, border-radius .2s",
    "&:hover": {
      color: theme.vars.palette.text.main + " !important",
      backgroundColor: theme.vars.palette.primary.light + " !important",
      borderRadius: ".5rem",
      cursor: "pointer",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.6rem"
    }
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    "& .MuiBadge-dot": {
      backgroundColor: theme.vars.palette.warning.light,
      boxShadow: "0 0 0 2px " + theme.vars.palette.background.light,
      fontSize: ".8rem",
    },
    "& .MuiBadge-badge": {
      fontSize: ".8rem",
      fontWeight: "bold",
    }
  }
}));

function Header({ }) {
  const path = usePathname();
  const [loggedIn, setLoggedIn] = useState("");

  useEffect(() => {
    const loggedIn = Boolean(localStorage.getItem("loggedIn"));
    if (loggedIn) setLoggedIn("Dashboard");
    else setLoggedIn("Login");
  }, []);

  return (
    <div
      style={(() => {
        if (path === "/dashboard") return {
          display: "none"
        };
        return {
          width: "100%",
          height: "10rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        };
      })()}
    >
      <StyledHeaderContainer container style={{ justifyContent: "space-between" }}>
        <Grid item xs={4} sm={5} md={6} lg={6} xl={6}
          style={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center"
          }}
        >
          <StyledTitle
            onClick={() => {
              if (path === "/") return window.scrollTo(0, 0);
              window.location.href = "/";
            }}
          >
            <StyledBadge
              badgeContent={"Beta"}
              color="warning"
              fontSize=".8rem"
              overlap='circular'
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Avatar
                alt="Clipmaner"
                sx={{
                  width: "4rem",
                  height: "4rem",
                  backgroundColor: "var(--mui-palette-background-dark)",
                  border: "3px solid var(--mui-palette-background-light)"
                }}>
                <Image src="/images/clipmaner.png" width={45} height={45} alt="logo" />
              </Avatar>
            </StyledBadge>
            <span className='spanTitle'>Clipmaner</span>
          </StyledTitle>
          <StyledNav>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </StyledNav>
        </Grid>
        <Grid item xs={8} sm={6} md={5} lg={5} xl={4} style={{ display: "flex", justifyContent: "right" }}>
          <StyledButton
            variant="contained"
            color='primary'
            disableElevation
            disableRipple
            disableFocusRipple
            startIcon={loggedIn === "Dashboard" ? <Dashboard /> : <Login fontSize='large' />}
            onClick={() => {
              if (loggedIn === "Dashboard") {
                // double check on click just in case
                const loggedIn = Boolean(localStorage.getItem("loggedIn"));
                if (!loggedIn) return window.open("/api/login", "_blank");
                window.location.href = "/dashboard";
              }
              else window.open("/api/login", "_blank");
            }}
          >{loggedIn}</StyledButton>
        </Grid>
      </StyledHeaderContainer>
    </div>
  )
};

export default Header;