import React from 'react';
import Search from './search_bar/Search';
import * as Lang from './utils/Lang';
import * as StockMarket from './stock_getter/StockGetter';
import Navbar from './navbar/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import GoogleAd from './google_ad/GoogleAd';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			lang: Lang.HEBREW, // cahnge to english if button pressed
			stock_market: StockMarket.TASE_STOCK_FUNCTIONS, // cahnge to other stock if button pressed
		};
		this.change_lang = this.change_lang.bind(this);
	}

	change_lang() {
		// if (this.state.lang.NAME === 'ENGLISH') {
		// 	this.setState({ lang: Lang.HEBREW });
		// } else {
		// 	this.setState({ lang: Lang.ENGLISH });
		// }
	}

	componentDidMount() {}

	render() {
		return (
			<Router>
				<Navbar change_lang={this.change_lang} text_lang={this.state.lang} />
				<Switch>
					<Route exact path="/">
						<Search text_lang={this.state.lang} stock_market={this.state.stock_market} />
						<GoogleAd slot="394738798" timeout={1000} classNames="page-bottom" />
					</Route>
					<Route exact path="/contact">
						<h1 style={{ textAlign: 'right', alignSelf: 'stretch' }}>fortunae </h1>
						<h2 style={{ textAlign: 'right', alignSelf: 'stretch' }}>
							{' '}
							הוקם ב2020 כדי לתת מענה להשוואת קרנות הסל וקרנות הנאמנות בישראל. פיתחנו כלי פשוט ונוח
							להשוואת דמי ניהול, ותשואה לתקופת זמן נבחרת. צוות ההנהלה: אוראל כאליהו וניצן לוי{' '}
						</h2>
					</Route>
				</Switch>
			</Router>
		);
	}
}
export default App;
