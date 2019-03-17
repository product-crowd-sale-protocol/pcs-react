import React, { Component } from "react";
import { Collapse, Col, Button } from "reactstrap";

// 特定商取引法に関する表記
class Law extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapse: false,
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">

                <h5>特定商取引法に基づく表記</h5>
                特定商取引法に基づく表記を表示します。
                <br />

                <Button onClick={this.toggle} className="my-2">全文表示</Button>

                <Collapse isOpen={this.state.collapse}>
                    <div>
                        <table>
                            <tbody>
                                <tr><th>販売業者</th><td>株式会社ToyCash</td></tr>
                                <tr><th>代表責任者</th><td>日置 玲於奈</td></tr>
                                <tr><th>所在地</th><td>京都府京都市左京区聖護院山王町9</td></tr>
                                <tr><th>公開メールアドレス</th><td>support@toycash.awsapps.com</td></tr>
                                <tr><th>ホームページURL</th><td>http://www.toycash.com</td></tr>
                                <tr><th>販売価格</th><td>商品紹介ページをご参照ください。</td></tr>
                                <tr><th>商品代金以外の必要料金</th><td>消費税、手数料(3%)</td></tr>
                                <tr><th>引き渡し時期</th><td>ご注文から1分以内にお届け致します。</td></tr>
                                <tr><th>お支払方法</th><td>クレジットカード、LinePay</td></tr>
                                <tr><th>返品・交換・キャンセル等</th><td>商品発送後の返品・返却等は指定の方法でのトークン売却によって可能となります</td></tr>
                            </tbody>
                        </table>
                    </div>
                </Collapse>
            </Col>
        );
    }
}

export default Law;