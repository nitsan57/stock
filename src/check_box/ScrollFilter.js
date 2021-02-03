import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
	button: {
		display: 'block',
		marginTop: theme.spacing(2),
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

export default function ControlledOpenSelect(props) {
	const classes = useStyles();
	const [filterManagment, setfilterManagment] = React.useState('');

	const handleChange = (event) => {
		setfilterManagment(event.target.value);
		props.managmentScrollFilterHandler(event.target.value);
	};

	return (
		<div style={{ maring: 'auto', justifyContent: 'center', display: 'flow' }}>
			<FormControl variant="outlined" className={classes.formControl}>
				<InputLabel
					style={{ color: 'blue', backgroundColor: 'white' }}
					variant="filled"
					id="demo-simple-select-outlined-label"
				>
					{props.text_lang.SCROLL_FILTER.MANAGMENT_FEE_FILTER}
				</InputLabel>
				<Select
					style={{ color: 'blue', backgroundColor: 'white' }}
					variant="standard"
					labelId="demo-simple"
					id="demo-simple-select-outlined"
					value={filterManagment}
					onChange={handleChange}
					label={props.text_lang.SCROLL_FILTER.MANAGMENT_FEE_FILTER}
				>
					<MenuItem value={10}>{props.text_lang.SCROLL_FILTER.NO_FILTER}</MenuItem>
					<MenuItem value={0.01}>0.01%</MenuItem>
					<MenuItem value={0.05}>0.05%</MenuItem>
					<MenuItem value={0.1}>0.1%</MenuItem>
					<MenuItem value={0.015}>0.15%</MenuItem>
					<MenuItem value={0.2}>0.2%</MenuItem>
					<MenuItem value={0.25}>0.25%</MenuItem>
					<MenuItem value={0.3}>0.3%</MenuItem>
					<MenuItem value={0.35}>0.35%</MenuItem>
				</Select>
			</FormControl>
		</div>
	);
}
