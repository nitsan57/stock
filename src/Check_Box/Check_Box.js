import React from 'react';

export const CheckBox = (props) => {
	return (
		<div>
			<input
				key={props.id}
				onClick={props.handleCheckChieldElement}
				type="checkbox"
				checked={props.isChecked}
				value={props.value}
				onChange={(e) => {}}
			/>{' '}
			{props.value}
		</div>
	);
};

export default CheckBox;
