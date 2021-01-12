import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Badge from 'react-bootstrap/Badge';

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: theme.palette.background.paper,
		position: 'relative',
		overflow: 'auto',
		maxHeight: 300,
	},
	listSection: {
		backgroundColor: 'inherit',
	},
	ul: {
		backgroundColor: 'inherit',
		padding: 0,
	},
}));

export default function History(props) {
	let vals = props.search_history;
	return (
		<div>
			{Object.keys(vals).map((key, index) => (
				<p key={index}>
					<Badge pill variant="primary">
						{key}
					</Badge>
				</p>
			))}

			<div></div>
		</div>
	);
}
