import * as React from "react";
import * as ReactDOM from "react-dom";
import * as axios from "axios";
const {dialog} = window.require('electron').remote;

class EnterPassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			password: "",
			isCanceled: false,
			fileName: this.props.fileName
		};

		this.handleCancel = this.handleCancel.bind(this);
		this.handle_password_input = this.handle_password_input.bind(this);
		this.handle_submit = this.handle_submit.bind(this);
	}

	handleCancel() {
		this.setState({
			isCanceled: true
		});

		this.props.changeFile()
	}

	handle_password_input(e) {
		this.setState({
			password: e.target.value
		});
	}

	handle_submit() {
		//need to make api call
		axios.post("http://127.0.0.1:8000/open_wallet", { 
											file: this.state.fileName, 
											password: this.state.password 
										}).then( res => {
											if (res.data[0] === "d") {
												this.props.toggle_logged_in();
												axios.post("http://127.0.0.1:8000/set_wallet_online", {url: "https://rwallet.dero.live"}).then(res => console.log(res)).catch(e => console.log(e));
											}
										}).catch(e => {
											console.log(e)
										});
	}

	render() {
		return (	!this.state.isCanceled ? 
				    <div class="password-for-file-popup">
				      <div class="password-for-file-popup-div"> 
				        <h6 class="password-for-file-popup-text">Unlock your wallet </h6>
				        <input onChange={this.handle_password_input} placeholder="Enter your password" class="password-for-file-popup-input" type="password"></input>
				        <button onClick={this.handle_submit} class="password-for-file-popup-button">Continue</button>
				        <button onClick={this.handleCancel} class="password-for-file-popup-cancel">Cancel</button>
				      </div>
				    </div> : "" 
			)
	}
}

class NewPassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			password: "",
			isCanceled: false
		};

		this.handleCancel = this.handleCancel.bind(this);
		this.handle_password_input = this.handle_password_input.bind(this);
		this.handle_submit = this.handle_submit.bind(this);
	}

	handleCancel() {
		this.setState({
			isCanceled: true
		});
	}

	handle_password_input(e) {
		this.setState({
			password: e.target.value
		});
	}

	handle_submit() {
		//need to make api call
		axios.post("http://127.0.0.1:5000/remove_and_insert_wallet_new", { 
											password: this.state.password 
										}).then( res => {
											console.log(res);
											if (res.data[0] === "d") {
												axios.post("http://127.0.0.1:8000/set_wallet_online", {url: "https://rwallet.dero.live"}).then(res => {this.props.toggle_logged_in();}).catch(e => console.log(e));
											}
										}).catch(e => {
											console.log(e)
										});
	}

	render() {
		return (	!this.state.isCanceled ? 
				    <div class="password-for-file-popup">
				      <div class="password-for-file-popup-div"> 
				        <h6 class="password-for-file-popup-text">Enter a password for your wallet</h6>
				        <input onChange={this.handle_password_input} placeholder="Enter your password" class="password-for-file-popup-input" type="password"></input>
				        <button onClick={this.handle_submit} class="password-for-file-popup-button">Create Wallet</button>
				        <button onClick={this.handleCancel} class="password-for-file-popup-cancel">Cancel</button>
				      </div>
				    </div> : "" 
			)
	}
}

export default class LoginPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			file: "",
			password: "",
			isFileChosen: false,
			createNewClicked: false
		};

		this.open_existing_click = this.open_existing_click.bind(this);
		this.changeFile = this.changeFile.bind(this);
		this.createNewClicked = this.createNewClicked.bind(this);
	}

	open_existing_click() {
		dialog.showOpenDialog({
					properties: ['openFile']
				},  (files) => {
						if (files !== undefined) {
							//check if default file
							//if yes then show warning then proceed to move file and change state
							//otherwise proceed to move file and change state
							//move the file then set state
							this.setState({ file: files[0], isFileChosen: true });
					}
				});
	}

	changeFile() {
		this.setState({ file: "", isFileChosen: false });
	}

	createNewClicked() {
		this.setState({
			createNewClicked: true
		});
	}

	render () {
		return (
				<div class="login-container">
					{ this.state.isFileChosen ? <EnterPassword fileName={this.state.file} changeFile={this.changeFile} toggle_logged_in={this.props.toggle_logged_in}/> : "" }
					{ this.state.createNewClicked ? <NewPassword toggle_logged_in={this.props.toggle_logged_in}/> : "" }
					<div className="login-text">
				        <h1>Welcome to the Dero wallet</h1>
				        <h5>Please select an option from below</h5>
			      	</div>

				    <div className="login-options">
				       <div className="login-options-open-existing" onClick={this.open_existing_click}>
				          <h3>Import an existing wallet</h3>
				        </div>
				        <div onClick={this.createNewClicked} className="login-options-create-new">
				          <h3>Create a new wallet</h3>
				        </div>
				    </div>
			    </div>
			)
	}
}