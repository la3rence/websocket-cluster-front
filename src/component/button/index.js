import { Component } from 'react'

export default class Button extends Component {
    render() {
        return (
            <button {...this.props}
                style={{ border: 'none', textDecoration: 'underline', color: '#c9d1d9', outline: 'none', }}>
            </button>
        )
    }
}
