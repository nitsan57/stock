import React from 'react';
import Graph from '../graph/Graph';
import Information from '../info-json';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../Check_Box/Check_Box';
import { fetch_data } from '../Utils/Utils';
import * as Consts from '../Utils/Consts';

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: 'תא 35',
			num_child_loaded: 0,
			is_button_pressed: false,
			to_add_plot: false,
			fund_set: new Set(),
			fund_list: [],
			info_list: [],
			data: Information,
			search_message: 'חפש',
			today: this.get_today(),
			search_checkbox: [
				{ key: 1, value: 'קרן מחקה', isChecked: true },
				{ key: 2, value: 'ממונף', isChecked: true },
				{ key: 3, value: 'קרן חשיפה הפוכה', isChecked: true },
				{ key: 4, value: 'מניות', isChecked: false },
			],
			search_all: true,
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

	get_today() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = yyyy + '-' + mm + '-' + dd;
		return today;
	}

	async keep_relevant_data(funds) {
		var url = '';
		var fund_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId=';
		var etf_url = 'https://mayaapi.tase.co.il/api/etf/details?fundId=';
		var securty_url = 'https://api.tase.co.il/api/company/securitydata?securityId=';
		var fund_id = '';
		let type;
		let subtype;
		let subid;
		let keep_info = [];
		let k;
		let all_results = [];

		for (k = 0; k < funds.length; k++) {
			type = String(funds[k]['type']);
			subtype = String(funds[k]['subtype']);
			subid = String(funds[k]['SubId']);
			fund_id = String(funds[k]['id']);

			if (type === '5' || type === '7' || subtype === '991' || subtype === Consts.TYPE_ID.BOND) {
				continue;
			}
			if (fund_id[0] === '5') {
				url = fund_url + fund_id;
			} else if (subid === '001779' || (type === '1' && subtype === '1')) {
				url = securty_url + fund_id;
			} else {
				url = etf_url + fund_id;
			}

			keep_info.push({
				type: type,
				subtype: subtype,
				name: funds[k]['name'],
				id: funds[k]['id'],
			});
			all_results.push(fetch_data('GET', url, '', 'application/x-www-form-urlencoded'));
		}
		all_results = await Promise.allSettled(all_results);
		let fund_l = [];
		let i;
		for (i = 0; i < all_results.length; i++) {
			fund_l.push(JSON.parse(all_results[i].value));
		}
		return [fund_l, keep_info]; // to wait one time only
	}

	async search() {
		let fund_l;
		const filteredData = this.state.data.filter((item) => {
			var res = Object.keys(item).some((key) =>
				String(item[key]).toLowerCase().includes(this.state.search_keyword)
			);

			return res;
		});

		var temp_fund = null;
		let funds_arr = [];
		let keep_info = [];
		filteredData.forEach((item) => {
			temp_fund = { name: item['Name'], id: item['Id'], type: item['Type'], subtype: item['SubType'] };
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

			[fund_l, keep_info] = await this.keep_relevant_data(funds_arr);

			let new_fund_list = [];
			let new_info_list = [];
			let raw_ix = 0;
			let mutual_data;
			let etf_data;
			let fund_data;
			let type;
			let subtype;
			// let bond_fund;
			for (raw_ix = 0; raw_ix < fund_l.length; raw_ix++) {
				fund_data = fund_l[raw_ix];
				type = keep_info[raw_ix]['type'];
				subtype = keep_info[raw_ix]['subtype'];
				// bond_fund = String(fund_data['MagnaFundType']);
				if (
					(type === Consts.TYPE_ID.SECURITY && subtype !== Consts.SUB_TYPE_ID.STOCK) ||
					type === Consts.TYPE_ID.FUND // agah filter && bond_fund !== Consts.MAGNA_TYPE.BOND
				) {
					etf_data = fund_data['ETFDetails'];
					if (etf_data === undefined) {
						mutual_data = fund_data;
					} else {
						mutual_data = etf_data['FundDetails'];
					}
					if ( mutual_data['FundIndicators'][Consts.TASE_TYPES.SHORT]['Value']) { // short behaves differnet since it is leveraged
                        mutual_data['FundIndicators'][Consts.TASE_TYPES.LEVERAGED]['Value'] = false
					}

					if (
						(mutual_data['FundIndicators'][Consts.TASE_TYPES.IMITATING]['Value'] &&
							!this.state.search_checkbox[0]['isChecked']) ||
						(mutual_data['FundIndicators'][Consts.TASE_TYPES.LEVERAGED]['Value'] &&
							!this.state.search_checkbox[1]['isChecked']) ||
						(mutual_data['FundIndicators'][Consts.TASE_TYPES.SHORT]['Value'] &&
							!this.state.search_checkbox[2]['isChecked'])
					) {
						continue;
					}

					new_fund_list.push(fund_data);
					new_info_list.push(keep_info[raw_ix]);
				} else if (type === Consts.TYPE_ID.SECURITY && subtype === Consts.SUB_TYPE_ID.STOCK) {
					if (!this.state.search_checkbox[3]['isChecked']) {
						continue;
					}
					new_fund_list.push(fund_data);
					new_info_list.push(keep_info[raw_ix]);
				}
			}
			if (new_info_list.length === 0) {
				this.setState({ search_message: 'No funds found with given filters, try other filters' });
				return;
			}

			this.setState({ info_list: new_info_list });
			this.setState({ fund_list: new_fund_list });
			this.setState({ is_button_pressed: true });
			this.setState({ num_child_loaded: 0 });
		}
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
					width : '100%'
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
					בחר \ הסר הכל
					{' '}
					<input
						style={{ display: 'inline-block',
						textAlign: 'right', }}
						type="checkbox"
						checked={this.state.search_all}
						onClick={this.checkBoxHandleAllChecked}
						value="checkedall"
						onChange={(e) => {}}
					/>
					<ul style={{
						textAlign: 'right',
						paddingRight: "47%",
						width : '100%',
						justifyContent: 'space-between'}}>
						{this.state.search_checkbox.map((option) => {
							return <CheckBox  handleCheckChieldElement={this.handleCheckChieldElement} idkey={option.key} {...option} />; 
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
						funds={this.state.info_list}
						graphHandler={this.graphHandler}
						is_button_pressed={this.state.is_button_pressed}
						to_add_plot={this.state.to_add_plot}
					/>
				</div>
				<Info
					funds={this.state.fund_list}
					info={this.state.info_list}
					tableHandler={this.tableHandler}
					is_button_pressed={this.state.is_button_pressed}
					to_add_plot={this.state.to_add_plot}
				/>
			</div>
		);
	}
}
export default Search;
