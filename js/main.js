import * as React from "react";
import * as ReactDOM from "react-dom";
import * as axios from "axios";
const {dialog} = require('electron').remote;

class LoginPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			file: "",
			password: ""
		};
		
		this.open_existing_click = this.open_existing_click.bind(this);
	}

	open_existing_click() {
		console.log("eh");
		dialog.showOpenDialog({
					properties: ['openFile']
				}, function (files) {
						if (files !== undefined) {
						axios.post("http://127.0.0.1:8000/open_wallet", {body: files[0]}).then(o => console.log(o.data));
					}
				});
	}

	show_wallet_password_popup() {

	}

	render () {
		return (
				<div>
					<div className="login-text">
				        <h1>Welcome to the Dero wallet</h1>
				        <h5>Please select an option from below</h5>
			      	</div>

				    <div className="login-options">
				       <div className="login-options-open-existing" onClick={this.open_existing_click}>
				          <h3>Open an existing wallet</h3>
				        </div>
				        <div className="login-options-create-new">
				          <h3>Create a new wallet</h3>
				        </div>
				    </div>
			    </div>
			)
	}
}

const main = document.getElementById("container");
ReactDOM.render(
					<LoginPage/>, main
				)
