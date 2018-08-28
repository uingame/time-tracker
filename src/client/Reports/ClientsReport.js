import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import Paper from '@material-ui/core/Paper';

import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 700
  },
  cell: {
    fontSize: '1.25rem',
    textAlign: 'right'
  },
  footerCell: {
    fontSize: '1.25rem',
    textAlign: 'right',
    paddingRight: 56
  },
  input: {
    fontSize: '1.25rem'
  },
  filter: {
    marginTop: theme.spacing.unit * 1.5,
    marginLeft: theme.spacing.unit * 1.5
  },
  tableTitle : {
    marginTop: theme.spacing.unit * 3
  }
});

let id = 0;
function createData(day, startTime, endTime, duration, user, activity, notes, edit) {
  id += 1;
  const weekDay = (day+2)%7
  const weekDayString = weekDay === 0 ? 'ראשון' :
    weekDay === 1 ? 'שני' :
    weekDay === 2 ? 'שלישי' :
    weekDay === 3 ? 'רביעי' :
    weekDay === 4 ? 'חמישי' :
    weekDay === 5 ? 'שישי' :
    weekDay === 6 ? 'שבת' : undefined
  return { id, day, weekDay, weekDayString, startTime, endTime, duration, user, activity, notes};
}

const rows = [
  createData(6, '12:00', '13:30', 3, 'עובד #1', 'פעילות #1'),
  createData(undefined , '14:00', '16:30', 1, 'עובד #2', 'פעילות #2'),
  createData(8, '12:00', '13:30', 3, 'עובד #1', 'פעילות #1', ''),
];

function SimpleTable(props) {
  const { classes } = props;

  return (
    <div>
      <div>
        <FormControl className={classes.filter}>
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
        <FormControl className={classes.filter}>
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
        <Button variant="outlined">ייצוא לCSV</Button>
      </div>
      <Typography className={classes.tableTitle} variant="title" gutterBottom>
        בית ספר #1
      </Typography>
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell} numeric>יום</TableCell>
              <TableCell className={classes.cell}>יום בשבוע</TableCell>
              <TableCell className={classes.cell} numeric>זמן התחלה</TableCell>
              <TableCell className={classes.cell} numeric>זמן סיום</TableCell>
              <TableCell className={classes.cell} numeric>מס שעות</TableCell>
              <TableCell className={classes.cell}>עובד</TableCell>
              <TableCell className={classes.cell}>פעילות</TableCell>
              <TableCell className={classes.cell}>הערות</TableCell>
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
                  <TableCell className={classes.cell}>{row.user}</TableCell>
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
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className={classes.cell}>
                סה״כ
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell className={classes.footerCell} numeric>
                7
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
      <Typography className={classes.tableTitle} variant="title" gutterBottom>
        בית ספר #2
      </Typography>
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell} numeric>יום</TableCell>
              <TableCell className={classes.cell}>יום בשבוע</TableCell>
              <TableCell className={classes.cell} numeric>זמן התחלה</TableCell>
              <TableCell className={classes.cell} numeric>זמן סיום</TableCell>
              <TableCell className={classes.cell} numeric>מס שעות</TableCell>
              <TableCell className={classes.cell}>עובד</TableCell>
              <TableCell className={classes.cell}>פעילות</TableCell>
              <TableCell className={classes.cell}>הערות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              return (
                <TableRow key={row.id}>
                  <TableCell className={classes.cell} numeric>{row.day}</TableCell>
                  <TableCell className={classes.cell}>{row.weekDayString}</TableCell>
                  <TableCell className={classes.cell} numeric>{row.startTime}</TableCell>
                  <TableCell className={classes.cell} numeric>{row.endTime}</TableCell>
                  <TableCell className={classes.cell} numeric>{row.duration}</TableCell>
                  <TableCell className={classes.cell}>{row.user}</TableCell>
                  <TableCell className={classes.cell}>{row.activity}</TableCell>
                  <TableCell className={classes.cell}>{row.notes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className={classes.cell}>
                סה״כ
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell className={classes.footerCell} numeric>
                7
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
              <TableCell>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    </div>
  );
}

SimpleTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);
