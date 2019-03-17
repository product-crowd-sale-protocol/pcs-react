import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import scatter from "../../../scripts/Scatter";
import SubSig from "../../../scripts/EosSubSig";
import { asyncAll, checkUint } from "../../../scripts/Util";
import { getTable } from "../../../scripts/EosHttpApi";

// redux
import { connect } from "react-redux";

// 新規買い注文と売り板から買う機能
class Order extends Component {

    constructor(props) {
        super(props);

        this.timer = null;
        this.state = {
            format: "buyOrder",
            buyOrder: [],
            sellOrder: [],
            buyOrderId: "",
            sellTargetId: ""
        };

        this.handleChange = this.handleChange.bind(this);
        // 自分の注文リストを取得
        this.setOwnOrder = this.setOwnOrder.bind(this);
        this.getOwnBuyOrder = this.getOwnBuyOrder.bind(this);
        this.getOwnSellOrder = this.getOwnSellOrder.bind(this);
        // 選択した注文をキャンセルする
        this.cancelBuyOrder = this.cancelBuyOrder.bind(this);
        this.cancelSellOrder = this.cancelSellOrder.bind(this);
        // 選択内容によってフォームを切り替える
        this.renderForm = this.renderForm.bind(this);
    }

    // 売買注文を定期的に取得する
    async componentDidMount() {
        await this.setOwnOrder();

        // 10秒間隔で板を更新する
        this.timer = setInterval(() => {
            this.setOwnOrder();
        }, 10000);
    }

