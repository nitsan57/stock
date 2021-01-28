import * as React from 'react';
import { AppBar, Toolbar, IconButton, List, ListItem, ListItemText, Container, Hidden } from '@material-ui/core';
import { Home } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SideDrawer from '../side_drawer/SideDrawer';
import Button from 'react-bootstrap/Button';
import LanguageIcon from '@material-ui/icons/Language';

const useStyles = makeStyles({
	navDisplayFlex: {
		display: `flex`,
		justifyContent: `space-between`,
		marginLeft: 60,
	},

	linkText: {
		textDecoration: `none`,
		textTransform: `uppercase`,
		color: `white`,
	},

	navbarDisplayFlex: {
		display: `flex`,
		justifyContent: `space-between`,
	},
});

const Header = (props) => {
	const navLinks = [
		{ title: props.text_lang.NAV.SEARCH, path: `/` },
		{ title: props.text_lang.NAV.CONTACT, path: `/contact` },
		{ title: props.text_lang.NAV.FAQ, path: `/faq` },
	];
	const classes = useStyles();
	return (
		<AppBar position="static">
			<Toolbar>
				<Container maxWidth="lg" className={classes.navbarDisplayFlex}>
					<IconButton color="inherit" onClick={() => props.change_lang()}>
						<LanguageIcon />
						<h6>English/Hebrew</h6>
					</IconButton>
					<IconButton edge="start" color="inherit" aria-label="home">
						<Home fontSize="large" />
					</IconButton>

					<Hidden smDown>
						<List component="nav" aria-labelledby="main navigation" className={classes.navDisplayFlex}>
							{navLinks.map(({ title, path }) => (
								<a href={path} key={title} className={classes.linkText}>
									<ListItem button>
										<ListItemText primary={title} />
									</ListItem>
								</a>
							))}
						</List>
					</Hidden>
					<Hidden mdUp>
						<SideDrawer navLinks={navLinks} />
					</Hidden>
				</Container>
			</Toolbar>
		</AppBar>
	);
};
export default Header;
