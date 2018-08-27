import React from 'react';
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: -12,
    marginLeft: 20,
  },
};

function ButtonAppBar(props) {
  const { classes, history: { push} } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton onClick={() => push('/')} className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="title" color="inherit" className={classes.flex}>
            שמיר ייעוץ והדרכות
          </Typography>
          <Button  onClick={() => push('/clientsreport')} color="inherit">דוח לקוחות</Button>
          <Button  onClick={() => push('/usersreport')} color="inherit">דוח עובדים</Button>
          <Button  onClick={() => push('/timereport')} color="inherit">דוח כולל</Button>
          <Button  onClick={() => push('/timetracking')} color="inherit">דיווח שעות</Button>
          <Button  onClick={() => push('/login')} color="inherit">יציאה</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ButtonAppBar));
