import { fetch_data } from '../utils/Utils';
import * as Consts from '../utils/Consts';
// import Information from '../info-json';
import { Information } from '../new';
import { Indices } from '../new';

// import * as Consts from '../new'';

const tase_info = Information;
const tase_indices = Indices;

export function filter_indices(search_keyword, filterd_res) {
	const filteredData = tase_indices.filter((word) => word.toLowerCase().includes(search_keyword.toLowerCase()));
	let res = [];
	let temp_res;
	filteredData.forEach((item) => {
		temp_res = filterd_res.filter((z) => z['Name'].toLowerCase().includes(item.toLowerCase()));
		if (temp_res.length != 0) {
			res.push(item);
		}
	});
	return res;
}

export async function search(
	search_keyword,
	imitating,
	leveraged,
	short,
	normal_stock,
	kosher_stock,
	mm,
	managment_fee_filter
) {
	search_keyword = search_keyword.toLowerCase();

	const filteredData = tase_info.filter(
		function (item) {
			if (
				this.count < Consts.NUM_SEARCH_ELEMENTS_LIMIT &&
				Object.keys(item).some((key) => String(item[key]).toLowerCase().includes(search_keyword))
			) {
				let fund_data = item;
				let type = item['Type'];
				let subtype = item['SubType'];
				if (fund_data['ManagementFee'] + fund_data['TrusteeFee'] > managment_fee_filter) {
					return false;
				}
				if (!kosher_stock && item['Name'].includes('כשרה')) {
					return false;
				}
				if (!mm && item['Name'].includes('מנוטרל')) {
					return false;
				}

				if (
					(type === Consts.TYPE_ID.SECURITY && subtype !== Consts.SUB_TYPE_ID.STOCK) ||
					type === Consts.TYPE_ID.FUND // agah filter && bond_fund !== Consts.MAGNA_TYPE.BOND
				) {
					if (
						(fund_data['FundIndicators'][Consts.TASE_TYPES.IMITATING] && !imitating) ||
						(fund_data['FundIndicators'][Consts.TASE_TYPES.LEVERAGED] && !leveraged) ||
						(fund_data['FundIndicators'][Consts.TASE_TYPES.SHORT] && !short)
					) {
						return false;
					}
					this.count++;
					return true;
				} else if (type === Consts.TYPE_ID.SECURITY && subtype === Consts.SUB_TYPE_ID.STOCK) {
					if (!normal_stock) {
						return false;
					}
					this.count++;
					return true;
				}
				return false;
			}
			return false;
		},
		{ count: 0 }
	);

	if (filteredData.length === 0) {
		return -1;
	}
	let fund_l = [];
	filteredData.forEach((item) => {
		fund_l.push(item);
	});

	return fund_l;
}
//var url = 'https://mayaapi.tase.co.il/api/download/fundhistory';
//var data = 'DateFrom=' + before_5 + '&DateTo=' + today + '&FundId=' + instrument_id;
//POST

function fetch_fund(today, instrument, raw_data) {
	let year = today.split('-')[0];
	let before_5 = today.replace(year, year - 10);
	var instrument_id = instrument['Id'];
	//var url = 'https://api.tase.co.il/api/ChartData/ChartData/';
	let url = 'https://externalapi.bizportal.co.il/Mobile/m/GetHistoricalMobile?';
	let data = 'paperID=' + instrument_id + '&period=5';
	// let data =
	// 	'?ct=1&ot=1&lang=1&cf=0&cp=5&cv=0&cl=0&cgt=1&' +
	// 	'dFrom=' +
	// 	before_5 +
	// 	'&dTo=' +
	// 	today +
	// 	'&oid=' +
	// 	instrument_id;

	url = url + data;

	let res = fetch_data('GET', url, data, 'application/x-www-form-urlencoded');
	raw_data.push(res);
}

function fetch_security(today, instrument, raw_data) {
	let year = today.split('-')[0];
	let before_5 = today.replace(year, year - 10);
	var instrument_id = instrument['Id'];
	//var url = 'https://api.tase.co.il/api/ChartData/ChartData/';
	let url = 'https://externalapi.bizportal.co.il/Mobile/m/GetHistoricalMobile?';
	let data = 'paperID=' + instrument_id + '&period=5';

	// let data =
	// 	'?ct=1&ot=1&lang=1&cf=0&cp=5&cv=0&cl=0&cgt=1&' +
	// 	'dFrom=' +
	// 	before_5 +
	// 	'&dTo=' +
	// 	today +
	// 	'&oid=' +
	// 	instrument_id;

	url = url + data;

	let res = fetch_data('GET', url, data, 'application/x-www-form-urlencoded');
	raw_data.push(res);
}

export function get_instrument_chart_data(today, instruments, raw_data) {
	let i;
	let instrument;
	let add_len = raw_data.length;

	for (i = add_len; i < instruments.length; i++) {
		instrument = instruments[i];
		var instrument_id = instrument['Id'];
		if (String(instrument_id)[0] === '1' || (instrument['Type'] === '1' && instrument['SubType'] === '1')) {
			fetch_security(today, instrument, raw_data);
		} else {
			fetch_fund(today, instrument, raw_data);
		}
	}
}

export function extract_chart_length(instrument_data) {
	let data = instrument_data[0];
	if (data === undefined) {
		data = instrument_data;
	}

	let s = data['HistoricData'][data['HistoricData'].length - 1]['D'];

	data = data['HistoricData'];
	return [data.length, s];
}

