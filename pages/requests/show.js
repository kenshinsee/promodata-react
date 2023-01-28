import React, { Component } from "react";
import Layout from "../../components/Layout";
import { Card } from "semantic-ui-react";
import PromoData from "../../ethereum/promoData";
import { Link } from '../../routes'
import web3 from "../../ethereum/web3";

class RequestShow extends Component {

    static async getInitialProps(props) {
        const { address } = props.query
        const promoData = await PromoData(address)
        const summary = await promoData.methods.getSummary().call()
        return { summary, address }
    }

    renderDetail = () => {
        const { summary } = this.props
        const description = summary[0]
        const accountId = summary[1]
        const estimatedValue = summary[3]
        const promoCount = summary[4]

        return (
            <Card.Group itemsPerRow="1" style={{marginTop: '10px'}}>
                <Card>
                    <Card.Content>
                        <Card.Header>{accountId}</Card.Header>
                        <Card.Meta>Requester</Card.Meta>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content>
                        <Card.Header>{description}</Card.Header>
                        <Card.Meta>Request description</Card.Meta>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Content>
                        <Card.Header>{web3.utils.fromWei(estimatedValue, 'ether')}</Card.Header>
                        <Card.Meta>Cost fee for the request (ether)</Card.Meta>
                    </Card.Content>
                </Card>
                <Link route={`/requests/${this.props.address}/promodetail`}>
                    <Card>
                        <Card.Content>
                            <Card.Header>{promoCount}</Card.Header>
                            <Card.Meta>Promo count in the request</Card.Meta>
                        </Card.Content>
                    </Card>
                </Link>
            </Card.Group>
        )
    }

    render() {
        return (
            <Layout>
                <label>Request Detail</label>
                {this.renderDetail()}
            </Layout>
        )
    }
}

export default RequestShow