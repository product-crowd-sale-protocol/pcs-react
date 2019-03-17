import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import { getTable } from "../../../scripts/EosHttpApi";

// Offer一覧
class OfferList extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.state = {
            offerList: []
        };

        this.fetch = this.fetch.bind(this);
    }

    componentDidMount() {
        this.fetch();

        this.timer = setInterval(() => {
            this.fetch();
        }, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    async fetch() {
        let offerList = [];

        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const query = {
            "code": code,
            "scope": this.props.community.symbol,
            "table": "offer",
            "limit": 100
        };
        const response = await getTable(query);
        offerList = response.rows;        

        this.setState({
            offerList
        });
    }

    render() {
        return (
            <div className="overflow-auto">
                <Table size="sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Provider</th>
                            <th>Price(EOS)</th>
                            <th>Content</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.offerList.map((offer) => {
                                const eosPrice = Number(offer.price.replace(/EOS/g, "")); // EOS換算
                                const url = "http://" + offer.uri;
                                return (
                                    <tr key={offer.id} className="offer">
                                        <th scope="row">{offer.id}</th>
                                        <td>{offer.provider}</td>
                                        <td>{eosPrice.toLocaleString()}</td>
                                        <td><a href={url} target="_blank" rel="noopener noreferrer">{offer.short_title}</a></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </div>
            
        );
    }
}

const mapStateToProps = (state) => {
    return {
        community: state.community
    };
};

export default connect(mapStateToProps)(OfferList);