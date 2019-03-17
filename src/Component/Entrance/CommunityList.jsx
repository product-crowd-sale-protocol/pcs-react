// 部屋の入り口をロビーに並べるためのコンポーネント
import React, { Component } from "react";
import { Col, Media, Row } from 'reactstrap';
import { Link } from "react-router-dom";
import store from "../../redux/store";
import { switchCommunity, switchCommunityContents } from "../../redux/actions";
import Aws from "../../scripts/Aws";
import { asyncMap, asyncAll } from "../../scripts/Util";
import History from "../History";
import Manager from "./Manager";
import HotTopic from "./HotTopic";
import { connect } from "react-redux";

// 初回読み込み時にコミュニティのリストを取得しておく
let communityList = [];
let eos_jpy = 0;

(async ()=> {
    [communityList, eos_jpy] = await asyncAll(Aws.getCmntyList(), Aws.EOSPrice());
})();

class LobbyList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pvRate : "",
            priceList: {}
        }

        this.getPVRate = this.getPVRate.bind(this);
    }

    async getPVRate() {
        const pvRate = Math.round(await Aws.getPVRate() * 100000) / 100000;
        
        this.setState({
            pvRate: pvRate
        })
    }

    componentWillMount() {
        // しっかりログアウト処理をしておく
        // 認証情報は残しておく
        store.dispatch(switchCommunity(""));
        store.dispatch(switchCommunityContents("lobby"));
    }

    async componentDidMount() {

        // 各コミュニティのボーダー価格を取得し、stateにセットする
        let priceList = {};
        const communityList = await Aws.getCmntyList();
        await asyncMap(communityList, async (community) => {
            const symbol = community.pcs_name;
            const res = await Aws.getBorderPrice(symbol, "", "");
            const price = res.y;
            priceList[symbol] = price;
        });
        this.setState({
            priceList: priceList
        });

        this.getPVRate();
    }

    render() {
        return (
            <Row>
                <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                    <h3>今日の1PVの価値</h3>
                    <h3 className="pr-3" align="right"> {Math.round(this.state.pvRate * eos_jpy * 10000) / 10000} 円</h3>
                </Col>
                {
                    communityList.map((community) => {
                        let symbol = community.pcs_name
                        let price = this.state.priceList[community.pcs_name];
                        return (
                            <Col xs="12" className="community normal-shadow border-special" key={community.id}>

                                {/* コミュニティの名前と運営者一覧 */}
                                <div className="border-bottom border-grey">
                                    <h2 className="name" style={{ display: "inline-block" }}>{community.community_name}</h2>
                                    <span className="float-right" style={{ display: "inline-block" }}><Manager symbol={symbol} /></span>
                                </div>

                                {/* アイコン、その他のコミュニティの情報 */}
                                <Media className="community-description">
                                    <img className="align-self-start border" src={community.image} alt="community" />
                                    <Media body>
                                        <span>{"♢" + symbol}<br /></span>
                                        <span>{community.description}<br /></span>
                                        <span>人数: {community.number} 人<br /></span>
                                        <span>メンバーシップ価格: {price ? Math.ceil(price * eos_jpy * 1.15) : 0} 円</span>
                                    </Media>
                                </Media>

                                {/* 一時間以内にコミュニティ内にいた人 */}
                                <Col xs="12" className="py-2 border-special">
                                    <History symbol={symbol} action="CHAT" seconds={3600} descripton="1時間以内にロビーにいた人" />
                                </Col>

                                {/* Hot Topic */}
                                <Col xs="12" className="my-3 py-2 border-special">
                                    <HotTopic symbol={symbol} />
                                </Col>

                                <Link to={"/community/" + symbol}>このロビーに入る</Link>
                            </Col>
                        )
                    })
                }
            </Row>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        nft: state.nft
    };
};

export default connect(mapStateToProps)(LobbyList);
