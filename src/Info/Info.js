import React from 'react';
import FundDisplay from '../Fund_Display/Fund_Display';

class Info extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			is_data_loaded: false,
			info: [],
		};
	}

	async get_table_data() {
		let all_results = this.props.funds;
		let keep_info = this.props.info;
		let table_data = [];

		let fund_data;
		let etf_data;
		let mutual_data;

		let managment_fee;
		let var_fee;
		let truste_fee;
		let twelve_months;
		let year_yield;
		let month_yield;
		let daily_yield;
		let price;
		let std;

		let type;
		let subtype;
		let k = 0;

		for (k = 0; k < all_results.length; k++) {
			let relevant_info = {};
			type = keep_info[k]['type'];
			subtype = keep_info[k]['subtype'];

			fund_data = all_results[k];
			etf_data = fund_data['ETFDetails'];
			if (etf_data === undefined) {
				managment_fee = fund_data['ManagementFee'];
				mutual_data = fund_data;
			} else {
				mutual_data = etf_data['FundDetails'];
			}
			managment_fee = mutual_data['ManagementFee'];
			var_fee = mutual_data['VariableFee'];
			truste_fee = mutual_data['TrusteeFee'];
			twelve_months = mutual_data['Last12MonthYield'];
			year_yield = mutual_data['YearYield'];
			month_yield = mutual_data['MonthYield'];
			daily_yield = mutual_data['DayYield'];
			price = mutual_data['UnitValuePrice'];
			std = mutual_data['StandardDeviation'];
			// console.log('---------------------------');
			// console.log(type, subtype);
			// console.log(std, twelve_months, year_yield);

			if (type === '1' && subtype === '1') {
				managment_fee = 0;
				var_fee = 0;
				truste_fee = 0;
				twelve_months = mutual_data['Last12MonthYield'];
				year_yield = mutual_data['AnnualYield'];
				month_yield = mutual_data['MonthYield'];

				price = mutual_data['BaseRate'];
				std = mutual_data['StandardDeviation'];
				daily_yield = 'שינוי אחרון: ' + mutual_data['Change'];
			}

			relevant_info = {
				name: keep_info[k]['name'],
				id: keep_info[k]['id'],
				managment_fee: managment_fee,
				var_fee: var_fee,
				truste_fee: truste_fee,
				twelve_months: twelve_months,
				year_yield: year_yield,
				month_yield: month_yield,
				daily_yield: daily_yield,
				price: price,
				std: std,
			};

			if (this.state.info.some((e) => e.id === relevant_info['id'])) {
				// console.log('Some Error in info.js');
				continue;
			} else {
				table_data.push(relevant_info);
			}
		}
		this.setState({ info: table_data });
		this.setState({ is_data_loaded: true });
	}

	componentDidUpdate(prevProps) {
		if (this.props.funds !== prevProps.funds) {
			if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
				if (this.props.is_button_pressed && (this.props.funds.length === 0 || !this.props.to_add_plot)) {
					this.setState({ info: [] });
				}
			}
			this.get_table_data();
			this.props.tableHandler();
		}
	}

	render() {
		return (
			<div>
				<FundDisplay info={this.state.info} />
			</div>
		);
	}
}

export default Info;
