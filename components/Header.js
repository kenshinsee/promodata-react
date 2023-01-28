import React from "react"
import { Menu } from "semantic-ui-react"
import { Link } from '../routes'

export default () => {
    return (
        <Menu style={{marginTop: '10px'}}>
            <Link route='/'>
                <a className="item">Promo Data Parser</a>
            </Link>
            <Menu.Menu position='right'>
                <Link route='/requests/new'>
                    <a className="item">New</a>
                </Link>
            </Menu.Menu>
        </Menu>
    )
}
