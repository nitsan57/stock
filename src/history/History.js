import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Badge from 'react-bootstrap/Badge';

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		// maxWidth: 360,
		backgroundColor: theme.palette.background.paper,
		position: 'relative',
		overflow: 'auto',
		maxHeight: 300,
		margin: 'auto',
	},
	listSection: {
		backgroundColor: 'inherit',
	},
	ul: {
		backgroundColor: 'inherit',
		padding: 0,
	},

	horizontal: {
		display: 'flex',
		justifyContent: 'center',
		padding: 3,
		margin: 'auto',
	},

	componnent: {
		padding: 3,
	},
}));

export default function History(props) {
	const classes = useStyles();
	let vals = props.search_history;
	return (
		<div className={classes.horizontal}>
			{Object.keys(vals).map((key, index) => (
				<p key={index} className={classes.componnent}>
					<Badge pill variant="primary" onClick={() => {}}>
						{key}
					</Badge>
				</p>
			))}
		</div>
	);
}
