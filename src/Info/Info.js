import React from 'react';



const requestOptions = {
    method: 'GET',
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Mobile Safari/537.36',
        'X-Maya-With': 'allow',
    },
};

try {
    let response = await fetch(fetch_string, requestOptions);
    let jsonData = await response.json();
    raw_data.push(jsonData);
} catch (err) {
    console.log('Erorr in fetch');
}

class Info extends React.Component {

    async fetch_fund(instrument) {
		var instrument_id = instrument['id'];
		var instrument_name = instrument['name'];
        var etf_url = 'https://mayaapi.tase.co.il/api/fund/details?fundId=5122007';
        var fund_url = 'https://api.tase.co.il/api/security/majordata?secId=1145978&compId=114&lang=1';
		var data = 'DateFrom=2017-12-31&DateTo=2020-12-07&FundId=' + instrument_id + '&Page=1&Period=0';

		let res = await this.fetch_data('POST', url, data, 'application/x-www-form-urlencoded');
		let json_res = JSON.parse(res);
		json_res.name = instrument_name;
		raw_data.push(json_res);
	}


    
	constructor(props) {
        super(props)
	}

	render() {
	    console.log("Funds info:", this.props.funds)
		return (
		    <div>
                <h2> Hey </h2>
			</div>
		);
	}
}
export default Info;
