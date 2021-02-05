import React from 'react';
import Search from './search_bar/Search';
import * as Lang from './utils/Lang';
import * as StockMarket from './stock_getter/StockGetter';
import Navbar from './navbar/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import GoogleAd from './google_ad/GoogleAd';
import MainLogo from './Logo/Logo_b.png';

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

						{/* <GoogleAd slot="394738798" timeout={1000} classNames="page-bottom" /> */}

						<script type="text/javascript">var infolinks_pid = 3309938; var infolinks_wsid = 0;</script>
						<script
							type="text/javascript"
							src="http://resources.infolinks.com/js/infolinks_main.js"
						></script>

						<script type="text/javascript" src="//resources.infolinks.com/js/infolinks_main.js"></script>
					</Route>
					<Route exact path="/contact">
						{/* <div style={{ textAlign: 'right', alignSelf: 'stretch' }}>{',fortunae'}</div> */}
						<div style={{ textAlign: 'right', alignSelf: 'stretch' }}>
							{
								'.האתר הוקם ב2020 כדי לתת מענה מהיר ונוח להשוואת מחירי ניהול ותשואות  של קרנות סל וקרנות נאמנות'
							}
						</div>
						{/* <div style={{ textAlign: 'right', alignSelf: 'stretch' }}>{':מקימים'}</div>
						<div style={{ textAlign: 'right', alignSelf: 'stretch' }}>{'אוראל כאליהו'}</div>
						<div style={{ textAlign: 'right', alignSelf: 'stretch' }}>{'ניצן שלוטרבק לוי'}</div> */}
						<img
							src={MainLogo}
							style={{ display: 'flex', margin: 'auto', width: '30%', height: '30%' }}
							alt="fireSpot"
						/>
					</Route>
				</Switch>
			</Router>
		);
	}
}
export default App;
