// コミュニティの運営者のリストを表示
import React, { Component } from "react";
import Aws from "../../scripts/Aws";
import { getTokenInfo, getManager } from "../../scripts/EosHttpApi";
import { asyncMap, asyncAll } from "../../scripts/Util";
import { connect } from "react-redux";
import { openProfile } from "../../redux/actions";

class Manager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            managerList: []
        };

        this.getManager = this.getManager.bind(this);
    }

    async componentDidMount() {
        await this.getManager();
    }

    async getManager() {
        const symbol = this.props.symbol;
        const response = await getManager(symbol);
        const managerList = [];
        await asyncMap(response, async (token) => {
            const nftId = token.token_id;
            const [profile, tokenInfo] = await asyncAll(Aws.getProfile(symbol, nftId), (await getTokenInfo(symbol, nftId)));
            const manager = await { tokenId: nftId, owner: tokenInfo.owner, iconUrl: profile.icon_url, biography: profile.biography };
            managerList.push(manager);
        });
        this.setState({
            managerList 
        });
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
        return (
            <React.Fragment>
                <div>
                    {(this.state.managerList).map((manager) => {
                        const symbol = this.props.symbol;
                        const id = manager.tokenId;
                        const accountName = manager.owner;
                        const iconUrl = manager.iconUrl;
                        const biography = manager.biography;
                        return (
                            <span key={id} title={accountName}>
                                <img className="manager-icon" src={iconUrl} alt="account" onClick={this.openProfile.bind(this, symbol, accountName, id, iconUrl, biography)} />
                            </span>
                        );
                    })}
                </div>
            </React.Fragment>
        );
    }
}

export default connect()(Manager);
