import React from 'react';

class Fund_Display extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {		
        return (
            <div>
                <h1>שם: {this.props.name}</h1>
                <h2> 
                     מספר: {this.props.id} 
                     דמי ניהול: {this.props.managment_fee ? this.props.managment_fee : 0}
                     דמי הפצה: {this.props.var_fee ? this.props.var_fee : 0}
                     דמי נאמנות: {this.props.truste_fee ? this.props.truste_fee : 0}
                 </h2>
            </div>
    )}
}

export default Fund_Display;