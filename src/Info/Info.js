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
		var fund_id = '';

		let k;
		let all_results = [];
		for (k = 0; k < this.props.funds.length; k++) {
			fund_id = String(this.props.funds[k]['id']);
			if (fund_id[0] == '5') {
				url = fund_url + fund_id;
			} else {
				url = etf_url + fund_id;
			}
			// console.log('fetch_fund: url:', url);
			all_results.push(fetch_data('GET', url, '', 'application/x-www-form-urlencoded'));
		}
		all_results = await Promise.allSettled(all_results); // to wait one time only

		let fund_data;
		let etf_data;

		let managment_fee;
		let var_fee;
		let truste_fee;

		for (k = 0; k < all_results.length; k++) {
			let relevant_info = {};
			fund_data = JSON.parse(all_results[k]['value']);
			etf_data = fund_data['ETFDetails'];
			if (etf_data === undefined) {
				managment_fee = fund_data['ManagementFee'];
				var_fee = fund_data['VariableFee'];
				truste_fee = fund_data['TrusteeFee'];
			} else {
				managment_fee = etf_data['FundDetails']['ManagementFee'];
				var_fee = etf_data['FundDetails']['VariableFee'];
				truste_fee = etf_data['FundDetails']['TrusteeFee'];
			}
			relevant_info = {
				name: this.props.funds[k]['name'],
				id: this.props.funds[k]['id'],
				managment_fee: managment_fee,
				var_fee: var_fee,
				truste_fee: truste_fee,
			};
			if(this.state.info.some(e => e.id == relevant_info["id"])) {
				continue
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
			if (this.props.is_button_pressed) {
			this.setState({info:[]})
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
