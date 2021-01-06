import { fetch_data } from '../utils/Utils';
import * as Consts from '../utils/Consts';
import Information from '../info-json';

const tase_info = Information;

async function keep_relevant_data(funds) {
	var url = '';
	var fund_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId=';
	var etf_url = 'https://mayaapi.tase.co.il/api/etf/details?fundId=';
	var securty_url = 'https://api.tase.co.il/api/company/securitydata?securityId=';
	var fund_id = '';
	let type;
	let subtype;
	let subid;
	let keep_info = [];
	let k;
	let all_results = [];
	for (k = 0; k < funds.length; k++) {
		type = String(funds[k]['type']);
		subtype = String(funds[k]['subtype']);
		subid = String(funds[k]['SubId']);
		fund_id = String(funds[k]['id']);

		if (fund_id[0] === '5') {
			url = fund_url + fund_id;
		} else if (
			subid === '001779' ||
			(type === '1' && subtype === '1') ||
			subtype === Consts.SUB_TYPE_ID.ABROAD_FUND ||
			subtype === Consts.SUB_TYPE_ID.ABROAD_BOND
		) {
			url = securty_url + fund_id;
		} else {
			url = etf_url + fund_id;
		}

		keep_info.push({
			type: type,
			subtype: subtype,
			name: funds[k]['name'],
			id: funds[k]['id'],
		});
		all_results.push(fetch_data('GET', url, '', 'application/x-www-form-urlencoded'));
	}

	all_results = await Promise.allSettled(all_results);
	let fund_l = [];
	let i;
	for (i = 0; i < all_results.length; i++) {
		fund_l.push(JSON.parse(all_results[i].value));
	}
	return [fund_l, keep_info]; // to wait one time only
}

export async function search(search_keyword, fund_set, imitating, leveraged, short, normal_stock, today) {
	let fund_l;
	const filteredData = tase_info.filter((item) => {
		var res = Object.keys(item).some((key) => String(item[key]).toLowerCase().includes(search_keyword));

		return res;
	});

	var temp_fund = null;
	let funds_arr = [];
	let keep_info = [];
	filteredData.forEach((item) => {
		temp_fund = { name: item['Name'], id: item['Id'], type: item['Type'], subtype: item['SubType'] };
		if (
			temp_fund.type == Consts.TYPE_ID.OPTIONS ||
			temp_fund.type == Consts.TYPE_ID.COMP_PAGE ||
			temp_fund.type == Consts.TYPE_ID.MANAGER ||
			temp_fund.subtype == Consts.SUB_TYPE_ID.NON_EXISTS ||
			temp_fund.subtype == Consts.SUB_TYPE_ID.BOND
		) {
		} else {
			fund_set.add(JSON.stringify(temp_fund));
		}
	});

	if (filteredData.length === 0) {
		return -1;
	}

	for (var it = fund_set.values(), val = null; (val = it.next().value); ) {
		funds_arr.push(JSON.parse(val));
	}

	[fund_l, keep_info] = await keep_relevant_data(funds_arr);

	let new_fund_list = [];
	let new_info_list = [];
	let raw_ix = 0;
	let mutual_data;
	let etf_data;
	let fund_data;
	let type;
	let subtype;
	let init_date;
	let max_date = '12/12/2015';
	let min_days = 365 * 5;
	// let bond_fund;
	for (raw_ix = 0; raw_ix < fund_l.length; raw_ix++) {
		fund_data = fund_l[raw_ix];
		type = keep_info[raw_ix]['type'];
		subtype = keep_info[raw_ix]['subtype'];
		// bond_fund = String(fund_data['MagnaFundType']);

		if (
			(type === Consts.TYPE_ID.SECURITY && subtype !== Consts.SUB_TYPE_ID.STOCK) ||
			type === Consts.TYPE_ID.FUND // agah filter && bond_fund !== Consts.MAGNA_TYPE.BOND
		) {
			etf_data = fund_data['ETFDetails'];
			if (etf_data === undefined) {
				mutual_data = fund_data;
			} else {
				mutual_data = etf_data['FundDetails'];
			}

			init_date = mutual_data['ProspectusPubDate'];
			if (init_date > max_date) {
				max_date = init_date;
			}

			if (subtype === Consts.SUB_TYPE_ID.ABROAD_FUND || subtype === Consts.SUB_TYPE_ID.ABROAD_BOND) {
				mutual_data.FundIndicators = {
					[Consts.TASE_TYPES.IMITATING]: { Value: true },
					[Consts.TASE_TYPES.SHORT]: { Value: false },
					[Consts.TASE_TYPES.LEVERAGED]: { Value: false },
				};
			}

			if (mutual_data['FundIndicators'][Consts.TASE_TYPES.SHORT]['Value']) {
				// short behaves differnet since it is leveraged
				mutual_data['FundIndicators'][Consts.TASE_TYPES.LEVERAGED]['Value'] = false;
			}

			if (
				(mutual_data['FundIndicators'][Consts.TASE_TYPES.IMITATING]['Value'] && !imitating) ||
				(mutual_data['FundIndicators'][Consts.TASE_TYPES.LEVERAGED]['Value'] && !leveraged) ||
				(mutual_data['FundIndicators'][Consts.TASE_TYPES.SHORT]['Value'] && !short)
			) {
				continue;
			}

			new_fund_list.push(fund_data);
			new_info_list.push(keep_info[raw_ix]);
		} else if (type === Consts.TYPE_ID.SECURITY && subtype === Consts.SUB_TYPE_ID.STOCK) {
			if (!normal_stock) {
				continue;
			}
			init_date = '12/12/2010';

			if (init_date > max_date) {
				max_date = init_date;
			}
			new_fund_list.push(fund_data);
			new_info_list.push(keep_info[raw_ix]);
		}
	}
	let date1 = new Date(max_date);
	let date2 = new Date(today);
	let diffTime = Math.abs(date2 - date1);
	min_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return [min_days, new_fund_list, new_info_list];
}

