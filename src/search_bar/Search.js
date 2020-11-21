import React from 'react';
import Plot from 'react-plotly.js';


class Search extends React.Component {

    constructor(props) {
        super(props)
        this.state = {  

          is_data_loaded: false
      };
    }
   
    get_options(url) {
        var options = { 
          method: 'GET',
          url: url,
          headers: { 
            accept: 'application/json',
            'accept-language': 'he-IL',
            authorization: "Bearer " + this.props.token_data.access_token
          } 
        };
        return options
    }
    // TODO avoid code reuse
    get_indices_list() { // Unlimited api  
        var request = require("request");
        var options = this.get_options("https://openapigw.tase.co.il/tase/prod/api/v1/basic-indices/indices-list")
      
        console.log("get_indices_list options:", options)
        request(options, function (error, response, body) {
            if (error) return console.error('get_indices_list Failed: %s', error.message);
            console.log('get_indices_list Success: ', body);
        });
    }

    get_securities_types = () => { // 100 calls per hour
      var request = require("request");
      var options = this.get_options("https://openapigw.tase.co.il/tase/prod/api/v1/basic-securities/securities-types")
    
      console.log("get_securities_types options:", options)
      request(options, function (error, response, body) {
          if (error) return console.error('get_securities_types Failed: %s', error.message);
          console.log('get_securities_types Success: ', body);
      });
    }

    get_companies_list = () => { // 100 calls per hour
      var request = require("request");
      var options = this.get_options("https://openapigw.tase.co.il/tase/prod/api/v1/basic-securities/companies-list")
    
      console.log("get_companies_list options:", options)
      request(options, function (error, response, body) {
          if (error) return console.error('get_companies_list Failed: %s', error.message);
          console.log('get_companies_list Success: ', body);
      });
    } 

    trade_securities_list = (month, year, day) => { // 100 calls per hour
      var request = require("request");
      var options = this.get_options("https://openapigw.tase.co.il/tase/prod/api/v1/basic-securities/trade-securities-list/"+year+"/"+month+"/"+day)
      console.log("trade_securities_list options:", options)
      request(options, function (error, response, body) {
          if (error) return console.error('get_companies_list Failed: %s', error.message);
          console.log('trade_securities_list Success: ', body);
      });
    }

    delisted_securities_list = (month, year, day) => { // 100 calls per hour
      var request = require("request");
      var options = this.get_options("https://openapigw.tase.co.il/tase/prod/api/v1/basic-securities/delisted-securities-list/"+year+"/"+month+"/"+day)
      console.log("delisted_securities_list options:", options)
      request(options, function (error, response, body) {
          if (error) return console.error('get_companies_list Failed: %s', error.message);
          console.log('delisted_securities_list Success: ', body);
      });
    }

    render() {
      console.log("rnder token_data:",this.props.token_data)
      this.get_indices_list()
      this.get_securities_types()
      this.get_companies_list()
      return (
      <h1>Search</h1>
      );
    }
}
export default Search;
