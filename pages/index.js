import React, { Component } from "react"
import { Link } from '../routes'

class Index extends Component {

    render() {
        return (
                <Link route='/requests'>
                    <a>Promo Data Parser</a>
                </Link>
        )
    }
}

export default Index