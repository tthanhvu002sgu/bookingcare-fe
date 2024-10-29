import *as React from "react";
import { request } from "../apis/api_helper";

export default class AuthContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount(){
        request(
            "GET",
            "/user",
            {}
        ).then((response) => {
            this.setState({data: response.data});
        });
    }

    render(){
        return (
            <div>
                {this.state.data && this.state.data.map((line) => <p key={line}>{line}</p>)}
            </div>
        )
    }

}