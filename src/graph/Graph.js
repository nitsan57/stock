import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import { fetch_data } from '../Utils';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

class Graph extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			raw_data: [],
			instruments: [],
			data: [],
			is_data_loaded: null,
		};
		this.create_graph_data = this.create_graph_data.bind(this);
		this.setStateAsync = this.setStateAsync.bind(this);
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

	async get_intrument_list(first_date, last_date, instrument_list, to_add_plot) {
		var raw_data = this.state.raw_data;
		if (!to_add_plot) {
			await this.setStateAsync({ data: [] });
			await this.setStateAsync({ instruments: [] });
			raw_data = [];
			await this.setStateAsync({ raw_data: [] });
		}
		let total_inst = this.state.instruments.concat(instrument_list);
		await this.get_intruments_data(first_date, last_date, total_inst, raw_data);
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

	async get_graph_data(raw_data_input, instruments) {
		await Promise.allSettled(raw_data_input).then(async (raw_data) => {
			var data_y_point;
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
			var y_0;
			var my_data;
			var res = [];
			var j;
			var date;
			var year;
			var month;
			var day;
			for (i = 0; i < data_array.length; i++) {
				value = data_array[i];
				name = instruments[i]['name'];
				y = [];
				var rate;

				for (j = min_data_length - 1; j > -1; j--) {
					data_y_point = value[j]['CloseRate'];
					rate = 'CloseRate';
					if (data_y_point === undefined) {
						data_y_point = value[j]['PurchasePrice'];
						rate = 'PurchasePrice';
					}
					y_0 = value[min_data_length - 1][rate];
					my_data = data_y_point / y_0;
					y.push(my_data - 1);
					if (i === 0) {
						date = value[j]['TradeDate'].substring(0, 10).split('-');
						if (date.length === 1) {
							x.push(date[0]);
						} else {
							year = date[0];
							month = date[1];
							day = date[2];
							x.push(day + '/' + month + '/' + year);
						}
					}
				}
				var temp_data = this.create_graph_data(x, y, name);
				res.push(temp_data);
			}

			this.setState({ data: res });
		});
	}

	fetch_fund(first_date, last_date, instrument, raw_data) {
		var temp_res = [];

		var i;
		for (i = 1; i < 30; i++) {
			var instrument_id = instrument['id'];
			var url = 'https://mayaapi.tase.co.il/api/fund/history';

			var data =
				'DateFrom=2015-12-1&DateTo=2020-12-09&FundId=' + instrument_id + '&Page=' + String(i) + '&Period=0';

			let res = fetch_data('POST', url, data, 'application/x-www-form-urlencoded');
			temp_res.push(res);
		}
		raw_data.push(temp_res);
	}

	fetch_security(first_date, last_date, instrument, raw_data) {
		var temp_res = [];
		var i;
		for (i = 1; i < 30; i++) {
			var instrument_id = instrument['id'];
			var url = 'https://api.tase.co.il/api/security/historyeod';
			var data = {
				dFrom: '2015-12-1',
				dTo: '2020-12-09',
				oId: instrument_id,
				pageNum: i,
				pType: '8',
				TotalRec: 1,
				lang: '1',
			};
			let res = fetch_data('POST', url, JSON.stringify(data), 'application/json');
			temp_res.push(res);
		}
		raw_data.push(temp_res);
	}

	async get_intruments_data(first_date, last_date, instruments, raw_data) {
		var instrument;
		var i;
		let add_len = raw_data.length;

		for (i = add_len; i < instruments.length; i++) {
			instrument = instruments[i];
			var instrument_id = instrument['id'];
			if (String(instrument_id)[0] === '1') {
				this.fetch_security(first_date, last_date, instrument, raw_data);
			} else {
				this.fetch_fund(first_date, last_date, instrument, raw_data);
			}
		}
		this.setState({ raw_data: raw_data });
		await this.get_graph_data(raw_data, instruments);
	}

	async componentDidUpdate(prevProps) {
		// console.log('graph comp mount');
		// Typical usage (don't forget to compare props):
		if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
			if (this.props.is_button_pressed) {
				this.setState({ is_data_loaded: false });
				var first_date = this.props.first_date;
				var last_date = this.props.last_date;
				var funds = this.props.funds;
				if (funds.length === 0) {
					this.setState({ is_data_loaded: null });
					this.props.graphHandler();
					return;
				}
				var to_add_plot = this.props.to_add_plot;
				await this.get_intrument_list(first_date, last_date, funds, to_add_plot);
				this.props.graphHandler();
				this.setState({ is_data_loaded: true });
			}
		}
	}

	render() {
		if (this.state.is_data_loaded == null) {
			return null;
		}
		if (this.state.is_data_loaded) {
			// console.log(this.state.data);
			return (
				<Plot
					data={this.state.data}
					layout={{
						width: 940,
						height: 640,
						autosize: true,
						title: 'A Crazy Plot',
						yaxis: { tickformat: ',.0%' },
					}}
				/>
			);
		} else {
			return null;
		}
	}
}
export default Graph;
