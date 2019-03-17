import React, { Component } from "react";
import Aws from "../../scripts/Aws";
import { prefixRedirect } from "../../scripts/Util";
import { Button } from "reactstrap";

class HotTopic extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url1: "pending",
            title1: null,
            url2: null,
            title2: null,
            flug: false
        };

        this.getHotTopic = this.getHotTopic.bind(this);
        this.renderHotTopic = this.renderHotTopic.bind(this);
        this.visit = this.visit.bind(this);
    }

    async componentDidMount() {
        const topics = await this.getHotTopic();

        // 取得したHotTopicをStateに反映する
        if (!topics) {
            return this.setState({
                url1: null,
                title1: null,
                url2: null,
                title2: null
            });
        }

        if (topics.length === 2) {
            this.setState({
                url1: topics[0].url,
                title1: topics[0].title,
                url2: topics[1].url,
                title2: topics[1].title
            });

            setInterval(() => {
                this.setState({
                    flug : !this.state.flug
                })
            }, 4000);
        } else if (topics.length === 1) {
            this.setState({
                url1: topics[0].url,
                title1: topics[0].title,
                url2: null,
                title2: null
            });
        } else {
            this.setState({
                url1: null,
                title1: null,
                url2: null,
                title2: null
            })
        }
    }

    // HotTopicを取得する
    async getHotTopic () {
        const topics = await Aws.getHotTopic(this.props.symbol);

        // pvで降順にソート
        topics.sort(
            function(a,b) {
                return b.pv - a.pv;
            }
        );

        if (topics.length > 1) {
            // pvが一番高いものを返す
            return [topics[0], topics[1]];
        } else if (topics.length === 1) {
            return [topics[0]];
        } else {
            return [];
        }
    }

    visit(e) {
        const proxy = prefixRedirect(e.target.value);
        window.open(proxy + "&community=" + this.props.symbol, "_blank");
    }

    renderHotTopic () {
        if (this.state.url1 === "pending") {
            return (
                <div className="mx-2">Loading...</div>
            )
        } else if (this.state.url1 && this.state.url2) {
            if (!this.state.flug) {
                return (
                    <div>
                        <Button color="secondary" size="sm" value={this.state.url1} onClick={this.visit}>{this.state.title1}</Button>{' '}
                        <Button color="secondary" size="sm" value={this.state.url2} onClick={this.visit}>{this.state.title2}</Button>
                    </div>
                )
            } else {
                return (
                    <div>
                        <Button color="secondary" size="sm" value={this.state.url2} onClick={this.visit}>{this.state.title2}</Button>{' '}
                        <Button color="secondary" size="sm" value={this.state.url1} onClick={this.visit}>{this.state.title1}</Button>
                    </div>
                )
            }
        } else if (this.state.url1 && !this.state.url2) {
            return (
                <div>
                    <Button color="secondary" size="sm" value={this.state.url1} onClick={this.visit}>{this.state.title1}</Button>
                </div>
            )
        } else {
            return (
                <div>現在、Hot Topicはありません</div>
            )
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="hot-topic">
                    <h5>{"🔥Hot Topic🔥"}</h5>
                    {this.renderHotTopic()}
                </div>
            </React.Fragment>
        );
    }
}

export default HotTopic;