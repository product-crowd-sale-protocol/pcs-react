import React, { Component } from "react";
import "./History.css";
import Aws from "../scripts/Aws";

// redux
import { connect } from "react-redux";
import { openProfile } from "../redux/actions";

// アクション履歴をDynamoから取得し、表示するコンポーネント
/*
props = {
    "symbol" : "対象のコミュニティ",
    "action" : "対象のアクション",
    "seconds" : "クエリの時間スケール",
    "descripton": "描画時に表示する文章"
}
 */ 
class History extends Component {
    constructor(props) {
        super(props);

        this.timer = null;

        this.state = {
            actionList: null
        };

        this.get = this.get.bind(this);
    }

    componentDidMount() {
        this.get();
        this.timer = setInterval(() => {
            this.get();
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    // アクション一覧をAwsから取得する
    async get() {
        const actionList = await Aws.getAccountIn(this.props.symbol, this.props.action, this.props.seconds);

        this.setState({ actionList });
    }

    openProfile(symbol, accountName, nftId, iconUrl, biography) {
        const profile = {
            symbol,
            accountName,
            nftId,
            iconUrl,
            biography
        };
        this.props.dispatch(openProfile(profile));
    }

    render() {
        return (<React.Fragment>
            {(this.state.actionList instanceof Array) ? (
                <div>
                    <h5>{this.props.descripton}</h5>
                    <div>
                        {(this.state.actionList).map((action) => {
                            const symbol = this.props.symbol;
                            const id = action.tokenId;
                            const accountName = action.owner;
                            const iconUrl = action.iconUrl;
                            const biography = action.biography;
                            return (
                                <span key={id} title={accountName}>
                                    <img className="icon" src={iconUrl} alt="account" onClick={this.openProfile.bind(this, symbol, accountName, id, iconUrl, biography)} />
                                </span>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </React.Fragment>);
    }
}

export default connect()(History);