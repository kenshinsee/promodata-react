import React, { Component } from "react";
import Layout from "../../components/Layout";
import PromoData from "../../ethereum/promoData";
import { Table } from "semantic-ui-react";
import { Link } from '../../routes'

class PromoDetail extends Component {

    static async getInitialProps(props) {
        const { address } = props.query
        const promoData = await PromoData(address)
        const promoDetail = await promoData.methods.getPromoData().call()

        return { promoDetail, address }
    }

    renderRows = () => {
        return this.props.promoDetail.map((data, index) => {
            return (
                <Table.Row>
                    <Table.Cell>{data.promoDesc}</Table.Cell>
                    <Table.Cell>{data.promoParsedResult}</Table.Cell>
                </Table.Row>
            )
        })
    }

    render() {
        const  {Header, HeaderCell, Row} = Table
        return (
            <Layout>
                <div>
                    <Link route={`/requests/${this.props.address}`}>
                        <label>
                            <a>Promo Detail</a>
                        </label>
                    </Link> &gt; <label>Promo Desc</label>
                </div>
                <Table celled size="small" style={{marginTop: '10px'}}>
                    <Header>
                        <Row>
                            <HeaderCell>Promo Description</HeaderCell>
                            <HeaderCell>Identified Promo Types</HeaderCell>
                        </Row>
                    </Header>
                    <Table.Body>
                        {this.renderRows()}
                    </Table.Body>
                </Table>
            </Layout>
        )
    }

}

export default PromoDetail
