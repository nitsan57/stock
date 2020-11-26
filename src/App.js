import React from 'react';
import Search from './search_bar/Search';

class App extends React.Component {
	constructor() {
		super();
	}

	componentDidMount() {}

	render() {
		return (
			<div>
				<Search />
			</div>
		);
	}
}

export default App;
