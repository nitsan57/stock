import { fetch_data } from '../utils/Utils';
import * as Consts from '../utils/Consts';
// import Information from '../info-json';
import Information from '../new';

const tase_info = Information;

export async function search(search_keyword, imitating, leveraged, short, normal_stock, today) {
	const filteredData = tase_info.filter(
		function (item) {
			if (
				this.count < Consts.NUM_SEARCH_ELEMENTS_LIMIT &&
				Object.keys(item).some((key) => String(item[key]).toLowerCase().includes(search_keyword))
			) {
				let fund_data = item;
				let type = item['Type'];
				let subtype = item['SubType'];
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

	var temp_fund = null;
	if (filteredData.length === 0) {
		return -1;
	}
	let fund_l = [];
	let keep_info = [];
	filteredData.forEach((item) => {
		temp_fund = { name: item['Name'], id: item['Id'], type: item['Type'], subtype: item['SubType'] };
		fund_l.push(item);
		keep_info.push(temp_fund);
		// fund_set.add(JSON.stringify(temp_fund));
	});

	return [fund_l, keep_info];
}

function fetch_fund(today, instrument, raw_data) {
	let year = today.split('-')[0];
	let before_5 = today.replace(year, year - 5);
	var instrument_id = instrument['id'];
	var url = 'https://mayaapi.tase.co.il/api/download/fundhistory';
	var data = 'DateFrom=' + before_5 + '&DateTo=' + today + '&FundId=' + instrument_id;
	let res = fetch_data('POST', url, data, 'application/x-www-form-urlencoded');
	raw_data.push(res);
}

function fetch_security(today, instrument, raw_data) {
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

export function get_instrument_chart_data(today, instruments, raw_data) {
	let i;
	let instrument;
	let add_len = raw_data.length;

	for (i = add_len; i < instruments.length; i++) {
		instrument = instruments[i];
		var instrument_id = instrument['id'];
		if (String(instrument_id)[0] === '1' || (instrument['type'] === '1' && instrument['subtype'] === '1')) {
			fetch_security(today, instrument, raw_data);
		} else {
			fetch_fund(today, instrument, raw_data);
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

		table_data.push(relevant_info);
	}
	return table_data;
}
