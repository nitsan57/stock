import * as TASE from './Tase';

export const TASE_STOCK_FUNCTIONS = {
	search: TASE.search,
	get_instrument_chart_data: TASE.get_instrument_chart_data,
	extract_chart_point: TASE.extract_chart_point,
	extract_table_info: TASE.extract_table_info,
	extract_chart_length: TASE.extract_chart_length,
	filter_indices: TASE.filter_indices,
};

export const NY_STOCK_FUNCTIONS = {
	KEEP_RELEVANT_DATA: null,
};
