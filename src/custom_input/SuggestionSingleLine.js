import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Plus from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Button from 'react-bootstrap/Button';

export default function CustomInput(props) {
	const useStyles = makeStyles((theme) => ({
		root: {
			margin: 'auto',
			// padding: '2px 4px',
			display: 'flex',
			alignItems: 'center',
			width: '20%',
		},
		// input: {
		// 	marginLeft: theme.spacing(1),
		// 	flex: 1,
		// 	padding: 2,
		// 	textAlign: props.text_lang.LANG_DIRECTION,
		// 	align: props.text_lang.LANG_DIRECTION,
		// 	'& input': {
		// 		textAlign: props.text_lang.LANG_DIRECTION,
		// 	},
		// },
		iconButton: {
			padding: 2,
		},
		// divider: {
		// 	height: 28,
		// 	margin: 4,
		// },
	}));
	const classes = useStyles();

	return (
		<Paper
			component="div"
			className={classes.root}
			// variant="outlined"
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<Tooltip title={props.text_lang.SEARCH.ADD_TO_GRAPH}>
				<IconButton
					color="primary"
					className={classes.iconButton}
					aria-label="search"
					onMouseDown={() => props.search(props.index, true)}
				>
					<Plus />
				</IconButton>
			</Tooltip>
			<Divider className={classes.divider} orientation="vertical" />
			<Tooltip title={props.text_lang.SEARCH.NEW_SEARCH}>
				<Button
					size="sm"
					variant={props.variant}
					key={props.id}
					onMouseDown={() => props.search(props.index, false)}
				>
					{props.name}
				</Button>
			</Tooltip>
		</Paper>
	);
}
