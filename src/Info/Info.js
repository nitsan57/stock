import React from 'react';
import FundDisplay from '../Fund_Display/Fund_Display';

class Info extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			is_data_loaded: false,
			info: [],
			stock_market: this.props.stock_market,
		};
	}

	get_table_data() {
		let all_results = this.props.funds;
		let keep_info = this.props.info;
		let table_data = this.state.stock_market.extract_table_info(keep_info, all_results);

		this.setState({ info: table_data });
		this.setState({ is_data_loaded: true });
	}

	componentDidUpdate(prevProps) {
		if (this.props.funds !== prevProps.funds) {
			if (this.props.is_button_pressed !== prevProps.is_button_pressed) {
				if (this.props.is_button_pressed && (this.props.funds.length === 0 || !this.props.to_add_plot)) {
					this.setState({ info: [] });
				}
			}
			this.get_table_data();
			this.props.tableHandler();
		}
	}

	render() {
		return (
			<div>
				<FundDisplay info={this.state.info} />
			</div>
		);
	}
}

export default Info;
