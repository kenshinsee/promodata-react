import React, { Component } from "react"
import Layout from "../../components/Layout"
import web3 from "../../ethereum/web3"
import factory from '../../ethereum/factory'
import { Table } from "semantic-ui-react"
import RequestRow from "../../components/RequestRow"

class PromoDataIndex extends Component {

    static async getInitialProps() {
        const accounts = await web3.eth.getAccounts()
        const promoDataStructList = await factory.methods.getPromoDataStructList().call({
            from: accounts[0]
        })
        return { accounts, promoDataStructList }
    }

    renderRequestRows = () => {
        return this.props.promoDataStructList.map((data, id) => {
            return (
                <RequestRow
                    key={id}
                    promoDataAddress={data.promoDataAddress}
                    description={data.description}
                    createTime={data.createTime}
                />
            )
        })

    }

    renderRequestHistory = () => {
        return (
            <Table celled size="small" style={{marginTop: '10px'}}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Create Time</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.renderRequestRows()}
                </Table.Body>
            </Table>
        )
    }

    render() {
        return (
            <Layout>
                <div>
                    <label>Request History</label>
                    {this.renderRequestHistory()}
                </div>
            </Layout>
        )
    }
}

export default PromoDataIndex