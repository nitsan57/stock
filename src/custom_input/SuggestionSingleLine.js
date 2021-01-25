import React from 'react';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Plus from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Button from 'react-bootstrap/Button';

export default function SuggestionSingleLine(props) {
	return (
		<div
			style={{
				marginLeft: '30%',
				display: 'flex',
				width: '60%',
			}}
		>
			<Tooltip title={props.text_lang.SEARCH.ADD_TO_GRAPH}>
				<IconButton
					color="primary"
					style={{ padding: 2 }}
					aria-label="search"
					onMouseDown={() => props.search(props.index, true)}
				>
					<Plus />
				</IconButton>
			</Tooltip>{' '}
			<Divider
				style={{
					height: 20,
					margin: 2,
				}}
				orientation="vertical"
			/>
			<Tooltip title={props.text_lang.SEARCH.NEW_SEARCH}>
				<Button
					style={{
						margin: '0',
						// padding: '2px 4px',
						display: 'flex',
						width: '60%',
					}}
					size="sm"
					variant={props.variant}
					key={props.id}
					onMouseDown={() => props.search(props.index, false)}
				>
					<div
						style={{
							margin: 'auto',
						}}
					>
						{props.name}
					</div>
				</Button>
			</Tooltip>
		</div>
	);
}
