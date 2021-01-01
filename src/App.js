import      React       from 'react';
import      Search      from './search_bar/Search';
import * as Lang        from './Utils/Lang';
// import styles      from  ''

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			he_lang : true
		}
	}

	componentDidMount() {}

	render() {
		let text_lang
		if(this.state.he_lang)
		{
	        text_lang = Lang.TASE_TYPES_HEBREW
		}
		else {
			text_lang = Lang.TASE_TYPES_ENGLISH
		}
		return (
			<div>
				<Search
				    text_lang = {text_lang}
				/>
			</div>
		);
	}
}
export default App;