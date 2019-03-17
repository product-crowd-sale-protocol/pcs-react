// Ryodanの各部屋の入り口コンポーネント
import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import Auth from "../Community/Auth";
import CommunityList from "./CommunityList";
import "./Entrance.css";

class Entrance extends Component {

    render() {
        return(
            <div className="entrance">
                <Container className="py-4">
                    <Switch>
                        {/* ロビーページ */}
                        <Route exact path="/" component={CommunityList} />
                        {/* 各部屋ページ */}
                        <Route path="/community/:symbol" component={Auth} />
                    </Switch>
                </Container>
            </div>
        );
    }
}

export default Entrance;
