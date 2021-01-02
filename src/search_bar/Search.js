import React from 'react';
import Graph from '../graph/Graph';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../Check_Box/Check_Box';
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
			search_message: 'חפש',
			today: this.get_today(),
			stock_market: this.props.stock_market,
			search_checkbox: [
				{ key: 1, value: this.props.text_lang.IMITATING, isChecked: true },
				{ key: 2, value: this.props.text_lang.LEVERAGED, isChecked: true },
				{ key: 3, value: this.props.text_lang.SHORT, isChecked: true },
				{ key: 4, value: this.props.text_lang.STOCKS, isChecked: false },
			],
			search_all: true,
		};
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

	async search() {
		let new_fund_list;
		let new_info_list;
		let imitating = this.state.search_checkbox[2]['isChecked'];
		let leveraged = this.state.search_checkbox[2]['isChecked'];
		let short = this.state.search_checkbox[2]['isChecked'];
		let normal_stock = this.state.search_checkbox[2]['isChecked'];

		let search_res = await this.state.stock_market.search(
			this.state.search_keyword,
			this.state.fund_set,
			imitating,
			leveraged,
			short,
			normal_stock
		);
		this.setState({ search_message: this.props.text_lang.IN_PROGRESS });

		if (search_res === -1) {
			this.setState({ search_message: this.props.text_lang.NO_RESULT_KEY_WORDS });
			return;
		} else {
			new_fund_list = search_res[0];
			new_info_list = search_res[1];
		}

		if (new_info_list.length === 0) {
			this.setState({
				search_message: this.props.text_lang.NO_RESULTS_FOR_FILTERS,
			});
			return;
		}
		if (new_info_list.length > 45) {
			this.setState({
				search_message: this.props.text_lang.TO_MANY_RESULTS,
			});
			return;
		}

		this.setState({ info_list: new_info_list });
		this.setState({ fund_list: new_fund_list });
		this.setState({ is_button_pressed: true });
		this.setState({ num_child_loaded: 0 });
	}

	clearSearch = () => {
		this.setState({ fund_set: new Set() });
		this.state.fund_list.splice(0, this.state.fund_list.length);
		this.setState({ to_add_plot: false });
		this.search();
	};

	addSearch = () => {
		this.setState({ to_add_plot: true });
		this.search();
	};

	handleInputChange = (e) => {
		const content = e.target.value;
		this.setState({ search_keyword: content });
	};

	graphHandler = () => {
		this.setState({ is_button_pressed: false });
		this.setState({ to_add_plot: false });
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
	};

	tableHandler = () => {
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
	};

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
				<h1>{this.props.text_lang.LOADING}</h1>
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
					width: '100%',
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
					{this.props.text_lang.CHOSE_REMOVE_ALL}{' '}
					<input
						style={{ display: 'inline-block', textAlign: 'right' }}
						type="checkbox"
						checked={this.state.search_all}
						onClick={this.checkBoxHandleAllChecked}
						value="checkedall"
						onChange={(e) => {}}
					/>
					<ul
						style={{
							textAlign: 'right',
							paddingRight: '47%',
							width: '100%',
							justifyContent: 'space-between',
						}}
					>
						{this.state.search_checkbox.map((option) => {
							return (
								<CheckBox
									handleCheckChieldElement={this.handleCheckChieldElement}
									idkey={option.key}
									{...option}
								/>
							);
						})}
					</ul>
					<input
						style={{ textAlign: 'right' }}
						value={this.state.search_keyword}
						onChange={this.handleInputChange}
					/>
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
						{this.props.text_lang.NEW_SEARCH}
					</Button>
					<Button variant="primary" size="sm" onClick={this.addSearch}>
						{this.props.text_lang.ADD_TO_GRAPH}
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
						stock_market={this.state.stock_market}
					/>
				</div>
				<Info
					funds={this.state.fund_list}
					info={this.state.info_list}
					tableHandler={this.tableHandler}
					is_button_pressed={this.state.is_button_pressed}
					to_add_plot={this.state.to_add_plot}
					stock_market={this.state.stock_market}
				/>
			</div>
		);
	}
}
export default Search;
