import React from 'react';
import Plot from 'react-plotly.js';
import Search from './search_bar/Search'
// import Graph from './graph/Graph'


class App extends React.Component {
  constructor(){  
    super();  
    this.state = {  
        message: "Click me!",
        data: {x: [1,2,3,4], y : [1,2,3,4]},
        is_token_loaded: false
    };
    this.updateMessage = this.updateMessage.bind(this);

    // this.read_csv();
  }

  componentDidMount() {

}

    updateMessage() {  

      this.setState({  
          message: "dick"  
      });
  }
   

  render() {


      return (
        <div>
        <Search/>  
         <h1>Hello {this.state.message}!</h1>  
         <button onClick={this.updateMessage}>Click me!</button>  
       </div>    
      );
    return (
        <h1> Loading... </h1>  
    )
  }
}
    
export default App;
