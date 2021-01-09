import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Plus from '@material-ui/icons/Add';

export default function CustomInput(props) {
	const useStyles = makeStyles((theme) => ({
		root: {
			margin: 'auto',
			padding: '2px 4px',
			display: 'flex',
			alignItems: 'center',
			width: '60%',
		},
		input: {
			marginLeft: theme.spacing(1),
			flex: 1,
			padding: 10,
			textAlign: props.langDirection,
			align: props.langDirection,
			'& input': {
				textAlign: props.langDirection,
			},
		},
		iconButton: {
			padding: 10,
		},
		divider: {
			height: 28,
			margin: 4,
		},
	}));
	const classes = useStyles();
	let input = props.value;

	return (
		<Paper component="form" className={classes.root}>
			<IconButton
				color="primary"
				className={classes.iconButton}
				aria-label="search"
				onClick={props.onAddToGraphClick}
			>
				<Plus />
			</IconButton>

			<Divider className={classes.divider} orientation="vertical" />

			<IconButton className={classes.iconButton} aria-label="search" onClick={props.onNewSearch}>
				<SearchIcon />
			</IconButton>
			<InputBase
				className={classes.input}
				placeholder={input}
				onChange={props.onChange}
				inputProps={{ 'aria-label': input }}
				value={props.value}
			/>
		</Paper>
	);
}
