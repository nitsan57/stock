import plotly.graph_objects as go
import numpy as np
import pandas
import re
# import plotly.express as px


def main():
    # get all csv of מכשירים עוקבי מדד  or other categories
    # add buttons
    data_lists = ["1148774.csv", "1146430.csv", "1148949.csv"]

    data_file = pandas.read_csv(data_lists[0], skiprows=2)
    x = data_file.iloc[:, 0]  # dates
    y = data_file.iloc[:, 1]  # index score
    y = y/y[0]
    print(data_file.iloc[:, 1])
    # fig = px.line(x=x, y=y)
    fig = go.Figure(data=go.Scatter(x=x,
                                    y=y, mode='lines+markers'))

    for f_name in data_lists[1:]:
        data_file = pandas.read_csv(f_name, skiprows=2)
        x = data_file.iloc[:, 0]
        y = data_file.iloc[:, 1]
        print(y[0:2])
        y = y/y[0]
        # print(y[0])
        print(y[0:2])
        fig = fig.add_scatter(x=x, y=y)

    fig.show()


if __name__ == "__main__":
    main()
