import React, { Component } from 'react'
import Button from './component/button'
import Client from './component/client'
import ServerList from './component/server'
import './App.css';

const baseDomain = process.env.REACT_APP_BASE_DOMAIN
const baseURL = `https://${baseDomain}`

export default class App extends Component {

  state = {
    clients: [],
    inputUserId: '',
    inputMessage: '',
  }

  // 调用链：子组件 Client -> 调用此父组件的方法 -> 调用子组件 Server 方法。
  callServerListUpdate = (ip, userCount) => {
    this.childServerComponent.updateServerInfo(ip, userCount);
  }

  onRef = (ref) => {
    this.childServerComponent = ref
  }

  createClient = async () => {
    this.state.clients.push(this.state.clients.length + 1)
    this.setState({
      clients: this.state.clients
    })
  }

  sendMessageToClient = async () => {
    const { inputUserId: userId, inputMessage: message } = this.state
    const res = await fetch(`${baseURL}/websocket/send?userId=${userId}&message=${message}`)
    const isSent = await res.text() // string returned
    if (isSent === 'false') {
      alert(`发送给 ${userId} 的消息 ${message} 失败`)
    }
  }

  handleInputUserId = (event) => {
    this.setState({
      inputUserId: event.target.value
    })
  }

  handleInputMessage = (event) => {
    this.setState({
      inputMessage: event.target.value
    })
  }

  render() {
    return (
      <div className="App">
        <ServerList onRef={this.onRef}></ServerList>
        <div className='top20'>
          <br />
          <Button onClick={this.createClient}>
            + WebSocket 客户端
          </Button>
        </div>
        <div>
          推送消息到客户端：
          <input value={this.state.inputUserId} onChange={this.handleInputUserId} placeholder={'客户端 ID'} style={{ border: 'none' }}></input>
          <input value={this.state.inputMessage} onChange={this.handleInputMessage} placeholder={'消息'} style={{ border: 'none' }}></input>
          <Button onClick={this.sendMessageToClient}>发送</Button>
        </div>
        <div className='top20'>
          <div className="cards">
            {this.state.clients.map((i) => {
              return <Client userId={i} key={i} updateServerInfo={(ip, userCount) => { this.callServerListUpdate(ip, userCount) }}></Client>
            })}
          </div>
        </div>
      </div >
    )
  }
}
