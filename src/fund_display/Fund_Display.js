import React from 'react';
import Button from '@material-ui/core/Button';
import DataTable from 'react-data-table-component';
import SortIcon from '@material-ui/icons/ArrowDownward';

function ExpandableComponent({ data }) {
	let lang = data['lang'];
	return (
		<div>
			{' '}
			<h1> פרטי הקרן</h1>
			<div>
				{' '}
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.NAME_HEADER}: {data.name}{' '}
				</h4>{' '}
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.FUND_NUMBER_HEADER}: {data.fnum}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.MANAGMENT_FEE_HEADER}: {data.mfee}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.TRUST_FEE_HEADER}: {data.lfee}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.MANAGMENT_VAR_FEE_HEADER}: {data.dfee}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.OVERALL_MANAGMENT_FEE_HEADER}: {data.overall}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.STD}: {data.std}{' '}
				</h4>
				<h4 style={{ textAlign: 'right', fontSize: 12 }}>
					{' '}
					{lang.TABLE.PRICE_HEADER}: {data.price}{' '}
				</h4>
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
					cell: (row) => (
						<div>
							<div style={{ fontWeight: 100 }}>{row.overall}</div>
						</div>
					),
					right: true,
				},

				{
					sortable: true,
					selector: 'graph_yield_value',
					name: this.props.text_lang.TABLE.YIELD_HEADER,
					cell: (row) => (
						<div style={{ fontWeight: 100 }}>
							{row.graph_yield_value == null
								? this.props.text_lang.TABLE.CALCULATING_DATA_CELL
								: row.graph_yield_value.toFixed(2) + '%'}
						</div>
					),
					valueFormatter: (params) =>
						params.value == null
							? this.props.text_lang.TABLE.CALCULATING_DATA_CELL
							: params.value.toFixed(2) + '%',
					right: true,
				},
			],
		};
	}

	createData(name, fnum, mfee, lfee, dfee, price, std, graph_yield_value, index, lang) {
		let overall = mfee == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : mfee + lfee;
		mfee = mfee == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : mfee;
		lfee = lfee == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : lfee;
		dfee = dfee == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : dfee;
		price = price == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : price;
		std = std == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : std;
		return {
			name,
			fnum,
			mfee,
			lfee,
			dfee,
			id: index + 1,
			overall: overall,
			price,
			std,
			graph_yield_value,
			lang,
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
					i,
					this.state.text_lang
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
			this.setState({ columns: [...this.state.columns] }); //update the value
			this.setState({ currentrows: currentrows }); //update the value
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
							paginationPerPage={20}
							paginationRowsPerPageOptions={[20, 40, 60]}
							selectableRows
							direction={this.state.text_lang.TABLE.DIRECTION}
							dense
							expandableRows
							expandableRowsComponent={<ExpandableComponent />}
							customStyles={customStyles}
							striped
							selectableRowsHighlight
							onSelectedRowsChange={this.handleRowSelection}
							clearSelectedRows={this.state.toggledClearRows}
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
