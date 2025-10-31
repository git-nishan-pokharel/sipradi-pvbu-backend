'use strict';
const e = React.createElement;
const host = `${window.location.protocol}//${window.location.host}`;

class EsewaLoad extends React.Component {
	constructor(props) {
		super(props);
		this.state = { success: false, amount: 100, error: '' };
	}

	generateSignature = (total_amount, transaction_uuid, product_code, secretKey) => {
		const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
		const hash = CryptoJS.HmacSHA256(data, secretKey);
		const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
		return hashInBase64;
	};

	onSubmit = () => {
		const { customerId, eSewaMerchantCode, eSewaTransecUrl, eSewaSecretKey } = window.INITIAL_STATE;

		this.setState({ ...this.state, error: '' });
		if (this.state.amount < 100) return this.setState({ ...this.state, error: 'Amount cannot be less than 100.' });

		// Generate transaction_uuid once and reuse it
		const transaction_uuid = `${customerId}-${Date.now()}`;

		const path = `${eSewaTransecUrl}/api/epay/main/v2/form`;
		const params = {
			amount: this.state.amount,
			product_service_charge: 0,
			product_delivery_charge: 0,
			tax_amount: 0,
			total_amount: this.state.amount,
			transaction_uuid: transaction_uuid,
			product_code: eSewaMerchantCode,
			success_url: `${host}/payment-method/esewa/load`,
			failure_url: `${host}/payment-method/failed`,
			signed_field_names: 'total_amount,transaction_uuid,product_code',
			signature: this.generateSignature(this.state.amount, transaction_uuid, eSewaMerchantCode, eSewaSecretKey),
		};

		const form = document.createElement('form');
		form.setAttribute('method', 'POST');
		form.setAttribute('action', path);

		for (const [key, value] of Object.entries(params)) {
			const hiddenField = document.createElement('input');
			hiddenField.setAttribute('type', 'hidden');
			hiddenField.setAttribute('name', key);
			hiddenField.setAttribute('value', value);
			form.appendChild(hiddenField);
		}

		document.body.appendChild(form);
		form.submit();
	};

	render() {
		const { name } = window.INITIAL_STATE;

		return e('div', null, [
			e('div', { className: 'container w-head', style: { textAlign: 'center', padding: '1rem 0' } }, [
				e('div', null, [
					e('p', { className: 'text-muted' }, [
						'Load',
						e('strong', { style: { color: '#000' } }, ' YATRI WALLET '),
						'through',
					]),
					e('img', { src: '/images/esewa.png', width: 100, className: 'esewa-logo' }, null),
				]),
				e('p', { className: 'text-muted', style: { fontSize: '0.9rem' } }, 'For'),
				e('p', null, name),
			]),
			e('div', { className: 'container', style: { padding: '15px 60px' } }, [
				e('label', null, 'Enter amount'),
				e(
					'input',
					{
						onKeyPress: (evt) => {
							if (!/[0-9]/.test(evt.key)) {
								evt.preventDefault();
							}
						},
						type: 'number',
						value: this.state.amount,
						className: 'form-control',
						onChange: (evt) => this.setState({ ...this.state, amount: Number(evt.target.value) }),
					},
					null,
				),
				e('div', { className: 'btn-group' }, [
					[200, 500, 1000, 2000, 2500, 5000, 10000].map((n) =>
						e('button', { className: 'btn btn-cash', onClick: () => this.setState({ ...this.state, amount: n }) }, n),
					),
				]),
				e('span', { className: 'text-danger small' }, this.state.error ? this.state.error : ''),
				e(
					'button',
					{
						className: 'btn btn-esewa',
						style: { marginTop: '1rem' },
						onClick: this.onSubmit,
					},
					'Load wallet',
				),
			]),
		]);
	}
}

const domContainer = document.querySelector('#root');
ReactDOM.render(e(EsewaLoad), domContainer);
