import * as React from "react";
import * as ReactDOM from "react-dom";
import * as axios from "axios";

class MainBox extends React.Component {
	constructor() {
		super();

		this.update_history = this.update_history.bind(this);
	}

	update_history() {
		axios.post("http://127.0.0.1:8000/get_history", {range: 25}).then(res => console.log(res.data));
	}

	render() {
		return (
			<div class="main-main-box">
				<div class="send-recieve">
					<div class="send-recieve-send"><p>Send Funds</p></div>
					<div class="send-recieve-recieve"><p>Receive Funds</p></div>
				</div>

				<div class="transaction-history-title">Transaction History</div>
				<div class="incoming-outgoing">
					<div>
						<p><span class="incoming-color-text">Incoming - Amount: 500.00000</span> | Status: Pending | <span>Transaction ID:</span> aksjnchfbgshbcj872jsnhbdgytu76e</p>
					</div>
				</div>
				<div class="load-more-button" onClick={this.update_history}><p>Load 25+ More</p></div>
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
	constructor() {
		super();
	}

	render() {
		return (
			<div class="main-side-banner">
				<div><p>Wallet</p></div>
				<div><p>Send Funds</p></div>
				<div><p>Receive Funds</p></div>
				<div><p>Settings</p></div>
			</div>
		);

	}
}

export default class WalletLanding extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (        
			<div class="logged-in-main">
				<TopBanner/>
				<SideBanner/>
				<MainBox/>
			</div>
		);
	}
}