import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import "./global.css";

import theme from "./theme";
import Header from "./header";
import { Background } from "./background";
import Cookies from "./cookies";

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
            <Header />
            <Background />
            {children}
            <Cookies />
          </CssVarsProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

export default MainPageHeader;
