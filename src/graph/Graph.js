import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

import 'rc-slider/assets/index.css';
import { Range } from 'rc-slider';

const Plot = createPlotlyComponent(Plotly);

class Graph extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			raw_data: [],
			instruments: [],
			data: [],
			xticks: 5,
			dates: [],
			is_data_loaded: null,
			stock_market: this.props.stock_market,
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
		var instrument_array_promise;
		var z;
		var k;
		var len;
		var status;
		var value;
		let all_instruments_array = [];
		let instrument_data_array = [];
		var instrument_raw_array;
		let firstKey;
		for (k = 0; k < raw_data.length; k++) {
			instrument_array_promise = raw_data[k]['value'];
			len = instrument_array_promise.length;
			instrument_raw_array = await Promise.allSettled(instrument_array_promise);
			for (z = 0; z < len; z++) {
				status = instrument_raw_array[z]['status'];
				value = instrument_raw_array[z]['value'];
				value = JSON.parse(value);
				firstKey = Object.keys(value)[0];

				if (status !== 'fulfilled' || value[firstKey].length === 0) {
					break;
				}
				instrument_data_array = instrument_data_array.concat(value[firstKey]);
			}
			all_instruments_array.push(instrument_data_array);

			instrument_data_array = [];
		}
		return all_instruments_array;
	}

	async get_graph_data(raw_data_input, instruments, date_range) {
		await Promise.allSettled(raw_data_input).then(async (raw_data) => {
			var value;
			let data_array = await this.prepare_data(raw_data);
			var min_data_length = 100000;
			var i;

			for (i = 0; i < data_array.length; i++) {
				value = data_array[i];
				var d_length = value.length;
				if (min_data_length > d_length) {
					min_data_length = d_length;
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
				// value = data_array[i];
				[x, y, name] = this.state.stock_market.extract_chart_point(
					x,
					y,
					instruments,
					data_array,
					min_data_length,
					start_date,
					i
				);
				var temp_data = this.create_graph_data(x, y, name);
				res.push(temp_data);
			}

			let xticks = parseInt(x.length / 10);
			this.setState({ xticks: xticks });

			this.setState({ data: res });
			if (date_range[1] === 0) {
				this.setState({ dates: x });
			}
		});
	}

	async get_intruments_data(today, instruments, raw_data) {
		this.state.stock_market.get_instrument_chart_data(today, instruments, raw_data);
		this.setState({ raw_data: raw_data });
		await this.get_graph_data(raw_data, instruments, [0, 0]);
	}

	async componentDidUpdate(prevProps) {
		// console.log('graph comp mount');
		// Typical usage (don't forget to compare props):
		if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
			if (this.props.is_button_pressed) {
				this.setState({ is_data_loaded: false });
				var today = this.props.today;
				var funds = this.props.funds;
				if (funds.length === 0) {
					this.setState({ is_data_loaded: null });
					this.props.graphHandler();
					return;
				}
				var to_add_plot = this.props.to_add_plot;
				await this.get_intrument_list(today, funds, to_add_plot);
				this.props.graphHandler();
				this.setState({ is_data_loaded: true });
			}
		}
	}

	range_change(value) {
		let raw_data = this.state.raw_data;
		this.get_graph_data(raw_data, this.state.instruments, value);
	}

	range_params(x_axis) {
		let final_index = x_axis.length - 1;
		let marks = {};
		let i = 0;
		let mark_jump_const = parseInt((x_axis.length - 1) / 10);
		let current_jump;
		for (i = 0; i < 10; i++) {
			current_jump = i * mark_jump_const;
			marks[current_jump] = x_axis[current_jump];
		}
		console.log(marks);
		return {
			min: 0,
			max: x_axis.length,
			defaultValue: [0, final_index],
			marks: marks,
		};
	}

	render() {
		if (this.state.is_data_loaded == null) {
			return null;
		}
		if (this.state.is_data_loaded) {
			let range_params = this.range_params(this.state.dates); //for div , width: '80%'
			return (
				<div style={{ width: '80%', margin: 'auto' }}>
					<Plot
						data={this.state.data}
						layout={{
							autosize: true,
							yaxis: { tickformat: ',.0%' },
							responsive: true,
							xaxis: {
								tickmode: 'linear', //  If "linear", the placement of the ticks is determined by a starting position `tick0` and a tick step `dtick`
								tick0: 0,
								dtick: this.state.xticks,
							},
						}}
						useResizeHandler={true}
						style={{ width: '100%', height: '100%' }}
					/>
					<Range
						min={range_params.min}
						max={range_params.max}
						defaultValue={range_params.defaultValue}
						marks={range_params.marks}
						onAfterChange={this.range_change}
					/>
				</div>
			);
		} else {
			return null;
		}
	}
}
export default Graph;
