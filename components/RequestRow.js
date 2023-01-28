import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import { Link } from '../routes';

class RequestRow extends Component {

    render() {
        const { Row, Cell } = Table
        const {promoDataAddress, description, createTime } = this.props
        let createDateISOFmt = new Date(parseInt(createTime)*1000).toISOString()
        return (
            <Row>
                <Cell>
                    <Link route={`/requests/${promoDataAddress}`}>
                        <a>{promoDataAddress}</a>
                    </Link>
                </Cell>
                <Cell>{description}</Cell>
                <Cell>{createDateISOFmt}</Cell>
            </Row>
        )
    }
}

export default RequestRow