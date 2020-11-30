import React from 'react';
import Graph from '../graph/Graph';
import Information from '../info-json';

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: 'תא 35',
			is_data_loaded: false,
			is_button_pressed: false,
			to_add_plot: false,
			result: [],
			funds: [],
			data: Information,
		};
		this.handleInputChange = this.handleInputChange.bind(this);
		this.clearSearch = this.clearSearch.bind(this);
		this.addSearch = this.addSearch.bind(this);
		this.graphHandler = this.graphHandler.bind(this);
	}

	search() {
		const filteredData = this.state.data.filter((item) => {
			var res = Object.keys(item).some((key) =>
				String(item[key]).toLowerCase().includes(this.state.search_keyword)
			);
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
		this.setState({ funds: funds });
	}

	clearSearch() {
		this.setState({ to_add_plot: false });
		this.search();
		this.setState({ is_button_pressed: true });
	}

	addSearch() {
		console.log('addSearch: ', this.state.search_keyword);
		this.setState({ to_add_plot: true });
		this.search();
		this.setState({ is_button_pressed: true });
	}

	handleInputChange(e) {
		const content = e.target.value;
		this.setState({ search_keyword: content });
	}

	graphHandler() {
		this.setState({ is_button_pressed: false });
		this.setState({ to_add_plot: false });
		console.log('search graph hanlder');
		setTimeout(
			function () {
				//Start the timer
				this.forceUpdate(); //After 1 second, set render to true
			}.bind(this),
			3000
		);
	}

	render() {
		var first_date = '23/04/2020';
		var last_date = '23/09/2020';
		console.log('render was called in search');

		return (
			<div>
				<form>
					<input
						placeholder="Search for..."
						value={this.state.search_keyword}
						onChange={this.handleInputChange}
					/>
				</form>
				<button onClick={this.clearSearch}>new plot!</button>
				<button onClick={this.addSearch}> add plot!</button>
				<h1>Search</h1>

				<Graph
					first_date={first_date}
					last_date={last_date}
					funds={this.state.funds}
					graphHandler={this.graphHandler}
					is_button_pressed={this.state.is_button_pressed}
					to_add_plot={this.state.to_add_plot}
				/>
			</div>
		);
	}
}
export default Search;
