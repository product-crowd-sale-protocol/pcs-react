import React, { Component } from 'react';
import './App.css';
import "./Dark.css";
import "./White.css";
import setting from "./img/setting.png";
import { BrowserRouter as Router } from "react-router-dom";
import { connect } from "react-redux";
import { switchSetting, setPrice } from "./redux/actions";
import Header from "./Component/Header/Header";
import Entrance from "./Component/Entrance/Entrance";
import Setting from "./Component/Setting/Setting";
import Profile from "./Component/Profile";
import Aws from "./scripts/Aws";

class App extends Component {

  constructor(props) {
    super(props);

    this.switchSetting = this.switchSetting.bind(this);
    this.setEOSJPY2Redux = this.setEOSJPY2Redux.bind(this);
  }

  async componentDidMount() {
    await this.setEOSJPY2Redux();

    setInterval(() => {
      this.setEOSJPY2Redux();
    }, 10000);
  }

  switchSetting() {
    this.props.dispatch(switchSetting());
  }

  async setEOSJPY2Redux() {
    try {
      const eosjpy = await Aws.EOSPrice();
      this.props.dispatch(setPrice("eosjpy", eosjpy));
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <Router>
        {/* テーマでクラスが変わる */}
        <div className={this.props.darkMode ? "dark-mode" : "white-mode"}>

          {/* ヘッダー */}
          <Header />

          {/* reduxのsettingによって設定画面かコンテンツを表示するか変更する */}
          {(!this.props.setting) ? <Entrance /> : <Setting />}

          {/* 設定アイコン */}
          <input id="setting-icon" type="image" src={setting} alt="setting" onClick={this.switchSetting} />

          {/* プロフィール */}
          <Profile />
          
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    darkMode: state.darkMode.darkMode,
    setting: state.setting.setting
  };
};

export default connect(mapStateToProps)(App);
