import React from 'react';
import Graph from '../graph/Graph';
import Information from '../info-json';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../Check_Box/Check_Box';

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: 'תא 35',
			num_child_loaded: 0,
			is_button_pressed: false,
			to_add_plot: false,
			result: [],
			fund_set: new Set(),
			fund_list: [],
			data: Information,
			search_message: 'Search Fund:',
			today: this.get_today(),
			search_checkbox: [
				{ id: 1, value: 'קרן מחקה', isChecked: true },
				{ id: 2, value: 'אסטרטגית', isChecked: true },
			],
		};
		this.handleInputChange = this.handleInputChange.bind(this);
		this.clearSearch = this.clearSearch.bind(this);
		this.addSearch = this.addSearch.bind(this);
		this.graphHandler = this.graphHandler.bind(this);
		this.tableHandler = this.tableHandler.bind(this);
	}

	get_today() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = yyyy + '-' + mm + '-' + dd;
		return today;
	}

	search() {
		const filteredData = this.state.data.filter((item) => {
			var res = Object.keys(item).some((key) =>
				String(item[key]).toLowerCase().includes(this.state.search_keyword)
			);

			this.setState({ is_button_pressed: true });
			this.setState({ num_child_loaded: 0 });

			return res;
		});
		console.log('Check box:', filteredData);
		this.setState({
			result: filteredData,
		});
		var temp_fund = null;
		let funds_arr = [];
		filteredData.forEach((item) => {
			temp_fund = { name: item['שם'], id: item['מס\' ני"ע'] };
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
		}
		// console.log('Funds:', this.state.fund_list);
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
	};

	handleCheckChieldElement = (event) => {
		let options = this.state.search_checkbox;
		options.forEach((option) => {
			if (option.value === event.target.value) option.isChecked = event.target.checked;
		});
		this.setState({ search_checkbox: options });
	};

	render() {
		// console.log('Funds:', this.state.fund_list);

		let loading = (
			<form>
				<h1>Loading...</h1>
				<Loader type="Oval" color="#00BFFF" height={100} width={100} />
			</form>
		);
		// console.log(this.state.num_child_loaded);
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
					/>{' '}
					בחר \ הסר הכל
					<ul>
						{this.state.search_checkbox.map((option) => {
							return <CheckBox handleCheckChieldElement={this.handleCheckChieldElement} {...option} />;
						})}
					</ul>
					<input value={this.state.search_keyword} onChange={this.handleInputChange} />
				</form>
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
				{loading}
				<Graph
					today={this.state.today}
					funds={this.state.fund_list}
					graphHandler={this.graphHandler}
					is_button_pressed={this.state.is_button_pressed}
					to_add_plot={this.state.to_add_plot}
				/>
				<Info
					funds={this.state.fund_list}
					tableHandler={this.tableHandler}
					is_button_pressed={this.state.is_button_pressed}
				/>
			</div>
		);
	}
}
export default Search;
