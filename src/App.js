import React from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
// import FetchData from 'fetch_data/FetchData.js';
import Search from './search_bar/Search'

class App extends React.Component {
  constructor(){  
    super();  
    this.state = {  
        message: "Click me!",
        data: {x: [1,2,3,4], y : [1,2,3,4]},
        token_data: "",
        is_token_loaded: false
    };
    this.updateMessage = this.updateMessage.bind(this);

    // this.read_csv();
  }

  componentDidMount() {

    let body_details = {
      'grant_type': 'client_credentials',
      'scope': 'tase'
  };

  let formBody = [];
  for (let property in body_details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(body_details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  console.log("componentDidMount formBody:", formBody)
  const requestOptions = {
      method: 'POST',
      headers: {
          "Authorization":"Basic NjViMGRjZjNiN2VjNDIyMDgwYzIwMTU0MmI1ZWE0ODU6MzlmMzVlM2MyYmEzNmJiMjA3ODA3ODkxNjQ5N2ZkYTI",
          "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody
  };
  fetch("https://openapigw.tase.co.il/tase/prod/oauth/oauth2/token",requestOptions)
      .then(response => response.json())
      .then(data => {
          this.setState({ token_data: data})
          console.log("componentDidanount token_data:", data)
      }
      );
      this.setState({is_token_loaded:true})
}


    // read_csv(){
    //         //Papa.parse("https://cors-anywhere.herokuapp.com/https://www.globes.co.il/portal/instrument/instrumentgraph_toexcel.aspx?instrumentid=981&feeder=0", {

    //   // var  x= new File(['foo', 'bar'], "/Data/1146430.csv");
      
    //   console.log(reader);

    //     Papa.parse(reader, {
    //     download: true,
    //     complete: function(results) {
    //       console.log(results);
    //       console.log(results.data[4]);
    //     }
    //   });
    // }

    updateMessage() {  
      this.setState({  
          message: "dick"  
      });
  }
   

  render() {

    if (this.state.is_token_loaded) {
      return (
        <div>
        <Search token_data={this.state.token_data} />  
        <Plot
          data={[
            {
              x: this.state.data.x,
              y: this.state.data.y,
              type: 'scatter',
              mode: 'lines+markers',
              marker: {color: 'red'},
            },
          ]}
          layout={ {title: 'A Fancy Plot'} }
        />
         <h1>Hello {this.state.message}!</h1>  
         <button onClick={this.updateMessage}>Click me!</button>  
       </div>    
      );
    }
    return (
        <h1> Loading... </h1>  
    )
  }
}
    
export default App;
