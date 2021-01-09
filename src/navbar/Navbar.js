import * as React from 'react';
import { AppBar, Toolbar, IconButton, List, ListItem, ListItemText, Container, Hidden } from '@material-ui/core';
import { Home } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SideDrawer from '../side_drawer/SideDrawer';

const navLinks = [
	{ title: `חפש`, path: `/` },
	{ title: `צור קשר`, path: `/contact` },
	{ title: `שאלות ותשובות`, path: `/faq` },
];

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

const Header = () => {
	const classes = useStyles();
	return (
		<AppBar position="static">
			<Toolbar>
				<Container maxWidth="md" className={classes.navbarDisplayFlex}>
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
