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
		// jsonData is parsed json object received from url

		var points_for_chart = raw_data[0]['points'];
		var min_data_length = points_for_chart.length;
		var i = 0;
		for (i = 0; i < raw_data.length; i++) {
			points_for_chart = raw_data[i]['points'];
			var d_length = points_for_chart[points_for_chart.length - 1].length;
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
		var j = 0;
		for (i = 0; i < raw_data.length; i++) {
			name = raw_data[i]['paperName'];
			points_for_chart = raw_data[i]['points'];
			x = [];
			y = [];
			for (j = min_data_length - 1; j > -1; j--) {
				y_0 = points_for_chart[min_data_length - 1]['C_p'];
				my_data = points_for_chart[j]['C_p'] / y_0;
				y.push(my_data);
				x.push(points_for_chart[j]['D_p']);
			}
			var temp_data = this.create_graph_data(x, y, name);
			res.push(temp_data);
		}

		this.setState({ data: res });
	}

	async get_intruments_data(first_date, last_date, instruments, raw_data) {
		var instrument;
		var i;
		for (i = 0; i < instruments.length; i++) {
			instrument = instruments[i];
			var instrument_id = instrument['id'];
			const requestOptions = {
				method: 'GET',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Mobile Safari/537.36',
				},
			};
			try {
				let response = await fetch(
					'https://cors-anywhere.herokuapp.com/https://www.bizportal.co.il/forex/quote/ajaxrequests/paperdatagraphjson?period=fiveyearly&paperID=' +
						instrument_id,
					requestOptions
				);
				let jsonData = await response.json();
				raw_data.push(jsonData);
			} catch (err) {
				console.log('Erorr in fetch');
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
