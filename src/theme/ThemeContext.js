import { createContext, useContext } from "react";
import { lightTheme } from "./themes.js";

export const ThemeContext = createContext(lightTheme);
export const useTheme = () => useContext(ThemeContext);
