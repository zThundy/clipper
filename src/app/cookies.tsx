"use client";

import {
  Unstable_TrapFocus as TrapFocus,
  Fade,
  Paper,
  Stack,
  Box,
  Button,
  styled
} from "@mui/material";

import { useEffect, useState } from "react";

const StyledAcceptButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.pxToRem(14),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.success.dark,
  },
}));

const StyledRejectButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.pxToRem(14),
  backgroundColor: "var(--mui-palette-background-light)",
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.dark,
  },
}));

function Cookies({ }) {
  const [bannerOpen, setBannerOpen] = useState("open");

  useEffect(() => {
    const banner = localStorage.getItem('cookieBanner');
    if (banner === "closed") {
      setBannerOpen("closed");
    }
  }, []);

  const closeBanner = () => {
    setBannerOpen("closed");
    localStorage.setItem('cookieBanner', 'closed');
  }

  return (
    <div>
      <TrapFocus open disableAutoFocus disableEnforceFocus>
        <Fade appear={true} in={bannerOpen === "open"} timeout={1000} >
          <Paper
            role="dialog"
            aria-modal="false"
            aria-label="Cookie banner"
            square
            variant="outlined"
            tabIndex={-1}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              m: 0,
              p: 2,
              borderWidth: 0,
              borderTopWidth: 1,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              gap={2}
            >
              <Box
                sx={{
                  flexShrink: 1,
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <div style={{
                  color: 'var(--mui-palette-text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}>
                  This website uses cookies
                </div>
                <div
                  style={{
                    color: 'var(--mui-palette-text-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  We use cookies to enhance your experience on our site. By using our service to download clips from your Twitch channel, you agree to our use of cookies for the following purposes:
                  <ul>
                    <li><b>Performance and Analytics:</b> We collect data to understand how our site is used, helping us improve functionality and user experience.</li>
                    <li><b>Functionality:</b> Cookies ensure our site runs smoothly and that you can download your clips efficiently.</li>
                    <li><b>Personalization:</b> We use cookies to remember your preferences and settings for a more personalized experience.</li>
                  </ul>
                  You can manage your cookie preferences in your browser settings. For more information, read our Privacy Policy.
                </div>
              </Box>
              <Stack
                gap={2}
                direction={{
                  xs: 'row-reverse',
                  sm: 'column',
                }}
                sx={{
                  width: '10rem',
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                }}
              >
                <StyledAcceptButton size="small" onClick={closeBanner} variant="contained">
                  Allow all
                </StyledAcceptButton>
                <StyledRejectButton size="small" onClick={closeBanner}>
                  Reject all
                </StyledRejectButton>
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      </TrapFocus>
    </div>
  )
}

export default Cookies;