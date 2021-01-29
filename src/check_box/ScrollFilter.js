import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
	button: {
		// justifyContent: 'center',
		// margin: 'auto',
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
	const [open, setOpen] = React.useState(false);

	const handleChange = (event) => {
		setfilterManagment(event.target.value);
		props.managmentScrollFilterHandler(event.target.value);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleOpen = () => {
		setOpen(true);
	};

	return (
		<div>
			<InputLabel style={{ margin: 'auto' }} id="demo-controlled-open-select-label">
				{props.text_lang.SCROLL_FILTER.MANAGMENT_FEE_FILTER}
			</InputLabel>
			<FormControl className={classes.formControl}>
				{/* <InputLabel style={{ margin: 'auto' }} id="demo-controlled-open-select-label">
					{props.text_lang.SCROLL_FILTER.MANAGMENT_FEE_FILTER}
				</InputLabel> */}
				<Select
					labelId="demo-controlled-open-select-label"
					id="demo-controlled-open-select"
					open={open}
					onClose={handleClose}
					onOpen={handleOpen}
					value={filterManagment}
					onChange={handleChange}
				>
					<MenuItem value={10}>no filter</MenuItem>
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