function str_to_date(str_date) {
	let s_date = str_date.split('/');
	return new Date(s_date[1] + '/' + s_date[0] + '/' + s_date[2]);
}

function date_to_str(date, sub) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	if (sub) {
		year = year - 2000;
	}
	return day + '/' + month + '/' + year;
}

function fill_holes(j, last_known_data, array_dates_to_push, array_data_to_push, curr_date, next_date, fill_x) {
	let i = 1;
	let temp_str_date;
	let splited_date;
	let next_day_time = curr_date.getTime() + i * 26 * 60 * 60 * 1000;
	let temp_date;
	while (str_to_date(next_date).getTime() > next_day_time) {
		temp_date = new Date(next_day_time);
		temp_str_date = date_to_str(temp_date, false);
		splited_date = temp_str_date.split('/');
		splited_date[2] = splited_date[2] - 2000;
		if (temp_date.getDay() < 5) {
			if (fill_x) {
				array_dates_to_push.push(splited_date[0] + '/' + splited_date[1] + '/' + splited_date[2]);
			}
			if (fill_x || array_dates_to_push.length > array_data_to_push.length) {
				array_data_to_push.push(last_known_data);
			}
		}
		i = i + 1;
		next_day_time = curr_date.getTime() + i * 26 * 60 * 60 * 1000;
	}
}

export function extract_chart_point(x, y, instruments, data_array, common_date, end_date, i, fill_x) {
	let value;
	let name;
	let j;
	let data_y_point;
	let y_0;
	let my_data;
	let date;
	value = data_array[i];
	let data = value[0];
	let last_loop_date;
	if (data === undefined) {
		data = value;
	}
	data = data['HistoricData'];
	name = instruments[i]['Name'];
	y = [];
	let max = -200;

	let has_common_date = false;
	if (str_to_date(data[data.length - 1]['D']).getTime() > end_date.getTime()) {
		return [x, y, name, 0];
	}

	for (j = data.length - 1; j >= 0; j--) {
		data_y_point = data[j]['P'];
		date = data[j]['D'];
		let date_in_loop = str_to_date(date);
		if (date_in_loop.getTime() < common_date.getTime()) {
			continue;
		}

		if (date_in_loop.getTime() === common_date.getTime()) {
			has_common_date = true;
			y_0 = data[j]['P'];
		} else if (!has_common_date && date_in_loop.getTime() > common_date.getTime() && j + 1 < data.length) {
			if (fill_x) {
				x.push(date_to_str(common_date, true));
			}
			y.push(0);
			fill_holes(j, 0, x, y, common_date, date_to_str(date_in_loop, false), fill_x);
			has_common_date = true;
			y_0 = data[j + 1]['P'];
		} else if (!has_common_date && date_in_loop.getTime() > common_date.getTime() && j + 1 >= data.length) {
			has_common_date = true;
			y_0 = data[j]['P'];
		}

		if (date_in_loop > end_date) {
			break;
		}
		// if (y_0 == null) {
		// 	console.log('!!!!!! NULL', j, common_date, end_date, data);
		// }
		my_data = data_y_point / y_0;

		if (my_data > max) {
			max = my_data;
		}
		my_data = my_data - 1;

		y.push(my_data);

		if (fill_x) {
			x.push(date_to_str(date_in_loop, true)); ///-2000
		}

		if (j - 1 >= 0) {
			let next_date = data[j - 1]['D'];
			if (next_date > end_date) {
				next_date = end_date;
			}
			fill_holes(j, my_data, x, y, date_in_loop, next_date, fill_x);
		}
		last_loop_date = date_in_loop;
	}

	fill_holes(j, my_data, x, y, last_loop_date, date_to_str(end_date), fill_x);
	return [x, y, name, max];
}

export function extract_table_info(all_results) {
	let table_data = [];

	let fund_data;
	let mutual_data;

	let managment_fee;
	let var_fee;
	let truste_fee;
	let twelve_months;
	let year_yield;
	let month_yield;
	let daily_yield;
	let price;
	let std;

	let type;
	let subtype;
	let k = 0;
	for (k = 0; k < all_results.length; k++) {
		let relevant_info = {};
		type = all_results[k]['Type'];
		subtype = all_results[k]['Subtype'];

		fund_data = all_results[k];
		mutual_data = fund_data;

		managment_fee = mutual_data['ManagementFee'];
		var_fee = mutual_data['VariableFee'];
		truste_fee = mutual_data['TrusteeFee'];

		price = mutual_data['Price'];
		std = mutual_data['StandardDeviation'];

		if (type === Consts.TYPE_ID.SECURITY && subtype === Consts.SUB_TYPE_ID.STOCK) {
			managment_fee = 0;
			var_fee = 0;
			truste_fee = 0;

			price = mutual_data['Price'];
			std = mutual_data['StandardDeviation'];
		}

		relevant_info = {
			name: all_results[k]['Name'],
			id: all_results[k]['Id'],
			managment_fee: managment_fee,
			var_fee: var_fee,
			truste_fee: truste_fee,
			twelve_months: twelve_months,
			year_yield: year_yield,
			month_yield: month_yield,
			daily_yield: daily_yield,
			price: price,
			std: std,
		};

		table_data.push(relevant_info);
	}
	return table_data;
}