function fetch_fund(today, instrument, raw_data, min_days) {
	let year = today.split('-')[0];
	let before_5 = today.replace(year, year - 5);
	var instrument_id = instrument['id'];
	var url = 'https://mayaapi.tase.co.il/api/download/fundhistory';
	var data = 'DateFrom=' + before_5 + '&DateTo=' + today + '&FundId=' + instrument_id;
	let res = fetch_data('POST', url, data, 'application/x-www-form-urlencoded');
	raw_data.push(res);
}

function fetch_security(today, instrument, raw_data, min_days) {
	let year = today.split('-')[0];
	let before_5 = today.replace(year, year - 5);
	var instrument_id = instrument['id'];
	var url = 'https://api.tase.co.il/api/ChartData/ChartData/';

	let data =
		'?ct=1&ot=1&lang=1&cf=0&cp=5&cv=0&cl=0&cgt=1&' +
		'dFrom=' +
		before_5 +
		'&dTo=' +
		today +
		'&oid=' +
		instrument_id;
	url = url + data;

	let res = fetch_data('GET', url, data, 'application/x-www-form-urlencoded');
	raw_data.push(res);
}

export function get_instrument_chart_data(today, instruments, raw_data, min_days) {
	let i;
	let instrument;
	let add_len = raw_data.length;

	for (i = add_len; i < instruments.length; i++) {
		instrument = instruments[i];
		var instrument_id = instrument['id'];
		if (String(instrument_id)[0] === '1' || (instrument['type'] === '1' && instrument['subtype'] === '1')) {
			fetch_security(today, instrument, raw_data, min_days);
		} else {
			fetch_fund(today, instrument, raw_data, min_days);
		}
	}
}

export function extract_chart_length(instrument_data) {
	let data = instrument_data['Data'];
	if (data === undefined) {
		data = instrument_data['PointsForHistoryChart'];
	}
	return data.length;
}

export function extract_chart_point(x, y, instruments, data_array, min_data_length, start_date, i) {
	let value;
	let name;
	let j;
	let data_y_point;
	let y_0;
	let my_data;
	let date;
	let year;
	var month;
	var day;

	value = data_array[i];
	let data = value['Data'];
	if (data === undefined) {
		data = value['PointsForHistoryChart'];
	}
	name = instruments[i]['name'];
	y = [];
	var rate;
	for (j = min_data_length - 1; j >= start_date; j--) {
		data_y_point = data[j]['ClosingRate'];
		rate = 'ClosingRate';
		if (data_y_point === undefined) {
			data_y_point = data[j]['PurchasePrice'];
			rate = 'PurchasePrice';
		}
		y_0 = data[min_data_length - 1][rate];
		my_data = data_y_point / y_0;
		y.push(my_data - 1);
		if (i === 0) {
			date = data[j]['TradeDate'].substring(0, 10).split('-');
			if (date.length === 1) {
				x.push(date[0]);
			} else {
				year = date[0];
				month = date[1];
				day = date[2];
				x.push(day + '/' + month + '/' + year);
			}
		}
	}
	return [x, y, name];
}

export function extract_table_info(keep_info, all_results) {
	let table_data = [];

	let fund_data;
	let etf_data;
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
		type = keep_info[k]['type'];
		subtype = keep_info[k]['subtype'];

		fund_data = all_results[k];
		etf_data = fund_data['ETFDetails'];
		if (etf_data === undefined) {
			managment_fee = fund_data['ManagementFee'];
			mutual_data = fund_data;
		} else {
			mutual_data = etf_data['FundDetails'];
		}
		managment_fee = mutual_data['ManagementFee'];
		var_fee = mutual_data['VariableFee'];
		truste_fee = mutual_data['TrusteeFee'];
		twelve_months = mutual_data['Last12MonthYield'];
		year_yield = mutual_data['YearYield'];
		month_yield = mutual_data['MonthYield'];
		daily_yield = mutual_data['DayYield'];
		price = mutual_data['UnitValuePrice'];
		std = mutual_data['StandardDeviation'];

		if (type === '1' && subtype === '1') {
			managment_fee = 0;
			var_fee = 0;
			truste_fee = 0;
			twelve_months = mutual_data['Last12MonthYield'];
			year_yield = mutual_data['AnnualYield'];
			month_yield = mutual_data['MonthYield'];

			price = mutual_data['BaseRate'];
			std = mutual_data['StandardDeviation'];
			daily_yield = 'שינוי אחרון: ' + mutual_data['Change'];
		}

		relevant_info = {
			name: keep_info[k]['name'],
			id: keep_info[k]['id'],
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

		// if (this.state.info.some((e) => e.id === relevant_info['id'])) {
		// 	// console.log('Some Error in info.js');
		// 	continue;
		// } else {
		table_data.push(relevant_info);
		// }
	}
	return table_data;
}
