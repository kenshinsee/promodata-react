import React, { Component } from "react";
import Layout from "../../components/Layout";
import { InputFile } from "semantic-ui-react-input-file";
import { Button, Form, Input } from "semantic-ui-react";
import factory from '../../ethereum/factory'
import PromoData from '../../ethereum/promoData'
import web3 from "../../ethereum/web3";
import { Router } from '../../routes'

class RequestNew extends Component {

    state = {
        disableButton: true,
        fileContent: null, 
        loading: false, 
        onChainLoading: false, 
        parsedResult: null, 
        parseSuccess: false, 
        description: '', 
        estimatedCost: '', // wei
        disableOnChainButton: false, 
        receiver: '0x69B0d2466d7f3B95B2Bd3677ABFd8D194c2dCF0b'
    }

    uploadFile = event => {
        var file = event.target.files[0]
        var fileReader = new FileReader()
        fileReader.readAsText(file, 'utf-8')

        var progress = document.querySelector('progress')
        progress.max = file.size
        progress.value = 0
        fileReader.onprogress = (event) => {
            progress.value = event.loaded
        }
        fileReader.onload = (event) => {
            var fileContent = fileReader.result
            this.setState({
                disableButton: false, 
                fileContent: fileContent
            })
        }
    }

    formatInput = fileContent => {
        const firstNewLineIndex = fileContent.indexOf("\n")
        let headers = null
        let rows = new Array()
        if (firstNewLineIndex==-1) {
            // only has one line in file
            headers = fileContent
        } else {
            headers = fileContent.slice(0, firstNewLineIndex)
            rows = fileContent.slice(firstNewLineIndex + 1).split("\n")
        }
        if (headers.toLowerCase()!='promo desc') {
            rows.push(headers)
        }
        // rows = new Set(rows) // remove duplicates
        let res = new Array()
        for (let v of rows) {
            res.push( { "promo_desc": v })
        }
        return res
    }

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));  
    }
    
    getJobResult = async (jobid) => {
        const statusUrl = 'https://dev.ksjcloud.com/promocalendarview/queryStatus'
        const body = {
            requestId: jobid
        }
        let retStatus = 2 // running
        let result = null
        while(retStatus==2) {
            await fetch(statusUrl, {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(body)
            }).then((response) => response.json()
            ).then((data) => {
                console.log(data)
                retStatus = data.retStatus
                if(retStatus==0) {
                    result = data.exception
                }
            }).catch((error) => {
              console.error('Error:', error);
            });
            await this.sleep(5000) // wait for 5 secs before next query
        }
        return result
    }

    getResult = async (inputData) => {
        this.setState({
            loading: true, 
            disableButton: true
        })
        const checkUrl = 'https://dev.ksjcloud.com/promocalendar/check_promo_desc'
        const data = {
            data: inputData
        }
        let jobId = null
        await fetch(checkUrl, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Success:', data);
              jobId = data.requestId
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        const result = await this.getJobResult(jobId)
        const fmtResult = new Array(2)
        const promo_desc = new Array()
        const promo_type_dtl = new Array()
        for (let row of result) {
            promo_desc.push(row.promo_desc)
            promo_type_dtl.push(row.promo_type_dtl)
        }
        fmtResult[0] = (promo_desc)
        fmtResult[1] = (promo_type_dtl)
        const estimatedCost = this.estimateCost(fmtResult)
        this.setState({
            loading: false, 
            disableButton: false, 
            parsedResult: fmtResult, 
            parseSuccess: true, 
            estimatedCost: estimatedCost
        })

    }

    onSubmit = async (event) => {
        event.preventDefault()
        const inputData = this.formatInput(this.state.fileContent)
        await this.getResult(inputData)
    }

    estimateCost = (fmtResult) => {
        const cnt = fmtResult[0].length
        let cost = 0
        if(cnt<=10) {
            cost = web3.utils.toWei('0.001', 'ether')
        } else if(cnt<=30) {
            cost = web3.utils.toWei('0.002', 'ether')
        } else {
            cost = web3.utils.toWei('0.003', 'ether')
        }
        return cost
    }

    showForm = () => {
        return (
            <div>
                <hr/>
                <Form
                    onSubmit={this.onChain}
                >
                    <Form.Field>
                        <label>Description</label>
                        <Input
                            value={this.state.description}
                            onChange={event => {this.setState({ description: event.target.value })}}
                        /> 
                    </Form.Field>
                    <Form.Field>
                        <label>Estimated Cost (ether)</label>
                        <Input
                            disabled={true}
                            value={web3.utils.fromWei(this.state.estimatedCost, 'ether')}
                        />
                    </Form.Field>
                    <Button
                        disabled={this.state.disableOnChainButton}
                        loading={this.state.onChainLoading}
                    >
                        Confirm & Process
                    </Button>
                </Form>
            </div>
        )
    }

    onChain = async (event) => {
        event.preventDefault()
        this.setState({
            disableButton: true, 
            disableOnChainButton: true, 
            onChainLoading: true
        })
        const accounts = await web3.eth.getAccounts()
        await factory.methods.createPromoData(this.state.description, 
            this.state.estimatedCost, 
            this.state.receiver).send({
                from: accounts[0], 
                gas: '2000000'
            })
        const address = await factory.methods.getRecentlyCreatedPromoDataAddress().call({
            from: accounts[0]
        })
        const promoData = await PromoData(address)
        await promoData.methods.saveDataAndTransferMoney(this.state.parsedResult[0], 
                                                         this.state.parsedResult[1]
                                                         ).send({
                                                            from: accounts[0], 
                                                            gas: '2000000', 
                                                            value: this.state.estimatedCost
                                                        })
        
        Router.pushRoute(`/requests/${address}`)
    }

    render() {
        return (
            <Layout>
                <label>Create Request</label> 
                <br/>
                <Form>
                    <Form.Field>
                        <InputFile
                            style={{marginTop: '10px'}}
                            input={{
                                id: 'input-control-id',
                                onChange: this.uploadFile
                            }}
                        />
                        <progress value="0"></progress>
                    </Form.Field>
                    <Button 
                        disabled={this.state.disableButton}
                        onClick={this.onSubmit}
                        loading={this.state.loading}
                    >
                        Parse
                    </Button>
               </Form>
               {this.state.parseSuccess ? this.showForm() : null}
            </Layout>
        )
    }
}

export default RequestNew