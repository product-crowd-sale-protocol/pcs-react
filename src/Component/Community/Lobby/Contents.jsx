import React, { Component } from "react";
import { Row, Col, Collapse, Fade } from "reactstrap";
import './Contents.css';
import Share from "./Share";

import { asyncMap, prefixRedirect } from "../../../scripts/Util";
import { getContents } from "../../../scripts/EosHttpApi";
import Aws from "../../../scripts/Aws";

// redux
import { connect } from "react-redux";
import { setContents, openProfile, openShare } from "../../../redux/actions";

// icon
import darkModeTreasure from "../../../img/content32white.png";
import whiteModeTreasure from "../../../img/content32blue.png";

const COLOR = 6; // 色が何色あるか

function getColor(code) {
    switch (code) {
        case 0:
            return "red";
        case 1:
            return "yellow";
        case 2:
            return "green";
        case 3:
            return "lblue";
        case 4:
            return "dblue";
        case 5:
            return "purple";
        default:
            break;
    }
}


// Lobbyのサービス一覧ページを担うコンポーネント
class Contents extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
            contents: "loading",
            reloadFadeIn: false, 
            reloadDisabled: true
        };

        this.getContents = this.getContents.bind(this);
        this.getHotTopic = this.getHotTopic.bind(this);
        this.toggle = this.toggle.bind(this);
        this.reload = this.reload.bind(this);
        this.visit = this.visit.bind(this);
        this.renderContents = this.renderContents.bind(this);
    }

    toggle() {
        if (this.state.collapse) {
            this.setState({ 
                collapse: false,
                reloadDisabled: true,
                reloadFadeIn: false
            });
        } else {
            this.setState({
                collapse: true,
                reloadDisabled: false,
                reloadFadeIn: true
            });
        }
    }

    // EOSからコンテンツを取得する
    async componentDidMount() {
        const contents = await this.getContents();

        this.setState({
            contents
        });

        this.props.dispatch(setContents({
            symbol: this.props.symbol,
            contents: contents
        }));
    }

    async getContents() {
        // ここもタイトルと一緒にlambdaで引っ張ってくる
        const contents = [];
        const urlList = await getContents(this.props.symbol);
        const targetList = await this.getHotTopic(); // PVが増加したコンテンツのURL

        // タイトルを取得する
        await asyncMap(urlList, async (url) => {
            if (url.short_title) {
                const contributor = await Aws.getContribution(this.props.symbol, url.uri);
                if (targetList.indexOf(url.uri) !== -1) {
                    contents.push({ "contentsId": url.id, "url": url.uri, "provider": url.provider, "title": url.short_title, "pv": true, "contributor": contributor });
                } else {
                    contents.push({ "contentsId": url.id, "url": url.uri, "provider": url.provider, "title": url.short_title, "pv": false, "contributor": contributor });
                }
            } else {
                const title = await Aws.title(url.uri);
                const contributor = await Aws.getContribution(this.props.symbol, url.uri);
                if (typeof (title) !== "string") {
                    console.log(`${url.uri} is invalid.`);
                } else {
                    if (targetList.indexOf(url.uri) !== -1) {
                        contents.push({ "contentsId": url.id, "url": url.uri, "provider": url.provider, "title": title, "pv": true, "contributor": contributor });
                    } else {
                        contents.push({ "contentsId": url.id, "url": url.uri, "provider": url.provider, "title": title, "pv": false, "contributor": contributor });
                    }
                }
            }
        });

        return contents;
    }

    async getHotTopic() {
        let target = (await Aws.getHotTopic(this.props.symbol)).map((content) => content.url);
        return target;
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

    openShare(proxy, title) {
        this.props.dispatch(openShare(proxy, title));
    }

    visit(e) {
        const proxy = prefixRedirect(e.target.value);
        window.open(proxy + "&community=" + this.props.symbol, "_blank");
    }

    // コンテンツのリロードを行う
    async reload() {
        try {
            this.setState({
                reloadDisabled: true
            });
            const contents = await this.getContents();

            this.setState({
                contents
            });

            this.props.dispatch(setContents({
                symbol: this.props.symbol,
                contents: contents
            }));

            if (this.state.collapse) {
                this.setState({
                    reloadDisabled: false
                })
            }
        } catch {
            if (this.state.collapse) {
                this.setState({
                    reloadDisabled: false
                })
            }
        }
    }

    // コンテンツを描画する
    renderContents() {
        const contents = this.state.contents;

        if (typeof(contents) == "string") {
            return (
                <div className="d-flex justify-content-center">
                    <div className={this.props.darkMode ? "spinner-border text-light" : "spinner-border text-warning"} role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )
        } else if (typeof(contents) == "object") {
            return (
                <Row>
                    {
                        contents.map((content, contents_id) => {
                            const contributor = content.contributor;
                            const color = getColor(contents_id % COLOR);
                            const proxyUrl = prefixRedirect(content.url);
                            return (
                                <React.Fragment key={contents_id}>
                                    <Col xs="1" sm="1" md="1" className="contributor">
                                        {(contributor) ? <img className="my-2" src={contributor.icon_url} alt="ICON" onClick={this.openProfile.bind(this, contributor.symbol, contributor.accountName, contributor.id, contributor.icon_url, contributor.biography)}></img> : <React.Fragment></React.Fragment>}
                                    </Col>
                                    <Col xs="9" md="10" className="contents">
                                        <div  className="my-2">
                                            <button type="button" onClick={this.visit} value={content.url} className={`btn-special ${color}`}>
                                                {(content.pv) ? "👀 : " : ""}
                                                {content.title}
                                            </button>
                                        </div>
                                    </Col>
                                    <Col xs="2" md="1" className="share">
                                        <button className="btn-special my-2" onClick={this.openShare.bind(this, proxyUrl, content.title)}>
                                            共有
                                        </button>
                                    </Col>
                                </React.Fragment>
                            );
                        })
                    }
                </Row>
            )
        }
    }

    render() {
        return (
            <Col xs="12" className="py-3 my-3 border-special normal-shadow">
                
                <div className="clearfix">
                    <h3 className="float-left"><img src={this.props.darkMode ? darkModeTreasure : whiteModeTreasure} alt="contents" className="menu-icon" /> ポスト一覧</h3>
                    <button type="button" onClick={this.toggle} className="float-right btn-special mx-1">
                        開く
                    </button>
                    <Fade in={this.state.reloadFadeIn}>
                        <button type="button" disabled={this.state.reloadDisabled} onClick={this.reload} className="float-right btn-special mx-1">
                            リロード
                        </button>
                    </Fade>
                </div>


                <Collapse isOpen={this.state.collapse}>
                    {this.renderContents()}
                </Collapse>

                <Share />
                
            </Col>          
        );
    }
}

const mapStateToProps = (state) => {
    return {
        symbol: state.authority.symbol,
        nftId: state.authority.nftId,
        darkMode: state.darkMode.darkMode,
        contents: state.contents
    };
};

export default connect(mapStateToProps)(Contents);
