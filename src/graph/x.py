from datetime import date

from pymaya.maya import Maya


def main():
    maya = Maya()
    # all_securities = maya.get_all_securities()
    # print(all_securities)

    maya.get_details("1145978")
    historical_prices = maya.get_price_history(
        security_id="1145978", from_data=date(2017, 12, 31))
    for fund_object in historical_prices:
        pass
    # print(fund_object)


if __name__ == "__main__":
    main()
