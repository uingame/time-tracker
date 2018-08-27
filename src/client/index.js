import React from 'react'
import ReactDom from 'react-dom'
import {AppContainer} from 'react-hot-loader'
import {App} from './App'
import {injectGlobal} from 'emotion'

injectGlobal`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700');

  html, body {
    height: 100%;
    margin: 0;
    overflow: auto;
    direction: rtl;
  }

  * {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    box-sizing: border-box;
  }
`

const render = Component => {
  ReactDom.render(
    <AppContainer>
      <Component/>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
    module.hot.accept('./App', () =>{
      render(App)
    })
}
