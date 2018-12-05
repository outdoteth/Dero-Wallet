import * as React from "react";
import * as ReactDOM from "react-dom";

class LoginPage extends React.Component {
	render () {
		return (
				<div>
					<div className="login-text">
				        <h1>Welcome to the Dero wallet</h1>
				        <h5>Please select an option from below</h5>
			      	</div>

				    <div className="login-options">
				       <div className="login-options-open-existing">
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
