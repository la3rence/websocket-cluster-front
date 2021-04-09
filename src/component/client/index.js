import React, {Component} from 'react'
import './card.css'
import Button from './../button'

const baseWSURL = process.env.REACT_APP_WS_URL

export default class Client extends Component {

    state = {
        websocket: null,
        connection: false,
        msg: '',
        whichServer: '',
    }

    async componentDidMount() {
        const {userId} = this.props
        await new Promise(r => setTimeout(r, 2000));
        this.connectWebSocket(userId)
    }

    doClose = () => {
        this.state.websocket.close()
    }

    connectWebSocket = (userId) => {
        const ws = new WebSocket(`${baseWSURL}/websocket/connect/${userId}`)

        ws.onopen = () => {
            this.setState({
                websocket: ws,
                connection: true
            })
            console.log(`client ${userId} open`)
        }

        ws.onmessage = async (msgEvent) => {
            const message = msgEvent.data
            console.log(`${userId} 收到: ${message}`);
            const msgObj = JSON.parse(message)
            // 用户向消息
            if (msgObj.type === 1) {
                this.setState({
                    msg: msgObj.content,
                })
                await new Promise(r => setTimeout(r, 5000));
                this.setState({
                    msg: null,
                })
            }
            // 服务向消息
            if (msgObj.type === 2) {
                const {serverIp: ip, serverUserCount: userCount} = msgObj
                // 记录客户端对应的服务端，便于展示
                this.setState({
                    whichServer: ip,
                })
                // 调用父组件，最终是 server 兄弟组件的方法
                this.props.updateServerInfo(ip, userCount);
            }
        }

        ws.onclose = async () => {
            this.setState({
                connection: false
            })
            console.log(`client ${userId} closed!`)
            // reconnect
            await new Promise(r => setTimeout(r, 5000));
            this.connectWebSocket(userId)
        }
    }

    render() {
        const {userId} = this.props
        return <div className='card'>
            <div className={this.state.connection ? 'up' : 'down'}/>
            客户端：{userId} {this.state.whichServer && <small>[{this.state.whichServer}]</small>}
            <hr style={{border: 'none'}}/>
            {!this.state.connection && '自动连接中...'}
            {this.state.msg}
            {this.state.connection && <>
                <br/>
                <Button onClick={this.doClose}>
                    关闭
                </Button>
            </>}
        </div>
    }
}
