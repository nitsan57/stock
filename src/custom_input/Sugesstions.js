import React from 'react';
import * as Consts from '../utils/Consts';
import SuggestionSingleLine from '../custom_input/SuggestionSingleLine';

const Suggestions = (props) => {
	if (props.results.length === 0) {
		return null;
	}
	let total_to_show = Consts.NUM_SEARCH_ELEMENTS_LIMIT_TO_SHOW + Consts.NUM_SEARCH_INDICES_LIMIT_TO_SHOW;
	let show_indices = props.indices.slice(0, Consts.NUM_SEARCH_INDICES_LIMIT_TO_SHOW);
	let indices_len = show_indices.length;
	let suggestions = props.results.slice(0, total_to_show - indices_len);
	const indices_list = [];
	// indices_list.push(<div style={{ fontSize: 12, color: 'gray' }}>{props.text_lang.SUGGESTIONS.INDICES}</div>);
	indices_list.push(
		show_indices.map((r, index) => (
			<SuggestionSingleLine
				variant="outline-secondary"
				search={props.index_search}
				text_lang={props.text_lang}
				name={r}
				id={index}
				index={r}
				key={index}
				tooltip_extra={' [' + props.text_lang.SUGGESTIONS.INDICES + ']'}
				// color={'outline-secondary'}
			/>
		))
	);
	const etfs = [];
	// etfs.push(<div style={{ fontSize: 12, color: 'blue' }}>{props.text_lang.SUGGESTIONS.ETFS}</div>);
	etfs.push(
		suggestions.map((r, index) => (
			<SuggestionSingleLine
				search={props.specific_search}
				text_lang={props.text_lang}
				name={r.Name}
				id={r.id}
				index={index}
				variant="outline-primary"
				key={r.id}
				tooltip_extra={''}

				// color={'outline-primary'}
			/>
		))
	);
	const show_all = (
		<SuggestionSingleLine
			search={props.specific_search}
			text_lang={props.text_lang}
			name={props.text_lang.SUGGESTIONS.ALL}
			id={9999}
			index={9999}
			variant="outline-primary"
		/>
	);
	return (
		<div>
			{indices_list}
			{etfs}
			{show_all}
		</div>
	);
};

export default Suggestions;
