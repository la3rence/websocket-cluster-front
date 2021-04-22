import {useRef, useState} from "react";
import ServerList from "./component/server/server_hook";
import Button from "./component/button";
import Client from "./component/client/client_hook";
import './App.css';

const baseURL = process.env.REACT_APP_REST_URL

export default function App() {
    const [clients, setClients] = useState([])
    const [inputUserId, setInputUserId] = useState('')
    const [inputMessage, setInputMessage] = useState('')

    // react hooks 提供 useRef 的 Hook API，通过它可以让父组件调用子组件的方法
    const childRef = useRef()

    const callServerListUpdate = (ip, userCount) => {
        childRef.current.updateServerInfo(ip, userCount)
    }

    const sendMessageToClient = async () => {
        const res = await fetch(`${baseURL}/websocket/send?userId=${inputUserId}&message=${inputMessage}`)
        const isSent = await res.text() // string returned
        if (isSent === 'false') {
            alert(`发送给 ${inputUserId} 的消息 ${inputMessage} 失败`)
        }
    }

    return (
        <div className="App">
            <ServerList ref={childRef}/>
            <div className='top20'>
                <br/>
                <Button onClick={() => setClients([...clients, clients.length + 1])}>
                    + WebSocket 客户端
                </Button>
            </div>
            <div>
                推送消息到客户端：
                <input value={inputUserId} onChange={event => setInputUserId(event.target.value)}
                       placeholder={'客户端 ID'} style={{border: "none"}}/>
                <input value={inputMessage} onChange={event => setInputMessage(event.target.value)}
                       placeholder={'消息'} style={{border: "none"}}/>
                <Button onClick={sendMessageToClient}>发送</Button>
            </div>
            <div className='top20'>
                <div className="cards">
                    {clients.map((i) => {
                        return <Client userId={i} key={i} updateServerInfo={(ip, userCount) => {
                            callServerListUpdate(ip, userCount)
                        }}/>
                    })}
                </div>
            </div>
        </div>
    )
}