    componentWillUnmount() {
        clearInterval(this.timer); // 板更新処理を終了
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    // 自分の注文一覧をstateにセットする
    async setOwnOrder() {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const dexSymbol = this.props.community.symbol; // DEXがあるコミュニティのSymbol
        const authoritySymbol = this.props.authority.symbol; // 最終ログインしたコミュニティのSymbol
        let authorityName = this.props.authority.accountName; // 最終ログインしたコミュニティの本当のアカウント名

        if (authorityName === code) {
            // 売り注文中
            const subsig = new SubSig(authoritySymbol); // 最終ログインしたコミュニティのSubsigインスタンス
            authorityName = await subsig.getSeller(this.props.authority.nftId); // 最終ログインしたコミュニティの本当のアカウント名
        }
        console.log("authorityName", authorityName);

        if ((authoritySymbol) && (authorityName)) {
            if (dexSymbol === authoritySymbol) {
                // トークンを所持している
                const [buyOrder, sellOrder] = await asyncAll(this.getOwnBuyOrder(authorityName), this.getOwnSellOrder(authorityName));
                this.setState({
                    buyOrder, sellOrder
                })
            } else {
                // このDEXのトークンを所持していない
                const buyOrder = await this.getOwnBuyOrder(authorityName);
                const sellOrder = [];
                this.setState({
                    buyOrder, sellOrder
                })
            }
        }
    }

    // 自分の買い注文のIDの配列を取得する
    async getOwnBuyOrder(accountName) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;  // DEXのsymbol

        // 自分の買い注文一覧を取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "buyorder",
            "index_position": 3,
            "key_type": "i64",
            "lower_bound": accountName,
            "limit": 100
        };
        const response = await getTable(query);
        return response.rows.map((order) => { return order.id });
    }

    // 自分の売り注文のIDの配列を取得する
    async getOwnSellOrder(accountName) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;  // DEXのsymbol

        // 自分の買い注文一覧を取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "sellorder",
            "index_position": 3,
            "key_type": "i64",
            "lower_bound": accountName,
            "limit": 100
        };
        const response = await getTable(query);
        return response.rows.map((order) => { return order.id });
    }

    // 買い注文をキャンセルする
    async cancelBuyOrder(buyOrderId) {
        if ((!checkUint(buyOrderId))) {
            return window.alert("Uint Only. OK?");
        }

        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol;  // DEXのsymbol

        // 指定した買い注文があることを確認しuserを取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "buyorder",
            "lower_bound": buyOrderId,
            "upper_bound": buyOrderId,
            "limit": 1
        };
        const result = await getTable(query);

        if (result.rows.length === 0) {
            return window.alert("買い注文が確認できませんでした");
        }

        // 買い注文の発行者
        const orderCreater = result.rows[0].user;

        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }

        if (scatter.account.name !== orderCreater) {
            return window.alert("指定した買い注文はあなたの発行したものではありません。");
        }

        try {
            const actObj = {
                "contractName": code,
                "actionName": "cancelbobyid",
                "params": [symbol, buyOrderId]
            };
            await scatter.action(actObj);
            this.setState({
                price: 0,
                nftId: ""
            })
            return window.alert("トークンの買い注文をキャンセルしました");
        }
        catch (error) {
            console.error(error);
            return window.alert("買い注文のキャンセルに失敗しました");
        }
    }

    // 売り注文をキャンセルする
    async cancelSellOrder(sellTargetId) {
        const code = process.env.REACT_APP_CONTRACT_ACCOUNT;
        const symbol = this.props.community.symbol; // DEXのSymbol === AuthorityのSymbol

        if ((!checkUint(sellTargetId))) {
            return window.alert("Uint Only. OK?");
        }

        // 指定した売り注文があることを確認しuserを取得する
        const query = {
            "code": code,
            "scope": symbol,
            "table": "sellorder",
            "lower_bound": sellTargetId,
            "upper_bound": sellTargetId,
            "limit": 1
        };
        const result = await getTable(query);

        if (result.rows.length === 0) {
            return window.alert("売り注文が確認できませんでした");
        }

        // 売り注文の発行者
        const orderCreater = result.rows[0].user;

        try {
            await scatter.login();
        }
        catch (e) {
            return window.alert(e);
        }

        if (scatter.account.name !== orderCreater) {
            return window.alert("指定した売り注文はあなたの発行したものではありません。");
        }

        try {
            const actObj = {
                "contractName": code,
                "actionName": "cancelsobyid",
                "params": [symbol, sellTargetId]
            };
            await scatter.action(actObj);
            this.setState({
                price: 0,
                nftId: ""
            })
            return window.alert("売り注文をキャンセルしました。");
        }
        catch (error) {
            console.error(error);
            return window.alert("売り注文のキャンセルに失敗しました。");
        }
    }

    renderForm() {
        if (this.state.format === "buyOrder") {
            return (
                <Form>
                    <FormGroup>
                        <Label for="buyOrderId">買い注文一覧</Label>
                        <Input type="select" name="buyOrderId" onChange={this.handleChange} value={this.state.buyOrderId}>
                            <option value=""></option>
                            {
                                this.state.buyOrder.map((orderId) => {
                                    return (
                                        <option value={orderId} key={orderId}>{orderId}</option>
                                    )
                                })
                            }
                        </Input>
                    </FormGroup>
                    <Button size="sm" outline color="danger" onClick={(() => { this.cancelBuyOrder(this.state.buyOrderId) })}>キャンセル</Button>
                </Form>
            );
        } else {
            return (
                <Form>
                    <FormGroup>
                        <Label for="sellTargetId">売り注文一覧</Label>
                        <Input type="select" name="sellTargetId" onChange={this.handleChange} value={this.state.sellTargetId}>
                            <option value=""></option>
                            {
                                this.state.sellOrder.map((orderId) => {
                                    return (
                                        <option value={orderId} key={orderId}>{orderId}</option>
                                    )
                                })
                            }
                        </Input>
                    </FormGroup>
                    <Button size="sm" outline color="success" onClick={(() => { this.cancelSellOrder(this.state.sellTargetId) })}>キャンセル</Button>
                </Form>
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                <Form>
                    <FormGroup>
                        <Input type="select" name="format" value={this.state.format} onChange={this.handleChange} bsSize="sm">
                            <option value="buyOrder">買い注文一覧</option>
                            <option value="sellOrder" className="text-success">売り注文一覧</option>
                        </Input>
                    </FormGroup>
                </Form>

                {this.renderForm()}
            </React.Fragment>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        community: state.community,
        authority: state.authority
    };
};

export default connect(mapStateToProps)(Order);