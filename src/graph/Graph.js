import React from 'react';
// import Plotly  from 'react-plotly.js';
// import Plot from "react-plotly.js";
import Plotly from 'plotly.js-basic-dist';

import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

class Graph extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			is_data_loaded: null,
			// datarevision: 1,
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
		};
	}

	componentDidMount() {}

	async get_intrument_list(first_date, last_date, instrument_list, to_add_plot) {
		var raw_data = [];
		if (!to_add_plot) {
			await this.setStateAsync({ data: [] });
		}
		await this.get_intruments_data(first_date, last_date, instrument_list, raw_data);
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve);
		});
	}

	async get_graph_data(raw_data) {
		var firstKey = Object.keys(raw_data[0])[0];
		var points_for_chart = raw_data[0][firstKey];
		// console.log(points_for_chart);
		var min_data_length = points_for_chart.length;
		var i;
		for (i = 0; i < raw_data.length; i++) {
			firstKey = Object.keys(raw_data[i])[0];
			points_for_chart = raw_data[i][firstKey];
			var d_length = points_for_chart.length;
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
		for (i = 0; i < raw_data.length; i++) {
			name = raw_data[i]['name'];
			firstKey = Object.keys(raw_data[i])[0];
			points_for_chart = raw_data[i][firstKey];
			x = [];
			y = [];
			var rate;
			for (j = min_data_length - 1; j > -1; j--) {
				rate = 'ClosingRate';
				if (firstKey === 'Table') {
					rate = 'PurchasePrice';
				}
				y_0 = points_for_chart[min_data_length - 1][rate];
				my_data = points_for_chart[j][rate] / y_0;
				y.push(my_data);
				x.push(points_for_chart[j]['TradeDate']);
			}
			var temp_data = this.create_graph_data(x, y, name);
			res.push(temp_data);
		}

		this.setState({ data: res });
	}

	async fetch_data(method, url, data, type) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.setRequestHeader('Cache-Control', 'no-cache');
			xhr.setRequestHeader('X-Maya-With', 'allow');
			xhr.setRequestHeader('Accept-Language', 'heb-IL');
			xhr.setRequestHeader('Content-Type', type);
			xhr.onload = function () {
				if (this.status >= 200 && this.status < 300) {
					resolve(xhr.response);
					// console.log(xhr.responseText);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText,
					});
				}
			};
			xhr.onerror = function () {
				reject({
					status: this.status,
					statusText: xhr.statusText,
				});
			};
			xhr.send(data);
		});
	}

	async fetch_fund(first_date, last_date, instrument, raw_data) {
		var instrument_id = instrument['id'];
		var instrument_name = instrument['name'];
		var url = 'https://mayaapi.tase.co.il/api/fund/history';
		var data = 'DateFrom=2017-12-31&DateTo=2020-12-07&FundId=' + instrument_id + '&Page=1&Period=0';

		let res = await this.fetch_data('POST', url, data, 'application/x-www-form-urlencoded');
		let json_res = JSON.parse(res);
		json_res.name = instrument_name;
		raw_data.push(json_res);
	}

	async fetch_security(first_date, last_date, instrument, raw_data) {
		var instrument_id = instrument['id'];
		var instrument_name = instrument['name'];
		var url = 'https://api.tase.co.il/api/security/historyeod';
		var data = {
			dFrom: '2017-12-31',
			dTo: '2020-12-07',
			oId: instrument_id,
			pageNum: 1,
			pType: '8',
			TotalRec: 1,
			lang: '1',
		};
		let res = await this.fetch_data('POST', url, JSON.stringify(data), 'application/json');
		let json_res = JSON.parse(res);
		json_res.name = instrument_name;
		raw_data.push(json_res);
	}

	async get_intruments_data(first_date, last_date, instruments, raw_data) {
		var instrument;
		var i;

		for (i = 0; i < instruments.length; i++) {
			instrument = instruments[i];
			var instrument_id = instrument['id'];
			if (String(instrument_id)[0] === '1') {
				await this.fetch_security(first_date, last_date, instrument, raw_data);
			} else {
				await this.fetch_fund(first_date, last_date, instrument, raw_data);
			}
		}
		await this.get_graph_data(raw_data);
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
				var to_add_plot = this.props.to_add_plot;

				await this.get_intrument_list(first_date, last_date, funds, to_add_plot);
				this.props.graphHandler();
				this.setState({ is_data_loaded: true });
			}
		}
	}

	render() {
		if (this.state.is_data_loaded == null) {
			return <h1>Hi search something :)</h1>;
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
					}}
				/>
			);
		} else {
			return <h1>Loading...</h1>;
		}
	}
}
export default Graph;
