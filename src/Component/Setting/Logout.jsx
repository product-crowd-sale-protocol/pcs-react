import React, { Component } from "react";
import { Col, Button } from "reactstrap";
import scatter from "../../scripts/Scatter";

// Scatterからのログアウト
class Logout extends Component {

    async logout() {
        try {
            const res = await scatter.logout();
            if (res) {
                return window.alert("Scatterからログアウトしました");
            }
        } catch (e) {
            console.error(e);
            return window.alert("ログアウトに失敗しました。Scatterがアンロックされているか確認してください。");
        }
    }

    render() {
        return (
            <Col xs="12" className="p-3 mb-3 normal-shadow border-special">
                <h5>Scatterからログアウト</h5>
                Scatterとの接続を切ります。アカウントを切り替えたいときはここを利用してください。
                <br />
                <Button onClick={(() => { this.logout() })} className="my-2">ログアウト</Button>
            </Col>
        );
    }
}

export default Logout;