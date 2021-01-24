import React from 'react';
import Button from '@material-ui/core/Button';
import DataTable from 'react-data-table-component';
import SortIcon from '@material-ui/icons/ArrowDownward';
import { Hidden, responsiveFontSizes } from '@material-ui/core';

function ExpandableComponent({ data }) {
	console.log(data);
	return (
		<div>
			{' '}
			<h1> פרטי הקרן</h1>
			<div>
				{' '}
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> שם נ"ע: {data.name} </h4>{' '}
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> מספר נ"ע: {data.fnum} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> דמי ניהול: {data.mfee} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> דמי נאמנות: {data.lfee} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> דמי ניהול משתנים: {data.dfee} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> עלות כוללת: {data.overall} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> שונות: {data.std} </h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}> שער: {data.price} </h4>
			</div>
		</div>
	);
}

const customStyles = {
	rows: {
		style: {
			minHeight: '72px', // override the row height
		},
	},
	headCells: {
		style: {
			paddingLeft: '8px', // override the cell padding for head cells
			paddingRight: '8px',
		},
	},
	cells: {
		style: {
			paddingLeft: '8px', // override the cell padding for data cells
			paddingRight: '8px',
		},
	},
};

class FundDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			toggledClearRows: false,
			selected: [],
			currentrows: [],
			toggledClearRows: false,
			is_data_loaded: null,
			text_lang: this.props.text_lang,
			columns: [
				{
					sortable: true,
					selector: 'name',
					name: this.props.text_lang.TABLE.NAME_HEADER,
					align: 'right',
					cell: (row) => <div style={{ fontWeight: 100 }}>{row.name}</div>,
				},

				{
					sortable: true,
					selector: 'overall',
					name: this.props.text_lang.TABLE.OVERALL_MANAGMENT_FEE_HEADER,
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value + '%',
					right: true,
				},

				{
					sortable: true,
					selector: 'graph_yield_value',
					name: this.props.text_lang.TABLE.YIELD_HEADER,
					valueFormatter: (params) =>
						params.value == null
							? this.props.text_lang.TABLE.CALCULATING_DATA_CELL
							: params.value.toFixed(2) + '%',
					right: true,
				},
			],
		};
	}

	createData(name, fnum, mfee, lfee, dfee, price, std, graph_yield_value, index) {
		return {
			name,
			fnum,
			mfee,
			lfee,
			dfee,
			id: index + 1,
			overall: (lfee + mfee).toFixed(2),
			price,
			std,
			graph_yield_value,
		};
	}

	updateInfo = () => {
		let i;
		const rows = [];
		for (i = 0; i < this.props.info.length; i++) {
			rows.push(
				this.createData(
					this.props.info[i]['name'],
					this.props.info[i]['id'],
					this.props.info[i]['managment_fee'],
					this.props.info[i]['truste_fee'],
					this.props.info[i]['var_fee'],
					this.props.info[i]['price'],
					this.props.info[i]['std'],
					this.props.graph_yield_values[i] * 100,
					i
				)
			);
		}
		this.setState({ currentrows: rows });
	};

	update_from_graph(prevProps) {
		if (this.props.graph_yield_values !== prevProps.graph_yield_values) {
			let i;
			let currentrows = [...this.state.currentrows]; // create the copy of state array
			for (i = 0; i < currentrows.length; i++) {
				currentrows[i]['graph_yield_value'] = this.props.graph_yield_values[i] * 100;
			}
			this.setState({ currentrows }); //update the value
		}
	}

	componentDidMount() {}

	componentDidUpdate(prevProps) {
		this.update_from_graph(prevProps);
		if (this.props.info !== prevProps.info) {
			this.updateInfo();
		}
	}

	handleRowSelection = (row) => {
		this.setState({ selected: row });
	};

	handleClearRows = () => {
		this.setState({ toggledClearRows: !this.state.toggledClearRows });
	};
	cleanInfoTable = () => {
		if (this.state.selected != undefined) {
			let indexToRemove = [];
			let ids_to_remove = [];
			let i;
			for (i = 0; i < this.state.selected.selectedRows.length; i++) {
				let deletedFund = this.state.selected.selectedRows[i].id;
				if (deletedFund <= this.props.info.length) {
					indexToRemove.push(deletedFund - 1);
					ids_to_remove.push(this.props.info[deletedFund - 1].id);
				}
			}
			this.props.RemoveRowFromGraphHandler(ids_to_remove, indexToRemove);
			this.handleClearRows();
		}
	};

	render() {
		if (this.state.currentrows.length !== 0) {
			if (this.state.currentrows[0] !== undefined && !isNaN(this.state.currentrows[0]['graph_yield_value'])) {
				return (
					<div>
						<DataTable
							columns={this.state.columns}
							data={this.state.currentrows}
							defaultSortField="title"
							sortIcon={<SortIcon />}
							pagination
							selectableRows
							direction="rtl"
							dense
							expandableRows
							expandableRowsComponent={<ExpandableComponent />}
							customStyles={customStyles}
							striped
							selectableRowsHighlight
							onSelectedRowsChange={this.handleRowSelection}
							clearSelectedRows={this.state.toggledClearRows}
							customStyles={customStyles}
						/>
						<Button
							style={{
								marginRight: 10,
								marginTop: 100,
							}}
							variant="contained"
							color="primary"
							onClick={this.cleanInfoTable}
						>
							{this.state.text_lang.TABLE.DELETE_BUTTON}
						</Button>
					</div>
				);
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
}
export default FundDisplay;
