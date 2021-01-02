import { fetch_data } from '../Utils/Utils';
import * as Consts from '../Utils/Consts';
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

		if (
			type === '5' ||
			type === '7' ||
			type === Consts.TYPE_ID.MANAGER ||
			subtype === Consts.SUB_TYPE_ID.NON_EXISTS ||
			subtype === Consts.SUB_TYPE_ID.BOND
		) {
			continue;
		}
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

export async function search(search_keyword, fund_set, imitating, leveraged, short, normal_stock) {
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
		fund_set.add(JSON.stringify(temp_fund));
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
			new_fund_list.push(fund_data);
			new_info_list.push(keep_info[raw_ix]);
		}
	}
	return [new_fund_list, new_info_list];
}
