import React from 'react';
import Graph from '../graph/Graph';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../check_box/Check_Box';
import CustomInput from '../custom_input/CustomInput';

const NUM_LOADING_CHILDREN = 2;

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: this.props.text_lang.SEARCH.DEFAULT_SEARCH_KEYWORD,
			num_child_loaded: 0,
			is_button_pressed: false,
			to_add_plot: false,
			fund_set: new Set(),
			fund_list: [],
			info_list: [],
			indices_to_remove: [],
			min_days: 0,
			search_message: this.props.text_lang.SEARCH.DEFAULT_SEARCH_MSG,
			today: this.get_today(),
			stock_market: this.props.stock_market,
			text_lang: this.props.text_lang,
			graph_yield_values: [],
			search_checkbox: [
				{ key: 1, value: this.props.text_lang.SEARCH.IMITATING, isChecked: true },
				{ key: 2, value: this.props.text_lang.SEARCH.LEVERAGED, isChecked: true },
				{ key: 3, value: this.props.text_lang.SEARCH.SHORT, isChecked: true },
				{ key: 4, value: this.props.text_lang.SEARCH.STOCKS, isChecked: false },
			],
			search_all: true,
		};
		this.clearSearch = this.clearSearch.bind(this);
		this.setStateAsync = this.setStateAsync.bind(this);
		this.finish_loading = this.finish_loading.bind(this);
		this.RemoveRowFromGraphHandler = this.RemoveRowFromGraphHandler.bind(this);
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
		let min_days;
		let imitating = this.state.search_checkbox[0]['isChecked'];
		let leveraged = this.state.search_checkbox[1]['isChecked'];
		let short = this.state.search_checkbox[2]['isChecked'];
		let normal_stock = this.state.search_checkbox[3]['isChecked'];
		this.setState({ search_message: this.state.text_lang.SEARCH.IN_PROGRESS });
		this.setState({ num_child_loaded: 0 });
		this.setState({ is_button_pressed: true });

		let prev_size = this.state.fund_set.size;
		let search_res = await this.state.stock_market.search(
			this.state.search_keyword,
			this.state.fund_set,
			imitating,
			leveraged,
			short,
			normal_stock,
			this.state.today
		);

		if (this.state.fund_set.size === prev_size && this.state.to_add_plot) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.NO_NEW_FUND_TO_ADD,
			});
			this.setState({ num_child_loaded: 0 });
			this.setState({ is_button_pressed: false });
			return;
		}

		if (search_res === -1) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.NO_RESULT_KEY_WORDS,
			});
			this.setState({ is_button_pressed: false });
			return;
		} else {
			min_days = search_res[0];
			new_fund_list = search_res[1];
			new_info_list = search_res[2];
		}

		if (new_info_list.length === 0) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.NO_RESULTS_FOR_FILTERS,
			});
			this.setState({ is_button_pressed: false });
			return;
		}
		if (new_info_list.length > 45) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.TO_MANY_RESULTS,
			});
			this.setState({ is_button_pressed: false });
			return;
		}

		this.setState({ info_list: new_info_list });
		this.setState({ fund_list: new_fund_list });
		this.setState({ min_days: min_days });
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve);
		});
	}

	async clearSearch() {
		await this.setStateAsync({ fund_set: new Set() });
		this.setState({ graph_yield_values: [] });
		this.state.fund_list.splice(0, this.state.fund_list.length);
		this.state.info_list.splice(0, this.state.info_list.length);
		this.setState({ to_add_plot: false });
		this.search();
	}

	addSearch = () => {
		this.setState({ to_add_plot: true });
		this.search();
	};

	handleInputChange = (e) => {
		const content = e.target.value;
		this.setState({ search_keyword: content });
	};

	graphHandler = (yield_values) => {
		this.setState({ to_add_plot: false });
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
		this.setState({ indices_to_remove: [] });
		this.setState({ graph_yield_values: yield_values });
		this.finish_loading();
	};

	tableHandler = () => {
		this.setState({ num_child_loaded: this.state.num_child_loaded + 1 });
		this.finish_loading();
	};

	finish_loading() {
		if (this.state.num_child_loaded === NUM_LOADING_CHILDREN) {
			this.setState({ is_button_pressed: false });
		}
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

	remove_state_incdices(array_name, array_to_delete_from, indices) {
		let reverse_indices = indices.reverse();
		let array;
		array = [...array_to_delete_from];

		reverse_indices.forEach((i) => {
			array.splice(i, 1);
		});
		indices.reverse(); // reverse back
		this.setStateAsync({ [array_name]: array });
	}

	async RemoveRowFromGraphHandler(ids_to_remove, indices_to_remove) {
		let p_json;
		this.state.fund_set.forEach((point) => {
			p_json = JSON.parse(point);
			if (ids_to_remove.includes(p_json.id)) {
				this.state.fund_set.delete(point);
			}
		});
		this.setStateAsync({ indices_to_remove: indices_to_remove });

		this.remove_state_incdices('fund_list', this.state.fund_list, indices_to_remove);
		this.remove_state_incdices('info_list', this.state.fund_list, indices_to_remove);
	}

	render() {
		let loading = (
			<form>
				<h1>{this.state.text_lang.SEARCH.LOADING}</h1>
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
					{this.state.text_lang.SEARCH.CHOSE_REMOVE_ALL}{' '}
					<input
						style={{ display: 'inline-block', textAlign: this.state.text_lang.LANG_DIRECTION }}
						type="checkbox"
						checked={this.state.search_all}
						onClick={this.checkBoxHandleAllChecked}
						value="checkedall"
						onChange={(e) => {}}
					/>
					<ul
						style={{
							textAlign: this.state.text_lang.LANG_DIRECTION,
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
				</form>
				<div>
					<CustomInput
						onNewSearch={this.clearSearch}
						onAddToGraphClick={this.addSearch}
						langDirection={this.state.text_lang.LANG_DIRECTION}
						value={this.state.search_keyword}
						onChange={this.handleInputChange}
					/>
				</div>

				{loading}
				<div
					style={{
						marginBottom: 10,
					}}
				>
					<Graph
						today={this.state.today}
						funds={this.state.info_list}
						min_days={this.state.min_days}
						graphHandler={this.graphHandler}
						to_add_plot={this.state.to_add_plot}
						stock_market={this.state.stock_market}
						num_child_loaded={this.state.num_child_loaded}
						text_lang={this.state.text_lang}
						indices_to_remove={this.state.indices_to_remove}
					/>
				</div>
				<Info
					funds={this.state.fund_list}
					info={this.state.info_list}
					tableHandler={this.tableHandler}
					to_add_plot={this.state.to_add_plot}
					stock_market={this.state.stock_market}
					text_lang={this.state.text_lang}
					graph_yield_values={this.state.graph_yield_values}
					RemoveRowFromGraphHandler={this.RemoveRowFromGraphHandler}
					indices_to_remove={this.state.indices_to_remove}
				/>
			</div>
		);
	}
}
export default Search;
