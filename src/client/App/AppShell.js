import React from 'react'
import styled from 'react-emotion'
import Header from './Header'

const Container = styled.div`
  margin: 10
`

const AppShell = ({children}) => (
  <Container>
    <Header />
    <main>
      {children}
    </main>
  </Container>
)

export default AppShell
