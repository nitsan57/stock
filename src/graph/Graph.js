import React from 'react';
import Plot from 'react-plotly.js';

class Graph extends React.Component {

  constructor(props){  
    super(props);  
    this.state = {  
        data: {x: [1,2,3,4], y : [1,2,3,4]},
        is_data_loaded : false,
    };
    // this.get_intrument_data = this.get_intrument_data.bind(this);

  }

  componentDidMount() {

  //   let body_details = {
  //     'grant_type': 'client_credentials',
  //     'scope': 'tase'
  // };
  }
  

  get_intrument_data(first_date, last_date, instrument_id){

    var i;
    var x = []
    var y = []

  const requestOptions = {
    method: 'GET',
    headers: {
      "Accept"       : "application/json",
      "Content-Type" : "application/json",
      "User-Agent"   : "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0" },
};

    fetch("https://api.tase.co.il/api/ChartData/ChartData/?ct=1&ot=1&lang=1&cf=0&cp=4&cv=0&cl=0&cgt=1&dFrom="+first_date+"&dTo="+last_date+"&oid="+instrument_id, requestOptions).then(response => response.json())
    .then((jsonData) => {
    // jsonData is parsed json object received from url
    var points_for_chart = jsonData["PointsForHistoryChart"]
    var y_0 = points_for_chart[0]["ClosingRate"]
    for (i = 0; i < points_for_chart.length; i++) {
      var my_data = points_for_chart[i]["ClosingRate"] / y_0;
      y.push(my_data)
      x.push(i)
    }
    this.setState({data : {"x": x, "y": y}})
    
    })
    .catch((error) => {
    // handle your errors here
    console.error(error)
    })
    this.setState({data : {"x": x, "y": y}})
    
    this.setState({is_data_loaded : true})
  }

  render() {
    console.log(this.props)
    if (this.props.is_button_pressed){
      this.setState({is_data_loaded : false})
        var first_date = this.props.first_date
        var last_date = this.props.last_date
        var instrument_id = this.props.instrument_id
        this.get_intrument_data(first_date,last_date,instrument_id);
        this.props.graphHandler();
  }
  if ((this.state.is_data_loaded)){
    return (
      <Plot
        data={[
          {
            x: this.state.data.x,
            y: this.state.data.y,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          // {
          //   x: this.state.data.x,
          //   y: this.state.data.y,
          //   type: 'scatter',
          //   mode: 'lines+markers',
          //   marker: {color: 'yellow'},
          // },
        ]}
        layout={ {width: 800, height: 600, title: 'A Crazy Plot'} }
      />
    );
      }
      return (<h1>Loading...</h1>);
  }
}
export default Graph;
