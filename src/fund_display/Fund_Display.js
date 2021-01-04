import React from 'react';
import { DataGrid } from '@material-ui/data-grid';

class FundDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentrows: [],
			is_data_loaded: null,
			text_lang: this.props.text_lang,
			columns: [
				{
					field: 'graph_yield_value',
					headerName: this.props.text_lang.TABLE.YIELD_HEADER,
					width: 180,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.CALCULATING_DATA_CELL : params.value + '%',
				},
				{
					field: 'std',
					headerName: this.props.text_lang.TABLE.STD,
					width: 75,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value,
				},
				{
					field: 'overall',
					headerName: this.props.text_lang.TABLE.OVERALL_MANAGMENT_FEE_HEADER,
					width: 140,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value + '%',
				},
				{
					field: 'mfee',
					headerName: this.props.text_lang.TABLE.MANAGMENT_FEE_HEADER,
					width: 100,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value + '%',
				},
				{
					field: 'lfee',
					headerName: this.props.text_lang.TABLE.TRUST_FEE_HEADER,
					width: 100,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value + '%',
				},
				{
					field: 'dfee',
					headerName: this.props.text_lang.TABLE.MANAGMENT_VAR_FEE_HEADER,
					width: 150,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value + '%',
				},
				{
					field: 'price',
					headerName: this.props.text_lang.TABLE.PRICE_HEADER,
					width: 95,
					align: 'center',
					valueFormatter: (params) =>
						params.value == null ? this.props.text_lang.TABLE.NO_DATA_HEADER : params.value,
				},
				{
					field: 'fnum',
					headerName: this.props.text_lang.TABLE.FUND_NUMBER_HEADER,
					align: 'center',
					width: 100,
				},
				{
					field: 'name',
					headerName: this.props.text_lang.TABLE.NAME_HEADER,
					align: 'right',
					width: 240,
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

	componentDidMount() {}

	componentDidUpdate(prevProps) {
		if (this.props.graph_yield_values !== prevProps.graph_yield_values) {
			let i;
			let currentrows = [...this.state.currentrows]; // create the copy of state array
			for (i = 0; i < this.props.info.length; i++) {
				currentrows[i]['graph_yield_value'] = (this.props.graph_yield_values[i] * 100).toFixed(2);
			}
			this.setState({ currentrows }); //update the value
		}
		if (this.props.info !== prevProps.info) {
			this.setState({ currentrows: [] });
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
						this.props.graph_yield_values[i],
						i
					)
				);
			}
			this.setState({ currentrows: rows });
		}
	}

	render() {
		if (this.state.currentrows.length !== 0) {
			return (
				<div style={{ height: 440, width: '100%' }}>
					<DataGrid
						// checkboxSelection
						showColumnRightBorder={true}
						showCellRightBorder={true}
						rtlEnabled={true}
						pageSize={10}
						rowsPerPageOptions={[10, 20, 45]}
						rows={this.state.currentrows}
						columns={this.state.columns}
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}
export default FundDisplay;