import React from 'react'
import {TextField as MuiTextField} from 'material-ui'
import styled from 'react-emotion'

const TextField = ({label, ...otherProps}) => (
  <MuiTextField hintText={label} {...otherProps} />
)

export default styled(TextField)`
  margin-bottom: 15px;
`
