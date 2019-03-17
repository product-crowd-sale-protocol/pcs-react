import React, { Component } from "react";
import { Collapse, Col, Button } from "reactstrap";
import Aws from "../../scripts/Aws";

// 自分の所有しているトークンの開示
class Token extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            tokenList: []
        };

        this.toggle = this.toggle.bind(this);
        this.search = this.search.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    // 
    async search() {
        const tokenList = [];
        const cmntyList = await Aws.getCmntyList();
        cmntyList.map((cmnt) => {
            const symbol = cmnt.pcs_name;
            try {
                const id = Number(JSON.parse(localStorage.getItem(symbol)).id);
                const data = { symbol, id };
                console.log(data);
                return tokenList.push(data);
            } catch {
                return 0;
            }
        })
        this.setState({
            tokenList
        });
        this.toggle();
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>ローカルのトークン一覧</h5>
                端末上に保管しているトークン一覧を表示します
                <br />
                <Button onClick={this.search} className="my-2">調べる</Button>

                <Collapse isOpen={this.state.collapse}>
                    {
                        this.state.tokenList.map((token) => {
                            return (
                                <p key={token.symbol}>{token.symbol}: {token.id} </p>
                            )
                        })
                    }
                </Collapse>
            </Col>
        );
    }
}

export default Token;