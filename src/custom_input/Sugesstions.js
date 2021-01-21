import React from 'react';
import Button from 'react-bootstrap/Button';
import * as Consts from '../utils/Consts';

const Suggestions = (props) => {
	if (props.results.length === 0) {
		return null;
	}
	let suggestions = props.results.slice(0, Consts.NUM_SEARCH_ELEMENTS_LIMIT_TO_SHOW);
	suggestions.push({ id: 0, name: props.text_lang.SUGGESTIONS.ALL });
	const options = suggestions.map((r, index) => (
		<Button size="sm" variant="outline-primary" key={r.id} onMouseDown={() => props.click_handler(index)}>
			{r.name}
		</Button>
	));
	return (
		<div
			style={{
				display: 'grid',
				marginLeft: '30%',
				width: '40%',
			}}
		>
			{options}
		</div>
	);
};

export default Suggestions;
