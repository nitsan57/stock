import React from 'react';
import Graph from '../graph/Graph';
import Information from '../info-json';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: 'תא 35',
			num_child_loaded: 0,
			is_button_pressed: false,
			to_add_plot: false,
			result: [],
			funds: [],
			data: Information,
			search_message: 'Search Fund:',
		};
		this.handleInputChange = this.handleInputChange.bind(this);
		this.clearSearch = this.clearSearch.bind(this);
		this.addSearch = this.addSearch.bind(this);
		this.graphHandler = this.graphHandler.bind(this);
		this.tableHandler = this.tableHandler.bind(this);
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
		this.setState({
			result: filteredData,
		});
		var funds = [];
		var temp_fund = null;
		filteredData.forEach((item) => {
			temp_fund = { name: item['שם'], id: item['מס\' ני"ע'] };
			funds.push(temp_fund);
		});
		if (funds.length === 0) {
			this.setState({ search_message: 'No funds found try other keyword' });
		} else {
			this.setState({ search_message: 'Search results:' });
		}
		this.setState({ funds: funds });
	}

	clearSearch() {
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

	render() {
		var first_date = '23/04/2020';
		var last_date = '23/09/2020';
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
			// style={{
			// 	display: 'flex',
			// 	justifyContent: 'center',
			// 	alignItems: 'center',
			// }}
			>
				<form>
					<h4>{this.state.search_message}</h4>
					<input value={this.state.search_keyword} onChange={this.handleInputChange} />
				</form>
				<button onClick={this.clearSearch}>new plot!</button>
				<button onClick={this.addSearch}> add plot!</button>

				{loading}
				<div>
					<Graph
						first_date={first_date}
						last_date={last_date}
						funds={this.state.funds}
						graphHandler={this.graphHandler}
						is_button_pressed={this.state.is_button_pressed}
						to_add_plot={this.state.to_add_plot}
					/>
					<Info funds={this.state.funds} tableHandler={this.tableHandler} />
				</div>
			</div>
		);
	}
}
export default Search;
