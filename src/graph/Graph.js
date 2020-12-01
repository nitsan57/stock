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
				'Content-Type': 'application/json',
				'User-Agent':
					'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Mobile Safari/537.36',
			},
		};
		fetch(
			'https://cors-anywhere.herokuapp.com/https://www.bizportal.co.il/forex/quote/ajaxrequests/paperdatagraphjson?period=fiveyearly&paperID=' +
				instrument_id,
			requestOptions
		)
			.then((response) => response.json())
			.then((jsonData) => {
				// jsonData is parsed json object received from url
				var points_for_chart = jsonData['points'];
				var y_0 = points_for_chart[points_for_chart.length - 1]['C_p'];
				for (i = points_for_chart.length - 1; i > -1; i--) {
					var my_data = points_for_chart[i]['C_p'] / y_0;
					y.push(my_data);
					x.push(points_for_chart[i]['D_p']);
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
