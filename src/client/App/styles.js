import React from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();

const StylesProvider = ({children}) => (
  <MuiThemeProvider theme={theme}>
    {children}
  </MuiThemeProvider>
)

export {StylesProvider}
