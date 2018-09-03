import React from 'react';
import {withRouter, Route, Link} from 'react-router-dom'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings'

const styles = {
  root: {
    flexGrow: 1,
    marginBottom: 20
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: -12,
    marginLeft: 20,
  },
};

const NavLink = ({ to, children, className, activeClassName, ...rest }) => (
  <Route
    path={typeof to === "object" ? to.pathname : to}
    children={({ location, match }) => {
      const isActive = !!match;
      return (
        <Link
          {...rest}
          className={isActive
            ? [className, activeClassName].filter(i => i).join(" ")
            : className
          }
          to={to}
        >
          {typeof children === 'function' ? children(isActive) : children}
        </Link>
      )
    }}
  />
)

const NavButton = ({to, children}) => (
  <NavLink to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
    {isActive => <Button color="inherit" variant={isActive ? 'outlined' : 'text'} style={{borderColor: 'red'}}>{children}</Button>}
  </NavLink>
)

const NavIcon = ({to, children}) => (
  <NavLink to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
    {isActive => children}
  </NavLink>
)

function ButtonAppBar(props) {
  const { classes, history: { push} } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>
            שמיר ייעוץ והדרכות
          </Typography>
          <NavButton to='/clientsreport'>דוח לקוחות</NavButton>
          <NavButton  to='/usersreport'>דוח עובדים</NavButton>
          <NavButton  to='/timereport'>דוח מפורט</NavButton>
          <NavIcon to='/settings'>
            <SettingsIcon style={{color: 'inherit'}}/>
          </NavIcon>
          {/* <NavButton  to='/timetracking'>דיווח שעות</NavButton> */}
          <NavButton  to='/login'>יציאה</NavButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ButtonAppBar));
