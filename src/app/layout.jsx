import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
// import React from "react";
import theme from "./theme";
import { StyledHeader } from "./styled";
import { Background } from "./background";
import "./global.css";

export const metadata = {
  title: "Clipper - Clip manager",
  description: "The best way to manage your twitch clips",
};

function MainPageHeader(props) {
  const { children, router } = props;

  return (
    <html>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <CssVarsProvider theme={theme}>
            <StyledHeader />
            <Background />
            {children}
          </CssVarsProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

export default MainPageHeader;
