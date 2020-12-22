import React from 'react';
import Graph from '../graph/Graph';
import Information from '../info-json';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../Check_Box/Check_Box';
import { fetch_data } from '../Utils';

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword:               'תא 35',
			num_child_loaded:              0,
			is_button_pressed:             false,
			to_add_plot:                   false,
			info:                          [],
			result:                        [],
			fund_set:                      new Set(),
			fund_list:                     [],
			data:                          Information,
			search_message:                'Search Fund:',
			today:                         this.get_today(),
			search_checkbox:               [
				                               { id: 1, value: 'קרן מחקה', isChecked: true },
				                               { id: 2, value: 'אסטרטגית', isChecked: true },
			                               ],
			search_all:                    true,
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.clearSearch = this.clearSearch.bind(this);
		this.addSearch = this.addSearch.bind(this);
		this.graphHandler = this.graphHandler.bind(this);
		this.tableHandler = this.tableHandler.bind(this);
	}

	contains = (target, patterns) => {
		//TODO need to think how to filter data good
		let target_array = Object.values(target);
		let i,
			k = 0;
		for (i = 0; i < target_array.length; i++) {
			for (k = 0; k < patterns.length; k++) {
				if (String(target_array[i]).includes(String(patterns[i]))) {
					return true;
				}
			}
		}
		return false;
	};

	is_fund_passive = (fund) => {
		let passive_pattern = ['מח', 'מחקה'];
		return this.contains(fund, passive_pattern);
	};

	is_fund_leveraged = (fund) => {
		let leveraged_pattern = ['ממונפ'];
		return this.contains(fund, leveraged_pattern);
	};

	filterDataByCheckBox = (filteredData) => {
		let result = [];
		let i;
		for (i = 0; i < filteredData.length; i++) {
			if (
				(this.state.search_checkbox[0].isChecked && this.is_fund_passive(filteredData[i])) ||
				(this.state.search_checkbox[1].isChecked && this.is_fund_leveraged(filteredData[i]))
			) {
				result.push(filteredData[i]);
			}
		}
		return result;
	};

	get_today() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = yyyy + '-' + mm + '-' + dd;
		return today;
	}

	async search() {
		const filteredData = this.state.data.filter((item) => {
			var res = Object.keys(item).some((key) =>
				String(item[key]).toLowerCase().includes(this.state.search_keyword)
			);

			this.setState({ is_button_pressed: true });
			this.setState({ num_child_loaded: 0 });

			return res;
		});
		// Here we will fetch and get the info for each fund / etf 

	

		var url = '';
		var fund_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId=';
		var etf_url = 'https://mayaapi.tase.co.il/api/etf/details?fundId=';
		var securty_url = 'https://api.tase.co.il/api/company/securitydata?securityId=';
		var fund_id = '';

		let k;
		let all_results = [];
		for (k = 0; k < filteredData.length; k++) {
			fund_id = String(filteredData[k]['Id']);

			if (fund_id[0] === '5') {
				url = fund_url + fund_id;
			} else if (fund_id.slice(0, 3) === '115') {
				url = securty_url + fund_id;
			} else {
				url = etf_url + fund_id;
			}
			all_results.push(fetch_data('GET', url, '', 'application/x-www-form-urlencoded'));
		}
		console.log("111111", all_results)
		all_results = await Promise.allSettled(all_results); // to wait one time only
		
		console.log("2222", all_results)
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
			fund_data = JSON.parse(all_results[k]['value']);
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
			daily_yield = mutual_data['DayYield'];
			price = mutual_data['UnitValuePrice'];
			std = mutual_data['StandardDeviation'];

			relevant_info = {
				name: filteredData[k]['Name'],
				id: filteredData[k]['Id'],
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
		
	





		var res = this.filterDataByCheckBox(filteredData);
		console.log('Check box filter ', res);

		this.setState({
			result: filteredData,
		});
		var temp_fund = null;
		let funds_arr = [];
		filteredData.forEach((item) => {
			temp_fund = { name: item['Name'], id: item['Id'] };
			this.state.fund_set.add(JSON.stringify(temp_fund));
		});
		if (filteredData.length === 0) {
			this.setState({ search_message: 'No funds found try other keyword' });
		} else if (filteredData.length > 45) {
			this.setState({ search_message: 'Too many funds found please search more specifically' });
		} else {
			this.setState({ search_message: 'Search results:' });
            
			for (var it = this.state.fund_set.values(), val = null; (val = it.next().value); ) {
				funds_arr.push(JSON.parse(val));
			}
			this.setState({ fund_list: funds_arr });
			console.log("33333",funds_arr )
		}

		this.setState({ is_button_pressed: true });
	}

	clearSearch() {
		this.setState({ fund_set: new Set() });
		this.state.fund_list.splice(0, this.state.fund_list.length);
		this.setState({ to_add_plot: false });
		this.search();
	}

	addSearch() {
		this.setState({ to_add_plot: true });
		this.search();
	}

	handleInputChange(e) {
		const content = e.target.value;
		this.setState({ search_keyword: content });
	}

	graphHandler() {
		this.setState({ is_button_pressed: false });
		this.setState({ to_add_plot: false });
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
	}

	tableHandler() {
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
	}

	checkBoxHandleAllChecked = (event) => {
		let options = this.state.search_checkbox;
		options.forEach((option) => (option.isChecked = event.target.checked));
		this.setState({ search_checkbox: options });
		this.setState({ search_all: !this.state.search_all });
	};

	handleCheckChieldElement = (event) => {
		let options = this.state.search_checkbox;
		options.forEach((option) => {
			if (option.value === event.target.value) option.isChecked = event.target.checked;
		});
		this.setState({ search_checkbox: options });
	};

	render() {
		console.log("4444",this.state.fund_list )
		console.log("555", this.state.num_child_loaded)
		let loading = (
			<form>
				<h1>Loading...</h1>
				<Loader type="Oval" color="#00BFFF" height={100} width={100} />
			</form>
		);
		if (this.state.num_child_loaded === 2 || !this.state.is_button_pressed) {
			loading = null;
		}

		return (
			<div
				style={{
					textAlign: 'center',
				}}
			>
				<form
					style={{
						marginLeft: 0,
						marginRight: 0,
						marginTop: 10,
						marginBottom: 10,
						paddingLeft: 0,
						paddingRight: 0,
					}}
				>
					<h4>{this.state.search_message}</h4>
					<input
						// style={{ display: 'inline-block' }}
						type="checkbox"
						onClick={this.checkBoxHandleAllChecked}
						value="checkedall"
						checked={this.state.search_all}
					/>{' '}
					בחר \ הסר הכל
					<ul>
						{this.state.search_checkbox.map((option) => {
							return <CheckBox handleCheckChieldElement={this.handleCheckChieldElement} {...option} />;
						})}
					</ul>
					<input value={this.state.search_keyword} onChange={this.handleInputChange} />
				</form>
				<div
					style={{
						marginBottom: 10,
					}}
				>
					<Button
						style={{
							marginLeft: 0,
							marginRight: 10,
							paddingLeft: 10,
							paddingRight: 10,
						}}
						variant="primary"
						size="sm"
						onClick={this.clearSearch}
					>
						New comparison
					</Button>
					<Button variant="primary" size="sm" onClick={this.addSearch}>
						Add to current comparison
					</Button>
				</div>
				{loading}
				<div
					style={{
						marginBottom: 20,
					}}
				>
					<Graph
						today={this.state.today}
						funds={this.state.fund_list}
						graphHandler={this.graphHandler}
						is_button_pressed={this.state.is_button_pressed}
						to_add_plot={this.state.to_add_plot}
					/>
				</div>
				{/* <Info
					funds={this.state.fund_list}
					tableHandler={this.tableHandler}
					is_button_pressed={this.state.is_button_pressed}
					to_add_plot={this.state.to_add_plot}
				/> */}
			</div>
		);
	}
}
export default Search;
