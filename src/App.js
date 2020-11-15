import React from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
class App extends React.Component {
  constructor(){  
    super();  
    this.state = {  
        message: "Click me!",
        data : {x: [1,2,3,4], y : [1,2,3,4]}
    };
    this.updateMessage = this.updateMessage.bind(this);
    // this.read_csv();
    this.Auth();
  }

  Auth() {
    // Simple POST request with a JSON body using fetch
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'React POST Request Example' })
    };
    fetch("https://openapigw.tase.co.il/tase/prod/oauth/oauth2/NjViMGRjZjNiN2VjNDIyMDgwYzIwMTU0MmI1ZWE0ODU6MzlmMzVlM2MyYmEzNmJiMjA3ODA3ODkxNjQ5N2ZkYTI=", requestOptions)
        .then(response => response.json())
        .then(data => console.log(data)
        );
}

    // read_csv(){
    //         //Papa.parse("https://cors-anywhere.herokuapp.com/https://www.globes.co.il/portal/instrument/instrumentgraph_toexcel.aspx?instrumentid=981&feeder=0", {
    //   var reader = new FileReader();

    //   reader.readAsText("/Data/1146430.csv");
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
    return (
      <div>  
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
}

export default App;
