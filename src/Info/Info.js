import React from 'react';
import FundDisplay from '../fund_display/Fund_Display';

class Info extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			is_data_loaded: false,
			info: [],
			stock_market: this.props.stock_market,
			text_lang: this.props.text_lang,
		};
	}

	get_table_data() {
		let all_results = this.props.funds;
		let keep_info = this.props.info;
		let table_data = this.state.stock_market.extract_table_info(keep_info, all_results);

		this.setState({ info: table_data });
		this.setState({ is_data_loaded: true });
	}

	remove_state_incdices(array_name, array_to_delete_from, indices) {
		let reverse_indices = indices.reverse();
		let array;
		array = [...array_to_delete_from];

		reverse_indices.forEach((i) => {
			array.splice(i, 1);
		});
		indices.reverse();
		this.setState({ [array_name]: array });
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (
			(nextState.is_data_loaded && !this.state.is_data_loaded) ||
			nextProps.graph_yield_values !== this.props.graph_yield_values
		) {
			return true;
		}

		if (this.props.funds && nextProps.funds) {
			if (nextProps.funds.length !== this.props.funds.length) {
				return true;
			} else {
				return false;
			}
		}
	}

	async componentDidUpdate(prevProps) {
		if (this.props.funds.length !== prevProps.funds.length) {
			if (this.props.indices_to_remove.length !== 0) {
				this.remove_state_incdices('info', this.state.info, this.props.indices_to_remove);
				return;
			}

			if (this.props.funds.length === 0 || !this.props.to_add_plot) {
				this.setState({ info: [] });
			}
			this.get_table_data();
			this.props.tableHandler();
		}
	}

	render() {
		return (
			<div>
				<FundDisplay
					info={this.state.info}
					text_lang={this.state.text_lang}
					graph_yield_values={this.props.graph_yield_values}
					funds={this.props.funds}
					RemoveRowFromGraphHandler={this.props.RemoveRowFromGraphHandler}
				/>
			</div>
		);
	}
}

export default Info;
