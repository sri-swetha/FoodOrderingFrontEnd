import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./home/Home";
import Profile from "../screens/profile/Profile";
import Details from "../screens/details/Details";
import Checkout from "../screens/checkout/Checkout";
import PrivateRoute from "../common/PrivateRoute";

class Controller extends Component {
  constructor(props) {
    super(props);
    this.baseUrl = "http://localhost:8080/api/";
    this.state = {
      loggedIn: sessionStorage.getItem("access-token") == null ? false : true,
    };
  }

  render() {
    return (
      <Router>
        <div className="main-container">
          <Switch>
            <Route
              exact
              path="/"
              render={(props) => <Home {...props} baseUrl={this.baseUrl} />}
            />
            <PrivateRoute
              exact
              path="/profile"
              component={Profile}
              baseUrl={this.baseUrl}
            />
            <Route
              exact
              path="/restaurant/:id"
              render={(props) => <Details {...props} baseUrl={this.baseUrl} />}
            />
            <Route
              path="/checkout"
              render={(props) => <Checkout {...props} baseUrl={this.baseUrl} />}
            />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Controller;
