from requests.structures import CaseInsensitiveDict
from datetime import date

from pymaya.maya import Maya

import requests
import json
import re

TYPE_SECURITY = '1'
TYPE_INDEX = '2'
TYPE_FUND = '4'
TYPE_MANAGER = '10'
TYPE_OPTIONS = '7'

TYPE_COMP_PAGE = '5'

SUB_TYPE_STOCK = '1'
SUB_TYPE_OPTIONS = '2'
SUB_TYPE_LOAN = '8'  # מק''מ
SUB_TYPE_BUY_OPTIONS = '13'

SUB_TYPE_BOND_TRADE = '3'
SUB_TYPE_BOND_GOV = '4'
SUB_TYPE_INCLUDE = '12'
SUB_TYPE_UNKNOWN = '41'
# SUB_TYPE_INDEX = '42'

SUB_TYPE_ABROAD_FUND = '44'
SUB_TYPE_ABROAD_BOND = '45'
SUB_TYPE_BOND = '5'
SUB_TYPE_NON_EXISTS = '991'


IMITATING = 4
LEVERAGED = 3
SHORT = 5


def req(f_id, f_type, f_subtype, f_sub_id):

    fund_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId='
    etf_url = 'https://mayaapi.tase.co.il/api/etf/details?fundId='
    securty_url = 'https://api.tase.co.il/api/company/securitydata?securityId='

    headers = CaseInsensitiveDict()
    headers["Cache-Control"] = "no-cache"
    headers["X-Maya-With"] = "allow"
    headers["Accept-Language"] = "heb-IL"

    if (
        f_sub_id == '001779' or
        (f_type == TYPE_SECURITY and f_subtype == SUB_TYPE_STOCK) or
        f_subtype == SUB_TYPE_ABROAD_FUND or
        f_subtype == SUB_TYPE_ABROAD_BOND
    ):

        # if (f_id[0] == '5'):
        #     url = fund_url + f_id
        # elif (
        #     f_sub_id == '001779' or
        #     (f_type == TYPE_SECURITY and f_subtype == SUB_TYPE_STOCK) or
        #     f_subtype == SUB_TYPE_ABROAD_FUND or
        #     f_subtype == SUB_TYPE_ABROAD_BOND
        # ):
        url = securty_url + f_id
    elif (f_id[0] == '5'):
        url = fund_url + f_id
    else:
        url = etf_url + f_id

    resp = requests.get(url, headers=headers)

    try:
        resp.json()
    except:
        print(f_id, f_type, f_subtype, f_sub_id)

    return resp.json()


def fix_index_names(name):
    bad_vars = ["AlphaBeta", "NTR", "RT", "GTR",
                "Value", "INDEX", "Select", "Sector", "ENTREPRISES"]

    index = name.replace("\"", "")
    index = index.replace("-", " ")
    for bad in bad_vars:
        index = index.replace(" "+bad, " ")

    index = re.sub(' +', ' ', index)
    if index[-1] == " ":
        index = index[:-1]
    return index


