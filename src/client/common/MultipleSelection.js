import React from 'react'
import { withStyles } from "@material-ui/core/styles"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Input from "@material-ui/core/Input"
import MenuItem from "@material-ui/core/MenuItem"
import Select from "@material-ui/core/Select"

const styles = theme => ({
  formControl: {
    padding: theme.spacing.unit * 2
  },
  cssLabel: {
    left: 'unset',
    direction: 'rtl',
    transformOrigin: 'top right'
  },
  formInput: {
    marginTop: 'unset !important'
  },
  title: {
    padding: theme.spacing.unit * 2,
  },
  selectText: {
    paddingRight: 'unset',
    paddingLeft: 32
  },
  selectIcon: {
    left: 0,
    right: 'unset'
  }
})

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const MultipleSelection = ({label, disabled, value, onChange, data, displayField, classes, keyField='_id'}) => (
  <FormControl disabled={disabled} className={classes.formControl} fullWidth={true}>
    <InputLabel
      FormLabelClasses={{
        root: classes.cssLabel
      }}
      htmlFor="select-multiple-checkbox"
    >
      {label}
    </InputLabel>
    <Select
      multiple
      value={value}
      onChange={onChange}
      input={<Input
        classes={{
          root: classes.formInput
        }}
        id="select-multiple-checkbox"
      />}
      MenuProps={MenuProps}
      classes={{
        icon: classes.selectIcon,
        select: classes.selectText
      }}
    >
      {data.map(item => (
        <MenuItem key={item[keyField]} value={item[keyField]}>
          {item[displayField]}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)

export default withStyles(styles)(MultipleSelection)
