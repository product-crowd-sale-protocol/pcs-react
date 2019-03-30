import React, { PureComponent } from "react";
import { Col, Button } from "reactstrap";
import { PcsClient } from "../pcs-js-eos/main";
import "../style/App.css";
import "../style/Dark.css";
import "../style/White.css";
import "../style/bootstrap.min.css";
import { THEME } from "../scripts/Theme";

class Scatter extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            connected : false,
            account: null,
            locked: false,
            loading: "none"
        };
        this.pcs = new PcsClient(this.props.network, this.props.appName);
        this.timer = null;

        this.renderStatus = this.renderStatus.bind(this);
        this.lockBtn = this.lockBtn.bind(this);
        this.unlockBtn = this.unlockBtn.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.checkScatter();
        this.timer = setInterval(() => {
            this.checkScatter();
        }, 300);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    lockBtn() {
        // 連打されないようにロックする
        this.setState({
            locked: true,
            loading: "inline-block"
        });
    }

    unlockBtn() {
        this.setState({
            locked: false,
            loading: "none"
        });
    }

    // Scatterの状態を確認しStateにセットする
    checkScatter () {
        let connected = this.pcs.connected;
        let account = null;
        try {
            account = this.pcs.account.name;
        } catch { }
        this.setState({
            connected, account
        });
    }

    // Scatterの状態に応じてレンダリング情報を変える
    renderStatus() {
        let connected = this.state.connected;
        let account = this.state.account;
        
        if (connected) {
            if (account) {
                return (
                    <React.Fragment>
                        接続状況: {account}で接続済み
                        <br />
                        <Button size="sm" onClick={(() => { this.logout() })} className="my-2" disabled={this.state.locked}>
                            <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                            ログアウト
                        </Button>
                    </React.Fragment>
                );
            } else {
                return (
                    <React.Fragment>
                        接続状況: 接続済みですがアカウントの秘密鍵がセットされていません。
                        <br />
                        <Button size="sm" onClick={(() => { this.login() })} className="my-2" disabled={this.state.locked}>
                            <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                            アカウントを選択
                        </Button>
                    </React.Fragment>
                );
            }
        } else {
            return (
                <React.Fragment>
                    接続状況: 未接続
                    <br />
                    接続するにはScatterがunlockされていることを確認して、以下のログインボタンを押してください。
                    <Button size="sm" onClick={(() => { this.login() })} className="my-2" disabled={this.state.locked}>
                        <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true" style={{ display: this.state.loading }} ></span>
                        ログイン
                    </Button>
                </React.Fragment>
            );
        }
    }

    async login() {
        this.lockBtn();
        try {
            await this.pcs.login();
            this.unlockBtn();
        } catch (e) {
            this.unlockBtn();
            if (e instanceof ScatterError) {
                if (e.errorType === "connection_fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else if ((e.errorType === "identity_not_found") || (e.errorType === "account_not_found")) {
                    return window.alert("アカウントの秘密鍵がセットされていません。");
                }
            }
            console.error(e);
            return window.alert("ログインに失敗しました。");
        }
    }

    async logout() {
        this.lockBtn();
        try {
            await this.pcs.logout();
            this.pcs.account = null;
            this.unlockBtn();
            return window.alert("Scatterからログアウトしました");
        } catch (e) {
            this.unlockBtn();
            if (e instanceof ScatterError) {
                if (e.errorType === "connection fail") {
                    return window.alert("Scatterが見つかりません。アンロックされていることを確認してください。");
                } else {
                    console.error(e);
                    return window.alert("ログアウトに失敗しました。");
                }
            }
            console.error(e);
            return window.alert("ログアウトに失敗しました。Scatterがアンロックされているか確認してください。");
        }
    }

    render() {
        const theme = this.props.theme;
        return (
            <Col xs="12" className={((theme === THEME.DARK) ? "dark-mode" : "white-mode") + " p-3 normal-shadow border-special"}>
                <h5>{"⛓ Scatter"}</h5>
                {this.renderStatus()}
            </Col>
        );
    }
}

Scatter.defaultProps = {
    theme: THEME.DARK,
    appName: "PCS_APP"
};

export default Scatter;