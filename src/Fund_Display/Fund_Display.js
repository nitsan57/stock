import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import useDeepCompareEffect from 'use-deep-compare-effect';

const columns = [
	{
		id: 'population',
		label: 'דמי ניהול',
		minWidth: 170,
		align: 'left',
		format: (value) => value.toLocaleString('en-US'),
	},
	{
		id: 'size',
		label: 'דמי נאמנות',
		minWidth: 170,
		align: 'left',
		format: (value) => value.toLocaleString('en-US'),
	},
	{
		id: 'density',
		label: 'עמלת הפצה',
		minWidth: 170,
		align: 'left',
		format: (value) => value.toFixed(2),
	},
	{ id: 'code', label: 'מספר קרן', minWidth: 100 },
	{ id: 'name', label: 'שם', align: 'left', minWidth: 170 },
];

function createData(name, code, population, size, density) {
	if (!code) code = 0;
	if (!population) population = 0;
	if (!size) size = 0;
	if (!density) density = 0;
	return { name, code, population, size, density };
}

const useStyles = makeStyles({
	root: {
		width: '100%',
	},
	container: {
		maxHeight: 440,
	},
});

export default function Fund_Display(props) {
	const classes = useStyles();
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [currentrows, setRows] = React.useState([]);

	useDeepCompareEffect(() => {
		setRows(0);
		let i;
		console.log('info', props.info);
		console.log('page', page);
		console.log('rowperpage', rowsPerPage);
		console.log('currentrows', currentrows);
		const rows = [];
		for (i = 0; i < props.info.length; i++) {
			rows.push(
				createData(
					props.info[i]['name'],
					props.info[i]['id'],
					props.info[i]['managment_fee'],
					props.info[i]['var_fee'],
					props.info[i]['truste_fee']
				)
			);
		}
		setRows(rows);
	}, props.info);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(0);
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	return (
		<Paper className={classes.root}>
			<TableContainer className={classes.container}>
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
									{column.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{currentrows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
							return (
								<TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
									{columns.map((column) => {
										const value = row[column.id];
										return (
											<TableCell key={column.id} align={column.align}>
												{column.format && typeof value === 'number'
													? column.format(value)
													: value}
											</TableCell>
										);
									})}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component="div"
				count={currentrows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</Paper>
	);
}
