import React from 'react';

export const CheckBox = (props) => {
	return (
		<div  key={props.idkey}>
      {props.value}
      {' '}
			<input
				onClick={props.handleCheckChieldElement}
				type="checkbox"
				checked={props.isChecked}
				value={props.value}
				onChange={(e) => {}}
			/>
			
		</div>
	);
};

export default CheckBox;
