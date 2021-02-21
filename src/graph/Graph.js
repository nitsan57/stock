import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Ratio from 'react-ratio';

import 'rc-slider/assets/index.css';
import { Range } from 'rc-slider';
import Button from 'react-bootstrap/Button';

const Plot = createPlotlyComponent(Plotly);
class Graph extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			is_portrait: window.innerWidth < window.innerHeight,
			raw_data: [],
			instruments: [],
			graph_yield_values: [],
			data: [],
			xticks: [],
			dates: [],
			min_data_length: 0,
			graph_y_ticks_denominator: 10,
			slider_values: [0, 0],
			is_data_loaded: false,
			stock_market: this.props.stock_market,
			text_lang: this.props.text_lang,
		};
		this.create_graph_data = this.create_graph_data.bind(this);
		this.setStateAsync = this.setStateAsync.bind(this);
		this.range_change = this.range_change.bind(this);
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	create_graph_data(x, y, name) {
		return {
			x: x,
			y: y,
			type: 'scatter',
			mode: 'lines',
			name: name.substring(0, 20),
			hovertemplate: '%{y}%' + '<br>%{x}<br>',
			opacity: 1,
		};
	}

	componentDidMount() {
		this.updateWindowDimensions();
		window.addEventListener('resize', this.updateWindowDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}
	updateWindowDimensions() {
		this.setState({ is_portrait: window.innerWidth < window.innerHeight });
	}

	async get_intrument_list(today, instrument_list, to_add_plot) {
		var raw_data = this.state.raw_data;
		if (!to_add_plot) {
			await this.setStateAsync({ data: [] });
			await this.setStateAsync({ instruments: [] });
			raw_data = [];
			await this.setStateAsync({ raw_data: [] });
		}
		let current_len = this.state.instruments.length;
		let diff_len = instrument_list.length - this.state.instruments.length;
		let total_inst = this.state.instruments.concat(instrument_list.slice(current_len, current_len + diff_len));

		await this.get_intruments_data(today, total_inst, raw_data);
		this.setState({ instruments: total_inst });
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve);
		});
	}

	async prepare_data(raw_data) {
		var instrument_array_promise_val;
		var k;

		let all_instruments_array = [];
		let len;
		let len_array = [];

		for (k = 0; k < raw_data.length; k++) {
			instrument_array_promise_val = JSON.parse(raw_data[k]['value']);
			all_instruments_array.push(instrument_array_promise_val);
			len = this.state.stock_market.extract_chart_length(instrument_array_promise_val);
			len_array.push(len);
		}
		return [len_array, all_instruments_array];
	}

	async get_graph_data(raw_data_input, instruments, date_range) {
		let graph_yield_values = [];

		await Promise.allSettled(raw_data_input).then(async (raw_data) => {
			let len_array;
			let data_array;
			[len_array, data_array] = await this.prepare_data(raw_data);

			var max_data_length = 0;
			var min_data_length = 100000;
			var i;
			let indices = [];
			let max_index;
			let curr_len;
			for (i = 0; i < len_array.length; i++) {
				curr_len = len_array[i];

				if (max_data_length < curr_len) {
					max_data_length = curr_len;
					max_index = i;
				}
				if (min_data_length > curr_len) {
					min_data_length = curr_len;
				}
				indices.push(i);
			}
			indices.splice(max_index, 1);
			indices.unshift(max_index);
			this.setState({ min_data_length });

			var name;
			var x = [];
			var y = [];
			var res = [];

			let start_date = 0;
			if (date_range[1] !== 0) {
				start_date = max_data_length - date_range[1];
				max_data_length = max_data_length - date_range[0];
			}
			let max_y_val = -300;
			let graph_y_ticks_denominator = -300;

			indices.forEach((i, object_index) => {
				[x, y, name, max_y_val] = this.state.stock_market.extract_chart_point(
					x,
					y,
					instruments,
					data_array,
					max_data_length,
					start_date,
					i,
					object_index === 0
				);
				if (max_y_val > graph_y_ticks_denominator) {
					graph_y_ticks_denominator = max_y_val;
				}

				var temp_data = this.create_graph_data(x.slice(x.length - y.length, x.length - 1), y, name);
				res.push(temp_data);
				graph_yield_values.push(y[y.length - 1]);
			});
			let tmp = graph_yield_values[max_index];
			let to_switch = graph_yield_values[0];
			graph_yield_values[0] = tmp;
			graph_yield_values[max_index] = to_switch;

			graph_y_ticks_denominator = graph_y_ticks_denominator / 10;
			this.setState({ graph_y_ticks_denominator });

			let xticks = [];
			let mark_jump_const = Math.max(parseInt(x.length / 5), 1);
			let current_jump;
			let boundry = Math.min(5, x.length - 1);
			for (i = 0; i < boundry; i++) {
				current_jump = i * mark_jump_const;
				xticks.push(x[current_jump]);
			}
			xticks.push(x[x.length - 1]);
			this.setState({ xticks: xticks });

			this.setState({ data: res });
			if (date_range[1] === 0) {
				this.setState({ dates: x });
				this.setState({ slider_values: [0, x.length - 1] });
			}
		});

		this.setState({ graph_yield_values: graph_yield_values });
		this.props.graphHandler(graph_yield_values);
	}

	async get_intruments_data(today, instruments, raw_data) {
		this.state.stock_market.get_instrument_chart_data(today, instruments, raw_data);
		this.setState({ raw_data: raw_data });
		await this.get_graph_data(raw_data, instruments, [0, 0]);
	}

	remove_state_incdices(array_name, array_to_delete_from, indices) {
		let reverse_indices = indices.reverse();
		let array;
		array = [...array_to_delete_from];

		reverse_indices.forEach((i) => {
			array.splice(i, 1);
		});
		indices.reverse(); // reverse back

		this.setState({ [array_name]: array });
		return array;
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.is_portrait !== this.state.is_portrait) {
			return true;
		}
		if (nextState.text_lang !== this.state.text_lang) {
			return true;
		}

		if (nextState.slider_values !== this.state.slider_values) {
			return true;
		}
		if (nextState.data !== this.state.data) {
			return true;
		}
		if (nextState.is_data_loaded !== this.state.is_data_loaded) {
			return true;
		}

		if (nextProps.funds !== this.props.funds) {
			return true;
		} else {
			return false;
		}
		// }
	}

	async componentDidUpdate(prevProps) {
		// Typical usage (don't forget to compare props):
		if (this.props.funds.length !== prevProps.funds.length) {
			if (this.props.indices_to_remove.length !== 0) {
				this.remove_state_incdices('data', this.state.data, this.props.indices_to_remove);
				this.remove_state_incdices('raw_data', this.state.raw_data, this.props.indices_to_remove);
				this.remove_state_incdices('instruments', this.state.instruments, this.props.indices_to_remove);
				let res = this.remove_state_incdices(
					'graph_yield_values',
					this.state.graph_yield_values,
					this.props.indices_to_remove
				);

				this.props.graphHandler(res);
				return;
			}
			this.setState({ is_data_loaded: false });
			var today = this.props.today;
			var funds = this.props.funds;
			if (funds.length === 0) {
				// this.setState({ data: [] });
				this.setState({ is_data_loaded: false });
				this.props.graphHandler([]);
				return;
			}
			var to_add_plot = this.props.to_add_plot;
			await this.get_intrument_list(today, funds, to_add_plot);
			this.setState({ is_data_loaded: true });
		}
	}

	range_change(value) {
		let date_range_len = this.state.dates.length;
		if (value === 'week') {
			value = [Math.max(date_range_len - 5, 0), date_range_len];
			this.slider_change_val(value);
		} else if (value === 'month') {
			value = [Math.max(date_range_len - 22, 0), date_range_len];
			this.slider_change_val(value);
		} else if (value === 'year') {
			value = [Math.max(date_range_len - 250, 0), date_range_len]; //working days
			this.slider_change_val(value);
		} else if (value === 'all-time') {
			value = [0, date_range_len];
			this.slider_change_val(value);
		} else if (value === 'min_length') {
			value = [Math.max(date_range_len - this.state.min_data_length, 0), date_range_len];
			this.slider_change_val(value);
		}
		let raw_data = this.state.raw_data;
		this.get_graph_data(raw_data, this.state.instruments, value);
	}

	range_params(x_axis) {
		let marks = {};
		let i = 0;
		let mark_jump_const = parseInt(x_axis.length / 6);
		let current_jump;
		for (i = 0; i < 6; i++) {
			current_jump = i * mark_jump_const;
			marks[current_jump] = x_axis[current_jump];
		}
		marks[x_axis.length - 1] = x_axis[x_axis.length - 1];
		return {
			min: 0,
			max: x_axis.length - 1,
			marks: marks,
		};
	}

	slider_change_val = (slider_values) => {
		this.setState({ slider_values });
	};

	render() {
		if (this.state.data.length === 0) return null;

		if (this.state.is_data_loaded) {
			let range_params = this.range_params(this.state.dates); //for div , width: '80%'

			if (this.state.is_portrait) {
				return <div>{this.state.text_lang.SEARCH.PHONE_ROTATION_MESSAGE}</div>;
			}
			return (
				<div
					style={{
						width: '90%',
						margin: 'auto',
					}}
				>
					<Ratio ratio={5 / 2}>
						<Plot
							style={{ width: '100%', height: '100%' }}
							data={this.state.data}
							onHover={(e) => {
								let dragLayer = document.getElementsByClassName('nsewdrag')[0];
								dragLayer.style.cursor = 'pointer';
							}}
							onUnhover={(e) => {
								// let index = e['points'][0]['curveNumber'];
								// let temp_data = this.state.data; //.slice();
								// temp_data[index]['opacity'] = 0.5;
								// this.setState({ data: temp_data });
								// this.forceUpdate();
								let dragLayer = document.getElementsByClassName('nsewdrag')[0];
								dragLayer.style.cursor = '';
							}}
							config={{ displayModeBar: false }}
							layout={{
								hovermode: 'closest',
								margin: { t: 0, b: 30, l: 0, r: 0 },
								autosize: true,
								showlegend: true,

								legend: { orientation: 'h' },
								yaxis: {
									tickformat: ',.0%',
									automargin: true,
									tick0: 0,
									dtick: this.state.graph_y_ticks_denominator,
									ticklen: 4,
									tickwidth: 2,
									tickcolor: '#000',
								},
								xaxis: {
									tickmode: 'array',
									tick0: 0,
									tickvals: this.state.xticks,
									ticklen: 4,
									tickwidth: 2,
									tickcolor: '#000',
									automargin: true,
								},
								displayModeBar: false,
								responsive: true,
							}}
							useResizeHandler={true}
						/>
					</Ratio>

					<Range
						style={{
							marginTop: 10,
							marginBottom: 30,
						}}
						min={range_params.min}
						max={range_params.max}
						marks={range_params.marks}
						onChange={this.slider_change_val}
						value={this.state.slider_values}
						onAfterChange={this.range_change}
					/>
					<Button
						style={{
							marginRight: 10,
						}}
						variant="primary"
						size="sm"
						onClick={() => this.range_change('min_length')}
					>
						{this.state.text_lang.GRAPH.MINIMAL_TIME}
					</Button>
					<Button
						style={{
							marginRight: 10,
						}}
						variant="primary"
						size="sm"
						onClick={() => this.range_change('week')}
					>
						{this.state.text_lang.GRAPH.WEEK_BUTTON}
					</Button>
					<Button
						style={{
							marginRight: 10,
						}}
						variant="primary"
						size="sm"
						onClick={() => this.range_change('month')}
					>
						{this.state.text_lang.GRAPH.MONTH_BUTTON}
					</Button>
					<Button
						style={{
							marginRight: 10,
						}}
						variant="primary"
						size="sm"
						onClick={() => this.range_change('year')}
					>
						{this.state.text_lang.GRAPH.YEAR_BUTTON}
					</Button>
					<Button variant="primary" size="sm" onClick={() => this.range_change('all-time')}>
						{this.state.text_lang.GRAPH.ALL_TIME_BUTTON}
					</Button>
				</div>
			);
		} else {
			return null;
		}
	}
}
export default Graph;
