import { FC, ReactElement, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import cn from "classnames";

import {
  ThemeSwitcher,
  LanguageSelector,
  ErrorBoundary,
  Offline,
} from "src/@core/components";
import { routes } from "router/Router";

// ** Component Imports
import ThemeComponent from "src/@core/theme/ThemeComponent";

// ** Contexts
import {
  SettingsConsumer,
  SettingsProvider,
} from "src/@core/context/settingsContext";

import { useAppSelector, useAppDispatch, RootState } from "store/store";
import { switchToDark } from "store/theme/themeSlice";
import {
  THEME_NAMES,
  localStorageAppKey,
  reduxHydrationAction,
} from "constants/commonConstants";

import { isServer } from "src/@core/utils";

const App: FC = (): ReactElement => {
  const content = useRoutes(routes);
  const currentTheme = useAppSelector((state) => state.theme.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      window.__PRELOADED_STATE__?.theme?.theme == null &&
      JSON.parse(localStorage.getItem(localStorageAppKey) as string)?.theme ==
        null &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      dispatch(switchToDark());
    }

    /*
      If it is SSR version, we need to render a server version first
      to avoid "Text content does not match server-rendered HTML" error.
      Then rehydrate all the state with persisted data from local storage.
      Otherwise, check index.tsx file.
     */
    if (
      !isServer &&
      !NO_SSR &&
      localStorage.getItem(localStorageAppKey) != null
    ) {
      const localStoragePersistedState: Partial<RootState> = JSON.parse(
        localStorage.getItem(localStorageAppKey) as string,
      );
      dispatch({
        type: reduxHydrationAction,
        payload: localStoragePersistedState,
      });
    }
  }, []);

  return (
    <SettingsProvider>
      <SettingsConsumer>
        {({ settings }) => {
          return (
            <ThemeComponent settings={settings}>
              <ErrorBoundary>
                <div
                  className={cn(
                    "app-wrapper",
                    currentTheme === THEME_NAMES.DARK && "theme-dark",
                  )}
                >
                  <LanguageSelector />
                  <ThemeSwitcher />
                  <Offline />
                  {content}
                </div>
              </ErrorBoundary>
            </ThemeComponent>
          );
        }}
      </SettingsConsumer>
    </SettingsProvider>
  );
};

export { App };
