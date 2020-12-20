import React from 'react';
import { DataGrid } from '@material-ui/data-grid';

const columns = [
	{
		field: 'mfee',
		headerName: 'דמי ניהול',
		width: 170,
		align: 'left',
	},
	{
		field: 'lfee',
		headerName: 'דמי נאמנות',
		width: 170,
		align: 'left',
	},
	{
		field: 'dfee',
		headerName: 'עמלת הפצה',
		width: 170,
		align: 'left',
	},
	{ field: 'fnum', headerName: 'מספר קרן', width: 100 },
	{ field: 'name', headerName: 'שם', align: 'left', width: 170 },
];

function createData(name, fnum, mfee, lfee, dfee, index) {
	if (!fnum) fnum = 0;
	if (!mfee) mfee = 0;
	if (!lfee) lfee = 0;
	if (!dfee) dfee = 0;

	return { name, fnum, mfee, lfee, dfee, id: index + 1 };
}

class Fund_Display extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 0,
			rowsPerPage: 10,
			currentrows: [],
			is_data_loaded: null,
		};
	}

	componentDidMount() {
		this.setState({ currentrows: [] });
		let i;
		const rows = [];
		for (i = 0; i < this.props.info.length; i++) {
			rows.push(
				createData(
					this.props.info[i]['name'],
					this.props.info[i]['id'],
					this.props.info[i]['managment_fee'],
					this.props.info[i]['var_fee'],
					this.props.info[i]['truste_fee'],
					i
				)
			);
		}
		this.setState({ currentrows: rows });
	}

	componentDidUpdate(prevProps) {
		if (this.props.info !== prevProps.info) {
			this.setState({ currentrows: [] });
			let i;
			const rows = [];
			for (i = 0; i < this.props.info.length; i++) {
				rows.push(
					createData(
						this.props.info[i]['name'],
						this.props.info[i]['id'],
						this.props.info[i]['managment_fee'],
						this.props.info[i]['var_fee'],
						this.props.info[i]['truste_fee'],
						i
					)
				);
			}
			this.setState({ currentrows: rows });
		}
	}

	render() {
		console.log(this.state.currentrows);
		console.log(columns);
		if (this.props.info.length !== 0) {
			return (
				<div style={{ height: 440, width: '100%' }}>
					<DataGrid checkboxSelection rows={this.state.currentrows} columns={columns} />
				</div>
			);
		} else {
			return null;
		}
	}
}
export default Fund_Display;
