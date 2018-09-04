import React from 'react'
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  textField: {
    padding: theme.spacing.unit * 2,
  },
  label: {
    left: 'unset',
    direction: 'rtl',
    transformOrigin: 'top right'
  },
  input: {
    marginTop: 'unset !important'
  },
})

const RtlTextField = ({name, label, value, onChange, error, fullWidth, disabled, classes}) => (
  <TextField
    className={classes.textField}
    name={name}
    label={label}
    value={value}
    onChange={onChange}
    error={error}
    fullWidth={fullWidth}
    disabled={disabled}
    InputLabelProps={{
      className: classes.label,
    }}
    InputProps={{
      className: classes.input,
    }}
  />
)

export default withStyles(styles)(RtlTextField)
