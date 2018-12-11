import * as React from "react";
import * as ReactDOM from "react-dom";
import * as axios from "axios";
import LoginPage from "./login.js"
import WalletLanding from "./wallet_landing.js"

const {dialog} = window.require('electron').remote;
const path = window.require("path");


//need to have an enter password page in addition to wallet landing etc.
class LoginPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			password: ""
		}
		this.changePass = this.changePass.bind(this);
		this.submitUnlock = this.submitUnlock.bind(this);
	}

	changePass(e) {
		const pass = e.target.value;
		this.setState({
			password: pass
		});
	}

	submitUnlock() {
		const pass = this.state.password;
		axios.post("http://127.0.0.1:5000/unlock_wallet", {password: pass}).then(res => {
			//if (res.data == "success") {
				this.props.toggle_logged_in();
			//}
		});
	}

	render() {
		return (
			<div class="enter-password">
				<h3>Enter your password</h3>
				<input onChange={this.changePass} type="password"></input>
				<button onClick={this.submitUnlock}>Unlock</button>
			</div>
			)
	}
}

class MainPage extends React.Component {
	constructor() {
		super();
		this.state = {
			loggedIn: false,
			fileExists: false
		}

		this.toggle_logged_in = this.toggle_logged_in.bind(this);
	}

	componentDidMount() {
		axios.get("http://127.0.0.1:5000/check_wallet_exists").then(res => {
			this.setState({
				fileExists: res.data
			});
		});
	}

	toggle_logged_in() {
		this.setState(prevState => ({ loggedIn: !prevState.loggedIn }));
	}

	render() {
		return (
			<div class="main-container">
				{ this.state.loggedIn ? <WalletLanding/> : this.state.fileExists ? <LoginPassword toggle_logged_in={this.toggle_logged_in}/> :
					<LoginPage toggle_logged_in={this.toggle_logged_in}/> }
			</div>
		)
	}
}

const main = document.getElementById("container");
ReactDOM.render(
					<MainPage/>, main
				)