def prepare_data(fund_data, f_id, f_type, f_subtype, f_sub_id):
    # agah filter and bond_fund != = Consts.MAGNA_TYPE.BOND
    mutual_data = fund_data
    if ((f_type == TYPE_SECURITY and f_subtype != SUB_TYPE_STOCK) or f_type == TYPE_FUND):
        etf_data = fund_data.get('ETFDetails', None)
        # etf_data = fund_data['ETFDetails']
        if (etf_data is None):
            managment_fee = fund_data.get('ManagementFee', None)
            mutual_data = fund_data
        else:
            mutual_data = etf_data['FundDetails']
        managment_fee = mutual_data.get('ManagementFee', None)

        # init_date = mutual_data['ProspectusPubDate']

        if (f_subtype == SUB_TYPE_ABROAD_FUND or f_subtype == SUB_TYPE_ABROAD_BOND):
            mutual_data['FundIndicators'] = {
                'IMITATING': True,
                'SHORT': False,
                'LEVERAGED': False,
            }

            if (mutual_data['FundIndicators']['SHORT']):
                # short behaves differnet since it is leveraged
                mutual_data['FundIndicators']['LEVERAGED'] = False

    managment_fee = mutual_data.get('ManagementFee', None)
    var_fee = mutual_data.get('VariableFee', None)
    truste_fee = mutual_data.get('TrusteeFee', None)
    # twelve_months = mutual_data['Last12MonthYield']
    # year_yield = mutual_data['YearYield']
    # month_yield = mutual_data['MonthYield']
    # daily_yield = mutual_data['DayYield']
    price = mutual_data.get('UnitValuePrice', None)
    std = mutual_data.get('StandardDeviation', None)

    if (f_type == TYPE_SECURITY and f_subtype == SUB_TYPE_STOCK):
        managment_fee = 0
        var_fee = 0
        truste_fee = 0
        # twelve_months = mutual_data['Last12MonthYield']
        # year_yield = mutual_data['AnnualYield']
        # month_yield = mutual_data['MonthYield']

        price = mutual_data.get('BaseRate', None)
        std = mutual_data.get('StandardDeviation', None)
        # daily_yield = 'שינוי אחרון: ' + mutual_data['Change']
    name = ''
    try:
        name = fund_data['Name']
    except:
        name = mutual_data['FundLongName']

    name = name.replace("\"", "")
    name = name.replace("S&P500", "S&P 500")

    name = name.replace("-", " ")
    name = re.sub(' +', ' ', name)
    # print(mutual_data)
    if mutual_data.get('FundIndicators', None) != None and type(mutual_data.get('FundIndicators', None)) == list:
        mutual_data['FundIndicators'] = {
            'IMITATING': mutual_data['FundIndicators'][IMITATING]['Value'],
            'SHORT': mutual_data['FundIndicators'][SHORT]['Value'],
            'LEVERAGED': mutual_data['FundIndicators'][LEVERAGED]['Value']}

    index = "תא 35"
    # if f_id.find("1150416") != -1:
    #     print(mutual_data)
    #     print(mutual_data['AssetRisk'])

    try:
        index = mutual_data['AssetRisk'][0]['AssetName']
        index = fix_index_names(index)
        print(index)

    except:
        pass

    relevant_info = {
        'Name': name,
        'Id': f_id,
        'Type': f_type,
        'SubType': f_subtype,
        'ManagementFee': managment_fee,
        # 'init_data': init_date,
        'VariableFee': var_fee,
        'TrusteeFee': truste_fee,
        'FundIndicators': mutual_data.get('FundIndicators', None),
        # 'Last12MonthYield': twelve_months,
        # 'YearYield': year_yield,
        # 'MonthYield': month_yield,
        # 'DayYield': daily_yield,
        'Price': price,
        'StandardDeviation': std,
    }
    return relevant_info, index


def main():
    maya = Maya()
    all_securities = maya.get_all_securities()
    info = []
    # print(all_securities)
    indices = dict()

    for sec in all_securities:
        f_id = sec['Id']
        f_type = str(sec['Type'])
        f_subtype = str(sec['SubType'])
        f_sub_id = str(sec['SubId'])

        if (f_type == TYPE_OPTIONS or f_subtype == SUB_TYPE_LOAN or f_subtype == SUB_TYPE_BUY_OPTIONS or f_subtype == SUB_TYPE_UNKNOWN or f_subtype == SUB_TYPE_BOND_GOV or f_subtype == SUB_TYPE_OPTIONS or f_subtype == SUB_TYPE_BOND_TRADE or f_subtype == SUB_TYPE_INCLUDE or f_type == TYPE_INDEX or f_type == TYPE_COMP_PAGE or f_type == TYPE_MANAGER or f_subtype == SUB_TYPE_NON_EXISTS or f_subtype == SUB_TYPE_BOND):
            continue

        x = req(f_id, f_type, f_subtype, f_sub_id)
        fund_data, index = prepare_data(x, f_id, f_type, f_subtype, f_sub_id)

        if index in indices:
            indices[index] = indices[index] + 1
        else:
            indices[index] = 0

        info.append(fund_data)

    indices = sorted(indices, key=indices.get, reverse=True)
    info = sorted(info, key=lambda k: (
        k['ManagementFee'] if k['ManagementFee'] is not None else 0))

    filterd_indices = []

    for index in indices:  # filter indices with etfs
        for info_data in info:
            if info_data["Name"].find(index) != -1:
                filterd_indices.append(index)
                break

    with open('new.js', 'w', encoding='utf-8') as fout:
        fout.write("export const Information = ")
        json.dump(info, fout, indent=2, ensure_ascii=False)
        fout.write("; \n ")
        # fout.write("; \n export default Information; \n")

        fout.write("export const Indices = ")
        json.dump(filterd_indices, fout, indent=2, ensure_ascii=False)
        fout.write(";")
        # fout.write("; \n export default Indices; ")


if __name__ == "__main__":
    main()
