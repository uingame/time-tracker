import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'

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
    fontSize: '1.25rem'
  },
  monthSelection: {
    marginTop: theme.spacing.unit * 1.5
  },
  newIcon: {
    marginLeft: theme.spacing.unit
  }
});

let id = 0;
function createData(name, defaultHourlyQuote, notes) {
  id += 1;
  return {
    id,
    name,
    defaultHourlyQuote,
    notes
  }
}

const rows = [
  createData('פעילות #1'),
  createData('פעילות #2', 100),
  createData('פעילות #3', 100),
  createData('פעילות #4', 100),
  createData('פעילות #5', 100, 'בלה בלה'),
  createData('פעילות #6'),
  createData('פעילות #7'),
  createData('פעילות #8', 100),
  createData('פעילות #9'),
];

function SimpleTable(props) {
  const { classes } = props;

  return (
    <div>
      <Button variant="contained" color="primary">
        <AddIcon className={classes.newIcon}/>
        פעילות חדשה
      </Button>
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.bigCell}>פעילות</TableCell>
              <TableCell className={classes.smallCell} numeric>מחיר שעתי</TableCell>
              <TableCell className={classes.bigCell}>הערות</TableCell>
              <TableCell className={classes.smallCell}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              return (
                <TableRow key={row.id}>
                  <TableCell className={classes.bigCell} numeric>{row.name}</TableCell>
                  <TableCell className={classes.smallCell} numeric>{row.defaultHourlyQuote}</TableCell>
                  <TableCell className={classes.bigCell} numeric>{!row.edit ? row.notes : (
                    <FormControl>
                      <TextField className={classes.input} value={row.notes} />
                    </FormControl>
                  )}</TableCell>
                  <TableCell className={classes.smallCell}>
                    {(!row.edit) && <EditIcon /> }
                    {row.edit && <SaveIcon /> }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
}

SimpleTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);
