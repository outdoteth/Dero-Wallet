import * as React from "react";
import * as ReactDOM from "react-dom";
import * as axios from "axios";

class TxHistory extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
					<div>
						<p><span class={this.props.incoming ? "incoming-color-text" : "outgoing-color-text"}>{this.props.incoming ? "Incoming" : "Outgoing"} - Amount: {this.props.amount}</span> | <span>Transaction ID:</span> {this.props.tx_id}</p>
					</div>
			)
	}
}

class SendBox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			destination: "",
			amount: ""
		}
		this.send_tx = this.send_tx.bind(this);
		this.dest_change = this.dest_change.bind(this);
		this.amount_change = this.amount_change.bind(this);
	}

	dest_change(e) {
		this.setState({
			destination: e.target.value
		});
	}

	amount_change(e) {
		this.setState({
			amount: e.target.value
		});
	}

	send_tx() {
		axios.post("http://127.0.0.1:8000/send_tx", {destination: this.state.destination, amount: this.state.amount})
					.then(res => {
							axios.post("http://127.0.0.1:8000/relay_tx", res.data);
						}
					);
	}

	render() {
		return (
			<div class="send-box">
				<input onChange={this.dest_change} placeholder="Enter destination address" class="send-destination"></input>
				<input onChange={this.amount_change} placeholder="Enter amount to send" class="send-amount" type="number"></input>
				<button onClick={this.send_tx}>Send</button>
			</div>
			)
	}
}


class ReceiveBox extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
			return (
			<div class="receive-box">
				<h4>Account Address</h4>
				<div>
					<h5>dERoinCHkFnLwG8W1kUTvHEYiuq1YvwwEBG8WWqcDTf8LtVGJf5h1piVUwT1AgLAP6JqFYK947652R4XoYqbLM3R1riDuAx6fS</h5>
					<button>Copy To Clipboard</button>
				</div>
			</div>
			)
	}
}


class MainBox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			history: [],
		}

		this.update_history = this.update_history.bind(this);
	}

	update_history() {
		axios.post("http://127.0.0.1:8000/get_history", {range: this.state.history.length + 25}).then(res => {
			let history_tx = [];
			console.log(res.data);
			if (res.data.amountList) {
				for (let i = 0; i < res.data.amountList.length; i++) {
				let tx = {
					incoming: res.data.listDetails[i] == " ",
					amount: res.data.amountList[i],
					tx_id: res.data.txIds[i]
				}
				history_tx.push(tx);
				}
				console.log(history_tx);
				this.setState({this.state.history: history_tx});
			}
		});
	}

	componentDidMount() {
		setInterval(this.update_history, 1000);;
	}

	render() {
		const tx_history = this.state.history.map(tx => 
			<TxHistory incoming={tx.incoming} amount={tx.amount} tx_id={tx.tx_id}/>
		);

		const main_box = (() => {
			switch (this.props.clicked){
				case "tx_history": {
					return (
						<div class="incoming-outgoing">
							{tx_history}
						</div>
						);
				}
				case "send_box": {
					return (
						<SendBox/>
					);
				}
				case "receive": {
					return (
						<ReceiveBox/>
					)
				}
			}
		})()


		const tx_h = this.props.clicked == "tx_history" ? <div class="transaction-history-title">Transaction History</div> : "";
		const load_more = this.props.clicked == "tx_history" ? <div class="load-more-button" onClick={this.update_history}><p>Load 25+ More</p></div> : "";
		return (
			<div class="main-main-box">
				<div class="send-recieve">
					<div class="send-recieve-send" onClick={this.props.change_send}><p>Send Funds</p></div>
					<div class="send-recieve-recieve" onClick={this.props.change_receive}><p>Receive Funds</p></div>
				</div>
				{tx_h}
				{main_box}
				{load_more}
			</div>
		);
	}
}

class TopBanner extends React.Component {

	constructor() {
		super();
		this.state = {
			Nweight: 0,
			height: 0,
			lockedBalance: 0,
			topoHeight: 0,
			totalBalance: 0,
			unlockedBalance: 0
		}

		this.update_balance = this.update_balance.bind(this);
	}

	componentDidMount() {
		setInterval(this.update_balance, 1000);
	}

	update_balance() {
		axios.get("http://127.0.0.1:8000/get_balance").then( res => {
			console.log(res.data);
			this.setState({
				Nweight: res.data.Nweight,
				height: res.data.height,
				lockedBalance: res.data.lockedBalance,
				topoHeight: res.data.topoHeight,
				totalBalance: res.data.totalBalance,
				unlockedBalance: res.data.unlockedBalance
			})
			}
		);
	}

	render() {
		setTimeout(this.update_balance, 1000);
		return (
			<div class="main-top-banner">
				<div>
					<h1 class="main-top-banner-amount-num">{this.state.totalBalance}</h1>
					<p class="main-top-banner-amount-text">Account Balance</p>
				</div>
			</div>
		);
	}
}

class SideBanner extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div class="main-side-banner">
				<div onClick={this.props.change_tx_history}><p>Wallet</p></div>
				<div onClick={this.props.change_send}><p>Send Funds</p></div>
				<div onClick={this.props.change_receive}><p>Receive Funds</p></div>
				<div><p>Settings</p></div>
			</div>
		);

	}
}

export default class WalletLanding extends React.Component {
	constructor() {
		super();

		this.state = {
			clicked: "tx_history"
		}

		this.change_send = this.change_send.bind(this);
		this.change_receive = this.change_receive.bind(this);
		this.change_tx_history = this.change_tx_history.bind(this);
	}

	change_tx_history() {
		this.setState({
			clicked: "tx_history"
		});
	}

	change_send() {
		this.setState({
			clicked: "send_box"
		});
	}

	change_receive() {
		this.setState({
			clicked: "receive"
		});
	}

	render() {
		return (        
			<div class="logged-in-main">
				<TopBanner/>
				<SideBanner change_tx_history={this.change_tx_history} change_send={this.change_send} change_receive={this.change_receive} />
				<MainBox change_send={this.change_send} change_receive={this.change_receive} clicked={this.state.clicked}/>
			</div>
		);
	}
}