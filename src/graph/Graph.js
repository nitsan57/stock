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
		// mode={'lines+markers'}
		// marker={{ size: 10 }}
		// line={{ shape: 'spline' }}
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
		if (!to_add_plot) {
			await this.setStateAsync({ data: [] });
		}
		var i = 0;
		for (i = 0; i < instrument_list.length; i++) {
			await this.get_intrument_data(first_date, last_date, instrument_list[i], to_add_plot);
		}
	}

	setStateAsync(state) {
		return new Promise((resolve) => {
			this.setState(state, resolve);
		});
	}

	async get_intrument_data(first_date, last_date, instrument) {
		var i;
		var x = [];
		var y = [];
		var name = instrument['name'];
		var instrument_id = instrument['id'];
		// console.log(instrument_id);
		const requestOptions = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0',
			},
		};
		fetch(
			'https://api.tase.co.il/api/ChartData/ChartData/?ct=1&ot=1&lang=1&cf=0&cp=4&cv=0&cl=0&cgt=1&dFrom=' +
				first_date +
				'&dTo=' +
				last_date +
				'&oid=' +
				instrument_id,
			requestOptions
		)
			.then((response) => response.json())
			.then((jsonData) => {
				// jsonData is parsed json object received from url
				var points_for_chart = jsonData['PointsForHistoryChart'];
				var y_0 = points_for_chart[points_for_chart.length - 1]['ClosingRate'];
				for (i = points_for_chart.length - 1; i > -1; i--) {
					var my_data = points_for_chart[i]['ClosingRate'] / y_0;
					y.push(my_data);
					x.push(points_for_chart[i]['TradeDate']);
				}
			})
			.catch((error) => {
				// handle your errors here
				console.error(error);
			});
		var temp_data = this.create_graph_data(x, y, name);
		await this.setStateAsync({ data: [...this.state.data, temp_data] });
	}

	async componentDidUpdate(prevProps) {
		// console.log('graph comp mount');
		// Typical usage (don't forget to compare props):
		if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
			if (this.props.is_button_pressed) {
				// console.log('button presed in graph detected');
				// console.log(this.props);
				this.setState({ is_data_loaded: false });
				var first_date = this.props.first_date;
				var last_date = this.props.last_date;
				var funds = this.props.funds;
				var to_add_plot = this.props.to_add_plot;
				//this.get_intrument_data(first_date,last_date,instrument_id, to_add_plot);

				// if (!Array.isArray(instrument_id)) {
				// 	temp_list = [instrument_id];
				// }
				await this.get_intrument_list(first_date, last_date, funds, to_add_plot);
				this.props.graphHandler();
				// this.setState({ datarevision: this.state.datarevision + 1 });
				setTimeout(
					function () {
						this.setState({ is_data_loaded: true });
					}.bind(this),
					3000
				);
			}
		}
	}

	render() {
		if (this.state.is_data_loaded == null) {
			return <h1>Hi search something :)</h1>;
		}
		if (this.state.is_data_loaded) {
			// console.log('data is lodaded to render');

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
