import React from 'react';
import Search from './search_bar/Search';
import * as Lang from './utils/Lang';
import * as StockMarket from './stock_getter/StockGetter';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			lang: Lang.TASE_TYPES_HEBREW, // cahnge to english if button pressed
			stock_market: StockMarket.TASE_STOCK_FUNCTIONS, // cahnge to other stock if button pressed
		};
	}

	componentDidMount() {}

	render() {
		return (
			<div>
				<Search text_lang={this.state.lang} stock_market={this.state.stock_market} />
			</div>
		);
	}
}
export default App;
