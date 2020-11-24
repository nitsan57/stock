import React from 'react';
import Graph from '../graph/Graph'
import Information from '../info-json';

class Search extends React.Component {

  constructor(props) {
      super(props)
      this.state = { 
        temp_search_keyword  :     "",
        search_keyword       :     "",
        is_data_loaded       :     false,
        is_button_pressed    :     false,
        to_add_plot          :     false,
        result               :     [],
        ids                  :     [],
        data                 :     Information
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.addSearch = this.addSearch.bind(this);
    this.graphHandler = this.graphHandler.bind(this)  

  }

    clearSearch() {  
      this.setState({ search_keyword: this.state.temp_search_keyword });
      this.setState({ is_button_pressed: true });
  }

    addSearch() {  
      console.log("addSearch: ", this.state.temp_search_keyword)
      this.setState({ search_keyword: this.state.temp_search_keyword });
      this.setState({ is_button_pressed: true });
      this.setState({ to_add_plot: true });
      const filteredData = this.state.data.filter(item => {
          return Object.keys(item).some(key => item[key].toLowerCase().includes(this.state.search_keyword));
      })
      this.setState({
          result:filteredData
      })
      var ids = []
      filteredData.forEach((item) => {
          ids.push(item["מס' קרן"])
      });
      this.setState({ids:ids})
      console.log("ids:",ids)
  }

    handleInputChange(e) {
      
      const content = e.target.value;
      console.log("handkeInputChange: content", content)
      this.setState({ temp_search_keyword: content });
    }

    graphHandler() {
      this.setState({ is_button_pressed: false})
      this.setState({ to_add_plot: false });
      setTimeout(function() { //Start the timer
        this.setState({render: true}) //After 1 second, set render to true  //TODO: LAME
    }.bind(this), 500)
    }

    render() {

      var first_date = "23/04/2020"
      var last_date = "23/09/2020"

      return (
      <div>
          <form>
          <input
            placeholder="Search for..."
            value={this.state.query}
            onChange={this.handleInputChange}
          />
        </form>
        <button onClick={this.clearSearch}>new plot!</button>
        <button onClick={this.addSearch}> add plot!</button>
        <h1>Search</h1>
        <Graph first_date={first_date} last_date={last_date} instrument_id={this.state.ids} graphHandler={this.graphHandler} is_button_pressed={this.state.is_button_pressed} to_add_plot={this.state.to_add_plot}/>
      </div>
      );
    }
}
export default Search;
