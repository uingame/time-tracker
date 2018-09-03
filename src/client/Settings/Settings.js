import React from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import { Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
  cssLabel: {
    left: 'unset',
    direction: 'rtl',
    transformOrigin: 'top right'
  },
  margin: {
    // width: '100%',
    padding: theme.spacing.unit * 2
  },
  formInput: {
    marginTop: 'unset !important'
  },
  title: {
    padding: theme.spacing.unit * 2,
  },
  selectIcon: {
    left: 0,
    right: 'unset'
  },
  selectText: {
    paddingRight: 'unset',
    paddingLeft: 32
  },
  table: {
    padding: theme.spacing.unit * 2
  },
  cell: {
    textAlign: 'right'
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
};

const TextBox = withStyles(styles)(({classes, title, value}) => (
  <FormControl className={classes.margin} fullWidth={true}>
    <InputLabel
      FormLabelClasses={{
        root: classes.cssLabel
      }}
      htmlFor="custom-css-input"
    >
      {title}
    </InputLabel>
    <Input
      classes={{
        root: classes.formInput
      }}
      id="custom-css-input"
      defaultValue={value}
    />
  </FormControl>
))

const Settings = ({classes}) => (
  <Grid container spacing={24}>
    <Grid item xs={4}>
      <TextBox title='חיפוש'/>
      <Paper>
        <List>
          <ListItem button>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #1" />
          </ListItem>
          <ListItem>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #2" />
          </ListItem>
          <ListItem button>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #3" />
          </ListItem>
          <ListItem>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #4" />
          </ListItem>
          <ListItem button>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #5" />
          </ListItem>
          <ListItem>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #6" />
          </ListItem>
          <ListItem button>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #7" />
          </ListItem>
          <ListItem>
            <ListItemText style={{textAlign: 'right'}} primary="עובד #8" />
          </ListItem>
        </List>
      </Paper>
    </Grid>
    <Grid item xs={8}>
      <Paper>
        <Grid container direction='column'>
          <Grid item>
            <Typography className={classes.title} variant='title'>
              פרטי עובד
            </Typography>
          </Grid>
          <Grid container>
            <Grid item xs={3}>
              <TextBox title='מספר עובד' value="123" />
            </Grid>
            <Grid item xs={3}>
              <TextBox title='ת.ז.' value='123456789' />
            </Grid>
            <Grid item xs={3}>
              <TextBox title='תאריך תחילת עבודה' value="1/04/2018" />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox checked={true} value="gilad" />
                }
                label="מנהל"
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              <TextBox title='שם פרטי' value='גלעד' />
            </Grid>
            <Grid item xs={6}>
              <TextBox title='שם משפחה' value = 'שמיר'/>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              <TextBox title='כתובת' value='הדרור 4 יבנה'/>
            </Grid>
            <Grid item xs={6}>
              <TextBox title='email' value='uingame@uingame.co.il'/>
            </Grid>
          </Grid>
          <Grid item>
            <hr style={{margin: '0 10 0 10'}}/>
          </Grid>
          <Grid item>
            <Typography className={classes.title} variant='title'>
              שכר
            </Typography>
          </Grid>
          <Grid container>
            <Grid item xs={2}>
              <TextBox title='סוג עובד' value='עצמאי' />
            </Grid>
            <Grid item xs={2}>
              <TextBox title='תעריף שעתי' value='123' />
            </Grid>
            <Grid item xs={2}>
              <TextBox title='תעריף נסיעות' value='123' />
            </Grid>
          </Grid>
          <Grid item>
            <hr style={{margin: '0 10 0 10'}}/>
          </Grid>
          <Grid item>
            <Typography className={classes.title} variant='title'>
              הרשאות
            </Typography>
          </Grid>
          <Grid item>
            <FormControl className={classes.margin} fullWidth={true}>
              <InputLabel
                FormLabelClasses={{
                  root: classes.cssLabel
                }}
                htmlFor="select-multiple-checkbox"
              >
                בתי ספר
              </InputLabel>
              <Select
                multiple
                value={['בית ספר #1', 'בית ספר #2']}
                input={<Input classes={{
                  root: classes.formInput
                }} id="select-multiple-checkbox" />}
                renderValue={selected => selected.join(', ')}
                MenuProps={MenuProps}
                classes={{
                  icon: classes.selectIcon,
                  select: classes.selectText
                }}
              >
                <MenuItem value={'בית ספר #1'}>
                  <Checkbox checked={true} />
                  <ListItemText primary={'בית ספר #1'} />
                </MenuItem>
                <MenuItem value={'בית ספר #2'}>
                  <Checkbox checked={true} />
                  <ListItemText primary={'בית ספר #2'} />
                </MenuItem>
                <MenuItem value={'בית ספר #3'}>
                  <Checkbox checked={false} />
                  <ListItemText primary={'בית ספר #3'} />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.cell}>בית ספר</TableCell>
                  <TableCell className={classes.cell}>פעילות</TableCell>
                  <TableCell className={classes.cell} numeric>מורשה</TableCell>
                  <TableCell className={classes.cell} numeric>סוג עובד</TableCell>
                  <TableCell className={classes.cell} numeric>תעריף שעתי</TableCell>
                  <TableCell className={classes.cell} numeric>תעריף נסיעות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className={classes.cell}>בית ספר #1</TableCell>
                  <TableCell className={classes.cell}>פעילות #1</TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Checkbox checked={true} value="gilad" />
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.cell}></TableCell>
                  <TableCell className={classes.cell}>פעילות #2</TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Checkbox checked={false} value="gilad" />
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.cell}>בית ספר #2</TableCell>
                  <TableCell className={classes.cell}>פעילות #1</TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Checkbox checked={true} value="gilad" />
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                  <TableCell className={classes.cell} numeric>
                    <Input/>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  </Grid>
)

export default withStyles(styles)(Settings)
