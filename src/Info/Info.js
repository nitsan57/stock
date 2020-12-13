import React from 'react';
import {fetch_data} from '../Utils'

class Info extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			data: [],
			is_data_loaded: false,
		};
	}

    async fetch_fund() {
		var url      = ''
        var etf_url  = 'https://mayaapi.tase.co.il/api/fund/details?fundId=';
		var fund_url = 'https://api.tase.co.il/api/security/majordata?secId=';
		var fund_id  = ''
		var result;

		let k; for (k = 0; k < this.props.funds.length; k++) {
			console.log("!!!!!!!!", this.props.funds, k)
            fund_id = String(this.props.funds[k]["id"])
		    if (fund_id[0] == "5") {
                url = etf_url + fund_id 
			} else {
                url = fund_url + fund_id + "&compId="+fund_id.substr(0,3)+"&lang=1"
			}
            console.log("fetch_fund: url:", url)
			result = await fetch_data("GET", url, "", 'application/x-www-form-urlencoded')
			console.log("fetch fund result:", result);
			this.setState({is_data_loaded:true})

		}	
	}

	componentDidUpdate(prevProps) {
		if (this.props.funds !== prevProps.funds) {
			this.fetch_fund()
		}
	}

	render() {
		console.log("Funds info:", this.props.funds)
		if (this.state.is_data_loaded) {
		    return (
		        <div>
                    <h2> Loaded </h2>
			    </div>
		    );
		} else {
			return (
			    <div>
			        <h2> Not loaded </h2>
		        </div>
			);
		} 
	}
}

export default Info;
