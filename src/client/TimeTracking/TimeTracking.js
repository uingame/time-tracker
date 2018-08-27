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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right'
  },
  input: {
    fontSize: '1.25rem'
  },
  monthSelection: {
    marginTop: theme.spacing.unit * 1.5
  }
});

let id = 0;
function createData(day, startTime, endTime, duration, client, activity, notes, edit) {
  id += 1;
  const weekDay = (day+2)%7
  const weekDayString = weekDay === 0 ? 'ראשון' :
    weekDay === 1 ? 'שני' :
    weekDay === 2 ? 'שלישי' :
    weekDay === 3 ? 'רביעי' :
    weekDay === 4 ? 'חמישי' :
    weekDay === 5 ? 'שישי' :
    weekDay === 6 ? 'שבת' : undefined
  return { id, day, weekDay, weekDayString, startTime, endTime, duration, client, activity, notes, edit};
}

const rows = [
  createData(1),
  createData(2),
  createData(3),
  createData(4),
  createData(5),
  createData(6, '12:00', '13:30', 3, 'בית ספר #1', 'פעילות #1'),
  createData(undefined , '14:00', '16:30', 1, 'בית ספר #1', 'פעילות #2'),
  createData(7),
  createData(8, '12:00', '13:30', 3, 'בית ספר #1', 'פעילות #1', '', true),
  createData(9),
  createData(10),
  createData(11),
  createData(12),
  createData(13),
  createData(14),
  createData(15),
  createData(16),
  createData(17),
  createData(18),
  createData(19),
  createData(20),
  createData(21),
  createData(22),
  createData(23),
  createData(24),
  createData(25),
  createData(26),
  createData(27),
  createData(28),
  createData(29),
  createData(30),
  createData(31)
];

function SimpleTable(props) {
  const { classes } = props;

  return (
    <div>
      <FormControl className={classes.monthSelection}>
        <Select
          className={classes.input}
          value={10}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>אוגוסט 2018</MenuItem>
          <MenuItem value={20}>יולי 2018</MenuItem>
        </Select>
      </FormControl>
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell} numeric>יום</TableCell>
              <TableCell className={classes.cell}>יום בשבוע</TableCell>
              <TableCell className={classes.cell} numeric>זמן התחלה</TableCell>
              <TableCell className={classes.cell} numeric>זמן סיום</TableCell>
              <TableCell className={classes.cell} numeric>מס שעות</TableCell>
              <TableCell className={classes.cell}>לקוח</TableCell>
              <TableCell className={classes.cell}>פעילות</TableCell>
              <TableCell className={classes.cell}>הערות</TableCell>
              <TableCell className={classes.cell}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              return (
                <TableRow key={row.id}>
                  <TableCell className={classes.cell} numeric>{row.day}</TableCell>
                  <TableCell className={classes.cell}>{row.weekDayString}</TableCell>
                  <TableCell className={classes.cell} numeric>{!row.edit ? row.startTime : (
                    <FormControl>
                      <Input className={classes.input} value={row.startTime} />
                    </FormControl>
                  )}</TableCell>
                  <TableCell className={classes.cell} numeric>{!row.edit ? row.endTime : (
                    <FormControl>
                      <Input className={classes.input} value={row.endTime} />
                    </FormControl>
                  )}
                  </TableCell>
                  <TableCell className={classes.cell} numeric>{!row.edit ? row.duration : (
                    <FormControl>
                      <Input className={classes.input} value={row.duration} />
                    </FormControl>
                  )}
                  </TableCell>
                  <TableCell className={classes.cell}>{!row.edit ? row.client : (
                    <FormControl>
                      <Select
                        className={classes.input}
                        value={10}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>בית ספר #1</MenuItem>
                        <MenuItem value={20}>בית ספר #2</MenuItem>
                      </Select>
                    </FormControl>
                  )}</TableCell>
                  <TableCell className={classes.cell}>{!row.edit ? row.activity : (
                    <FormControl>
                      <Select
                        className={classes.input}
                        value={20}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>פעילות #1</MenuItem>
                        <MenuItem value={20}>פעילות #2</MenuItem>
                      </Select>
                    </FormControl>
                  )}</TableCell>
                  <TableCell className={classes.cell}>{!row.edit ? row.notes : (
                    <FormControl>
                      <Input className={classes.input} value={row.notes} />
                    </FormControl>
                  )}</TableCell>
                  <TableCell className={classes.cell}>
                    {(!row.edit && row.startTime) && <EditIcon /> }
                    {(!row.edit && !row.startTime || !row.day) && <AddIcon /> }
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
