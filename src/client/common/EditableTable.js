import React from 'react'
import PropTypes from 'prop-types';
import {get} from 'lodash'
import { withStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import TextField from '@material-ui/core/TextField';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import SaveIcon from '@material-ui/icons/Save'
import UndoIcon from '@material-ui/icons/Undo'

import ActivityIndicator from 'common/ActivityIndicator'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700
  },
  bigCell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5,
    width: '50%'
  },
  smallCell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    padding: theme.spacing.unit * 1.5,
    whiteSpace: 'nowrap'
  },
  input: {
    fontSize: '1.25rem',
  },
  fullWidth: {
    width: '100%'
  },
  monthSelection: {
    marginTop: theme.spacing.unit * 1.5
  },
  newIcon: {
    marginLeft: theme.spacing.unit
  }
})

class EditableTable extends React.Component {
  static propTypes = {
    headers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      wide: PropTypes.bool,
      focus: PropTypes.bool,
      type: PropTypes.oneOf(['number']),
      multiline: PropTypes.bool
    })).isRequired,
    data: PropTypes.array.isRequired,
    idField: PropTypes.string,
    isNew: PropTypes.func,
    onDelete: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  static defaultProps = {
    idField: '_id',
    isNew: () => false
  }

  render() {
    const {classes, headers, data, idField, isNew, ...otherProps} = this.props
    return (
      <Table>
        <TableHead>
          <TableRow>
            {headers.map(({id, title, wide}) => (
              <TableCell key={id} className={wide ? classes.bigCell : classes.smallCell}>
                {title}
              </TableCell>
            ))}
            <TableCell className={classes.smallCell}/>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(item => (
            <EditableRow
              key={item[idField]}
              headers={headers}
              idField={idField}
              isNew={isNew(item)}
              data={item}
              {...otherProps}
            />
          ))}
        </TableBody>
      </Table>
    )
  }
}

class _EditableRow extends React.Component {
  static propTypes = {
    headers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      wide: PropTypes.bool,
      focus: PropTypes.bool,
      type: PropTypes.oneOf(['number']),
      multiline: PropTypes.bool
    })).isRequired,
    data: PropTypes.object.isRequired,
    idField: PropTypes.string,
    isNew: PropTypes.bool,
    onDelete: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  state = {
    data: {},
    edit: false,
    saving: false,
    errorFields: []
  }

  constructor(props) {
    super(props)
    this.state.data = props.data
    this.state.edit = props.isNew
  }

  edit() {
    this.setState({
      edit: true,
      errorFields: []
    })
  }

  async delete() {
    this.setState({saving: true})
    try {
      await this.props.onDelete(this.props.data)
    } catch(err) {
      this.setState({saving: false})
    }
  }

  async save() {
    this.setState({saving: true})
    try {
      const data = await this.props.onSave(this.state.data)
      this.setState({
        data,
        saving: false,
        edit: false,
        errorFields: [],
      })
    } catch (err) {
      this.setState({
        saving: false
      })
      const fields = get(err, 'response.data.fields')
      if (fields) {
        this.setState({
          errorFields: Object.keys(fields)
        })
      }
    }

  }

  discardChanged() {
    const {isNew, data} = this.props
    this.setState({
      data,
      edit: false,
      errorFields: []
    })

    if (isNew) {
      this.props.onDelete(this.props.data, true)
    }
  }

  focusOnInput(input) {
    input && input.focus()
  }

  updateData(key, value) {
    this.setState({
      data: {
        ...this.state.data,
        [key]: value
      }
    })
  }

  render() {
    const {classes, headers} = this.props
    const {edit, saving, data, errorFields} = this.state
    return (
      <TableRow>
        {headers.map(({id, focus, type, multiline, wide}) => (
          <TableCell key={id} className={wide ? classes.bigCell : classes.smallCell}>
            {(!edit || saving) && data[id]}
            {edit && !saving && (
              <TextField
                fullWidth={true}
                className={classes.input}
                value={data[id]}
                inputRef={focus && this.focusOnInput}
                onChange={e => this.updateData(id, e.target.value)}
                multiline={multiline}
                type={type}
                error={errorFields.includes(id)}
              />
            )}
          </TableCell>
        ))}
        <TableCell className={classes.smallCell}>
          {(!edit && !saving) && (
            <React.Fragment>
              <IconButton onClick={this.edit}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={this.delete}>
                <DeleteIcon />
              </IconButton>
            </React.Fragment>
          ) }
          {saving && <ActivityIndicator />}
          {(edit && !saving) && (
            <React.Fragment>
              <IconButton onClick={this.save}>
                <SaveIcon />
              </IconButton>
              {<IconButton onClick={this.discardChanged}>
                <UndoIcon />
              </IconButton>}
            </React.Fragment>
          )}
        </TableCell>
      </TableRow>
    )
  }
}

const EditableRow = withStyles(styles)(_EditableRow)

export default withStyles(styles)(EditableTable)
