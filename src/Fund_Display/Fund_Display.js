import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
const no_data = 'לא זמין';
const columns = [
	{
		field: 'daily_yield',
		headerName: 'תשואה מיום קודם',
		width: 155,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'month_yield',
		headerName: 'תשואת חודש',
		width: 110,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'year_yield',
		headerName: 'תשואה שנתית ',
		width: 120,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'twelve_months',
		headerName: 'תשואת 12 חודשים',
		width: 140,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'std',
		headerName: 'שונות',
		width: 75,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value),
	},
	// {
	// 	field: 'year_u',
	// 	headerName: '',
	// 	width: 150,
	// 	align: 'center',
	// 	valueFormatter: (params) => params.value + '%',
	// },
	{
		field: 'overall',
		headerName: 'דמי ניהול משוקלל',
		width: 140,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'mfee',
		headerName: 'דמי ניהול',
		width: 100,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'lfee',
		headerName: 'דמי נאמנות',
		width: 100,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'dfee',
		headerName: 'דמי ניהול משתנים',
		width: 150,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value + '%'),
	},
	{
		field: 'price',
		headerName: 'שער',
		width: 95,
		align: 'center',
		valueFormatter: (params) => (params.value == null ? no_data : params.value),
	},
	{
		field: 'fnum',
		headerName: 'מספר קרן',
		align: 'center',
		width: 100,
	},
	{
		field: 'name',
		headerName: 'שם',
		align: 'right',
		width: 240,
	},
];

function createData(
	name,
	fnum,
	mfee,
	lfee,
	dfee,
	twelve_months,
	year_yield,
	month_yield,
	daily_yield,
	price,
	std,
	index
) {
	return {
		name,
		fnum,
		mfee,
		lfee,
		dfee,
		id: index + 1,
		overall: (lfee + mfee).toFixed(2),
		twelve_months,
		year_yield,
		month_yield,
		daily_yield,
		price,
		std,
	};
}

class FundDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentrows: [],
			is_data_loaded: null,
		};
	}

	componentDidMount() {}

	componentDidUpdate(prevProps) {
		// console.log(this.props.info);
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
						this.props.info[i]['truste_fee'],
						this.props.info[i]['var_fee'],
						this.props.info[i]['twelve_months'],
						this.props.info[i]['year_yield'],
						this.props.info[i]['month_yield'],
						this.props.info[i]['daily_yield'],
						this.props.info[i]['price'],
						this.props.info[i]['std'],
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
						columns={columns}
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}
export default FundDisplay;
