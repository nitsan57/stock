import React from 'react';
import Plot from 'react-plotly.js';
import Graph from '../graph/Graph'

class Search extends React.Component {

    constructor(props) {
        super(props)
        this.state = { 
          temp_search_keyword: "",
          search_keyword : "",
          is_data_loaded: false,
          is_button_pressed: false,
      };
      this.handleInputChange = this.handleInputChange.bind(this);
      this.searchButton = this.searchButton.bind(this);
      this.graphHandler = this.graphHandler.bind(this)
    }

    searchButton() {  

      this.setState({ search_keyword: this.state.temp_search_keyword });
      this.setState({ is_button_pressed: true });
  }

    handleInputChange(e) {
      const content = e.target.value;
      this.setState({ temp_search_keyword: content });
      console.log(content)
    }

    graphHandler() {
      this.setState({is_button_pressed: false})
    }

    render() {

      var first_date = "23/04/2020"
      var last_date = "23/09/2020"
      var instrument_id = "1148949"

      return (
      <div>
          <form>
          <input
            placeholder="Search for..."
            value={this.state.query}
            onChange={this.handleInputChange}
          />
        </form>
        <button onClick={this.searchButton}>plot!</button>
        <h1>Search</h1>
        <Graph first_date={first_date} last_date={last_date} instrument_id={this.state.search_keyword} graphHandler={this.graphHandler} is_button_pressed={this.state.is_button_pressed}/>
      </div>
      );
    }
}
export default Search;
