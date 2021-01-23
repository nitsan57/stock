import React from 'react';
import Graph from '../graph/Graph';
import Info from '../Info/Info';
import Loader from 'react-loader-spinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import CheckBox from '../check_box/Check_Box';
import CustomInput from '../custom_input/CustomInput';
import Suggestions from '../custom_input/Sugesstions';
import History from '../history/History';
import * as Consts from '../utils/Consts';

const NUM_LOADING_CHILDREN = 2;

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search_keyword: this.props.text_lang.SEARCH.DEFAULT_SEARCH_KEYWORD,
			auto_complete_res: [],
			num_child_loaded: 0,
			is_button_pressed: false,
			to_add_plot: false,
			fund_set: new Set(),
			info_set: new Set(),
			fund_list: [],
			temp_data: [[], []],
			suggeestion_list: [],
			info_list: [],
			incdices_list: [],
			indices_to_remove: [],
			search_message: this.props.text_lang.SEARCH.DEFAULT_SEARCH_MSG,
			today: this.get_today(),
			stock_market: this.props.stock_market,
			text_lang: this.props.text_lang,
			graph_yield_values: [],
			search_checkbox: [
				{ key: 1, value: this.props.text_lang.SEARCH.IMITATING, isChecked: true },
				{ key: 2, value: this.props.text_lang.SEARCH.LEVERAGED, isChecked: false },
				{ key: 3, value: this.props.text_lang.SEARCH.SHORT, isChecked: false },
				{ key: 4, value: this.props.text_lang.SEARCH.STOCKS, isChecked: false },
			],
			search_all: false,
			search_history: {},
		};
		this.clearSearch = this.clearSearch.bind(this);
		this.suggestion_index_search = this.suggestion_index_search.bind(this);
		this.hide_suggestions = this.hide_suggestions.bind(this);
		this.show_suggestions = this.show_suggestions.bind(this);
		this.suggestionHandler = this.suggestionHandler.bind(this);
		this.clearState = this.clearState.bind(this);
		this.setStateAsync = this.setStateAsync.bind(this);
		this.finish_loading = this.finish_loading.bind(this);
		this.RemoveRowFromGraphHandler = this.RemoveRowFromGraphHandler.bind(this);
	}

	get_today() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = yyyy + '-' + mm + '-' + dd;
		return today;
	}

	search_button_clicked(temp_fund_list, temp_info_list, to_add_plot) {
		if (temp_fund_list.length !== 0) {
			let new_info_list = [];
			let new_fund_list = [];
			let prev_size = this.state.info_set.size;

			temp_info_list.forEach((item) => {
				this.state.info_set.add(JSON.stringify(item));
			});

			temp_fund_list.forEach((item) => {
				this.state.fund_set.add(JSON.stringify(item));
			});

			if (this.state.info_set.size === prev_size && to_add_plot) {
				this.setState({
					search_message: this.state.text_lang.SEARCH.NO_NEW_FUND_TO_ADD,
				});
				return -1;
			}
			let item;
			for (var it = this.state.info_set.values(), val = null; (val = it.next().value); ) {
				item = JSON.parse(val);
				new_info_list.push(item);
			}

			for (var it = this.state.fund_set.values(), val = null; (val = it.next().value); ) {
				item = JSON.parse(val);
				new_fund_list.push(item);
			}

			this.setState({ search_message: this.state.text_lang.SEARCH.IN_PROGRESS });
			this.setState({ num_child_loaded: 0 });
			this.setState({ is_button_pressed: true });
			this.setState({ info_list: new_info_list });
			this.setState({ fund_list: new_fund_list });
			let old_history = this.state.search_history;
			old_history[this.state.search_keyword] = 0;
			this.setState({ search_history: old_history });
		}
	}

	async search(word) {
		let new_fund_list;
		let new_info_list;
		let imitating = this.state.search_checkbox[0]['isChecked'];
		let leveraged = this.state.search_checkbox[1]['isChecked'];
		let short = this.state.search_checkbox[2]['isChecked'];
		let normal_stock = this.state.search_checkbox[3]['isChecked'];

		let search_res = await this.state.stock_market.search(
			word,
			imitating,
			leveraged,
			short,
			normal_stock,
			this.state.today
		);

		if (search_res === -1) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.NO_RESULT_KEY_WORDS,
			});
			return -1;
		} else {
			new_fund_list = search_res[0];
			new_info_list = search_res[1];

			this.setState({
				search_message: this.state.text_lang.SEARCH.DEFAULT_SEARCH_MSG,
			});
		}

		if (new_info_list.length === 0) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.NO_RESULTS_FOR_FILTERS,
			});
			return -1;
		}
		if (new_info_list.length > Consts.NUM_SEARCH_ELEMENTS_LIMIT) {
			this.setState({
				search_message: this.state.text_lang.SEARCH.TO_MANY_RESULTS,
			});
			return -1;
		}
		return [new_fund_list, new_info_list];
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve);
		});
	}

	async clearState() {
		await this.setStateAsync({ info_set: new Set() });
		await this.setStateAsync({ fund_set: new Set() });
		this.setState({ graph_yield_values: [] });
		this.state.fund_list.splice(0, this.state.fund_list.length);
		this.state.info_list.splice(0, this.state.info_list.length);
		this.setState({ to_add_plot: false });
		this.setState({ search_history: {} });
	}

	async clearSearch() {
		let to_add_plot = false;
		await this.clearState();
		this.search_button_clicked(this.state.temp_data[0], this.state.temp_data[1], to_add_plot);
		this.hide_suggestions();
	}

	addSearch = () => {
		let to_add_plot = true;
		this.setState({ to_add_plot: to_add_plot });
		// this.setState({ search_keyword: '' });
		this.search_button_clicked(this.state.temp_data[0], this.state.temp_data[1], to_add_plot);
		this.hide_suggestions();
	};

	suggestion_index_search(content, to_add_plot) {
		this.setState({ search_keyword: content });
		if (to_add_plot) {
			this.input_helper(content, this.addSearch);
		} else {
			this.input_helper(content, this.clearSearch);
		}
	}

	async suggestionHandler(clicked_element, to_add_plot) {
		if (!to_add_plot) {
			await this.clearState();
		}
		this.setState({ search_keyword: this.state.temp_data[0][clicked_element]['Name'] });

		if (clicked_element === Consts.NUM_SEARCH_ELEMENTS_LIMIT_TO_SHOW) {
			this.search_button_clicked(this.state.temp_data[0], this.state.temp_data[1], to_add_plot);
		} else {
			this.search_button_clicked(
				[this.state.temp_data[0][clicked_element]],
				[this.state.temp_data[1][clicked_element]],
				to_add_plot
			);
		}
	}

	input_helper(content, callback) {
		let res = this.search(content);
		res.then((value) => {
			if (value !== -1) {
				this.setState({ suggeestion_list: value[1] });
				this.setState({ temp_data: value }, callback);
			} else {
				this.setState({ temp_data: [[], []] }, null);
				this.setState({ suggeestion_list: [] });
			}
		});
	}

	handleInputChange = (e) => {
		const content = e.target.value;
		let indices = this.state.stock_market.filter_indices(content);
		this.setState({ incdices_list: indices });
		this.setState({ search_keyword: content });
		this.input_helper(content, null);
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

	show_suggestions() {
		this.setState({ suggeestion_list: this.state.temp_data[1] });
	}

	hide_suggestions() {
		this.setState({ suggeestion_list: [] });
	}

	finish_loading() {
		if (this.state.num_child_loaded === NUM_LOADING_CHILDREN) {
			this.setState({ is_button_pressed: false });
			this.setState({ search_message: this.state.text_lang.SEARCH.RESULT_SEARCH_MSG });
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
		this.input_helper(this.state.search_keyword);
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
		this.state.info_set.forEach((point) => {
			p_json = JSON.parse(point);
			if (ids_to_remove.includes(p_json.id)) {
				this.state.info_set.delete(point);
			}
		});

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
			<div>
				<h1>{this.state.text_lang.SEARCH.LOADING}</h1>
				<Loader type="Oval" color="#00BFFF" height={100} width={100} />
			</div>
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
				<div
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
				</div>
				<div
					style={{
						marginBottom: 20,
					}}
					onFocus={this.show_suggestions}
					onBlur={this.hide_suggestions}
				>
					<CustomInput
						onNewSearch={this.clearSearch}
						onAddToGraphClick={this.addSearch}
						text_lang={this.state.text_lang}
						value={this.state.search_keyword}
						onChange={this.handleInputChange}
					/>
					<Suggestions
						specific_search={this.suggestionHandler}
						index_search={this.suggestion_index_search}
						results={this.state.suggeestion_list}
						text_lang={this.state.text_lang}
						stock_market={this.state.stock_market}
						indices={this.state.incdices_list}
					/>
				</div>
				<History search_history={this.state.search_history} />
				{loading}
				<div
					style={{
						marginBottom: 10,
					}}
				>
					<Graph
						today={this.state.today}
						funds={this.state.info_list}
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
