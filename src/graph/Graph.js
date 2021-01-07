import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

import 'rc-slider/assets/index.css';
import { Range } from 'rc-slider';
import Button from 'react-bootstrap/Button';

const Plot = createPlotlyComponent(Plotly);
class Graph extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			raw_data: [],
			instruments: [],
			graph_yield_values: [],
			data: [],
			xticks: 5,
			dates: [],
			slider_values: [0, 0],
			is_data_loaded: null,
			stock_market: this.props.stock_market,
			text_lang: this.props.text_lang,
		};
		this.create_graph_data = this.create_graph_data.bind(this);
		this.setStateAsync = this.setStateAsync.bind(this);
		this.range_change = this.range_change.bind(this);
	}

	create_graph_data(x, y, name) {
		return {
			x: x,
			y: y,
			type: 'scatter',
			mode: 'lines',
			name: name,
			showlegend: true,
		};
	}

	componentDidMount() {}

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

			var min_data_length = 100000;
			var i;
			let curr_len;
			for (i = 0; i < len_array.length; i++) {
				curr_len = len_array[i];

				if (min_data_length > curr_len) {
					min_data_length = curr_len;
				}
			}
			var name;
			var x = [];
			var y = [];
			var res = [];

			let start_date = 0;
			if (date_range[1] !== 0) {
				start_date = min_data_length - date_range[1];
				min_data_length = min_data_length - date_range[0];
			}
			for (i = 0; i < data_array.length; i++) {
				[x, y, name] = this.state.stock_market.extract_chart_point(
					x,
					y,
					instruments,
					data_array,
					min_data_length,
					start_date,
					i,
					this.props.min_days
				);
				var temp_data = this.create_graph_data(x, y, name);
				res.push(temp_data);
				graph_yield_values.push(y[y.length - 1]);
			}

			let xticks = [];
			let mark_jump_const = Math.max(parseInt(x.length / 10), 1);
			let current_jump;
			let boundry = Math.min(10, x.length - 1);
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
		this.state.stock_market.get_instrument_chart_data(today, instruments, raw_data, this.props.min_days);
		this.setState({ raw_data: raw_data });
		await this.get_graph_data(raw_data, instruments, [0, 0]);
	}

	async componentDidUpdate(prevProps) {
		// Typical usage (don't forget to compare props):

		if (this.props.funds.length !== prevProps.funds.length) {
			if (this.props.indices_to_remove.length !== 0) {
				const _ = require('lodash');
				_.pullAt(this.state.data, this.props.indices_to_remove);
				_.pullAt(this.state.raw_data, this.props.indices_to_remove);
				_.pullAt(this.state.instruments, this.props.indices_to_remove);
				_.pullAt(this.state.graph_yield_values, this.props.indices_to_remove);
				this.props.graphHandler(this.state.graph_yield_values);
				return;
			}
			this.setState({ is_data_loaded: false });
			var today = this.props.today;
			var funds = this.props.funds;
			if (funds.length === 0) {
				this.setState({ is_data_loaded: null });
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
		}
		let raw_data = this.state.raw_data;
		this.get_graph_data(raw_data, this.state.instruments, value);
	}

	range_params(x_axis) {
		let marks = {};
		let i = 0;
		let mark_jump_const = parseInt(x_axis.length / 10);
		let current_jump;
		for (i = 0; i < 10; i++) {
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
		if (this.state.is_data_loaded == null) {
			return null;
		}
		if (this.state.is_data_loaded) {
			let range_params = this.range_params(this.state.dates); //for div , width: '80%'

			return (
				<div
					style={{
						width: '80%',
						margin: 'auto',
					}}
				>
					<Plot
						data={this.state.data}
						layout={{
							autosize: true,
							yaxis: { tickformat: ',.0%' },
							responsive: true,
							xaxis: {
								tickmode: 'array', //  If "linear", the placement of the ticks is determined by a starting position `tick0` and a tick step `dtick`
								tick0: 0,
								tickvals: this.state.xticks,
							},
						}}
						useResizeHandler={true}
						style={{ width: '100%', height: '100%' }}
					/>
					<Range
						style={{
							marginBottom: 30,
						}}
						min={range_params.min}
						max={range_params.max}
						// defaultValue={range_params.defaultValue}
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
