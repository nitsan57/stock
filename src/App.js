import React from 'react';
import Search from './search_bar/Search';
import * as Lang from './utils/Lang';
import * as StockMarket from './stock_getter/StockGetter';
import Navbar from './navbar/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			lang: Lang.HEBREW, // cahnge to english if button pressed
			stock_market: StockMarket.TASE_STOCK_FUNCTIONS, // cahnge to other stock if button pressed
		};
	}

	componentDidMount() {}

	render() {
		return (
			<Router>
				<Navbar />
				<Switch>
					<Route exact path="/">
						<Search text_lang={this.state.lang} stock_market={this.state.stock_market} />
					</Route>
				</Switch>
			</Router>
		);
	}
}
export default App;
