import React from 'react';
import { fetch_data } from '../Utils';
import Fund_Display from '../Fund_Display/Fund_Display';

class Info extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			is_data_loaded: false,
			info: [],
		};
	}

	async fetch_fund() {
		var url = '';
		var fund_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId=';
		var etf_url = 'https://mayaapi.tase.co.il/api/etf/details?fundId=';
		var securty_url = 'https://api.tase.co.il/api/company/securitydata?securityId=';
		var fund_id = '';

		let k;
		let all_results = [];
		for (k = 0; k < this.props.funds.length; k++) {
			fund_id = String(this.props.funds[k]['id']);
			if (fund_id[0] === '5') {
				url = fund_url + fund_id;
			} else if (fund_id.slice(0, 3) === '115') {
				url = securty_url + fund_id;
			} else {
				url = etf_url + fund_id;
			}
			all_results.push(fetch_data('GET', url, '', 'application/x-www-form-urlencoded'));
		}
		
		all_results = await Promise.allSettled(all_results); // to wait one time only
		console.log("@#############################",all_results)
		let fund_data;
		let etf_data;
		let mutual_data;

		let managment_fee;
		let var_fee;
		let truste_fee;
		let twelve_months;
		let year_yield;
		let daily_yield;
		let price;
		let std;

		for (k = 0; k < all_results.length; k++) {
			let relevant_info = {};
			console.log(all_results);
			fund_data = JSON.parse(all_results[k]['value']);
			etf_data = fund_data['ETFDetails'];
			console.log(fund_data);
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
			daily_yield = mutual_data['DayYield'];
			price = mutual_data['UnitValuePrice'];
			std = mutual_data['StandardDeviation'];

			relevant_info = {
				name: this.props.funds[k]['name'],
				id: this.props.funds[k]['id'],
				managment_fee: managment_fee,
				var_fee: var_fee,
				truste_fee: truste_fee,
				twelve_months: twelve_months,
				year_yield: year_yield,
				daily_yield: daily_yield,
				price: price,
				std: std,
			};
			if (this.state.info.some((e) => e.id == relevant_info['id'])) {
				continue;
			} else {
				this.setState((prevState) => ({
					info: [...prevState.info, relevant_info],
				}));
			}
		}
		this.setState({ is_data_loaded: true });
	}

	componentDidUpdate(prevProps) {
		if (this.props.funds !== prevProps.funds) {
			this.fetch_fund();
			this.props.tableHandler();
		}
		if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
			if (this.props.is_button_pressed && (this.props.funds.length === 0 || !this.props.to_add_plot)) {
				this.setState({ info: [] });
			}
		}
	}

	render() {
		if (this.state.is_data_loaded) {
			return (
				<div>
					<Fund_Display info={this.state.info} />
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}

export default Info;
