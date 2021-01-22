import React from 'react';
import Button from 'react-bootstrap/Button';
import * as Consts from '../utils/Consts';

const Suggestions = (props) => {
	if (props.results.length === 0) {
		return null;
	}
	let total_to_show = Consts.NUM_SEARCH_ELEMENTS_LIMIT_TO_SHOW + Consts.NUM_SEARCH_INDICES_LIMIT_TO_SHOW;
	let show_indices = props.indices.slice(0, Consts.NUM_SEARCH_INDICES_LIMIT_TO_SHOW);
	let indices_len = show_indices.length;
	let suggestions = props.results.slice(0, total_to_show - indices_len);
	suggestions.push({ id: 9999, name: props.text_lang.SUGGESTIONS.ALL });
	const indices_list = show_indices.map((r, index) => (
		<Button size="sm" key={index} variant="outline-secondary" onMouseDown={() => props.index_search(r)}>
			{r}
		</Button>
	));
	const etfs = suggestions.map((r, index) => (
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
			{indices_list}
			{etfs}
		</div>
	);
};

export default Suggestions;
