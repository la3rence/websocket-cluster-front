import Button from '../button'
import React, {useEffect, useState} from "react";
import {baseWSURL} from '../../endpoint'
import './card.css'

export default function Client(props) {

    const [websocket, setWebsocket] = useState(null);
    const [connection, setConnection] = useState(false);
    const [msg, setMsg] = useState('');
    const [whichServer, setWhichServer] = useState('');

    const connectWebSocket = userId => {
        const ws = new WebSocket(`${baseWSURL}/websocket/connect/${userId}`)

        ws.onopen = () => {
            setWebsocket(ws)
            setConnection(true)
        }

        ws.onmessage = async (msgEvent) => {
            const message = msgEvent.data
            const msgObj = JSON.parse(message)
            // 用户客户端向消息
            if (msgObj.type === 1) {
                setMsg(msgObj.content)
                await new Promise(r => setTimeout(r, 5000));
                setMsg(null)
            }
            // 服务向消息
            if (msgObj.type === 2) {
                const {serverIp: ip, serverUserCount: userCount} = msgObj
                // 记录客户端对应的服务端，便于展示
                setWhichServer(ip)
                // 调用父组件，最终是 server 兄弟组件的方法
                props.updateServerInfo(ip, userCount);
            }
        }

        ws.onclose = async () => {
            setConnection(false)
            await new Promise(r => setTimeout(r, 5000));
            connectWebSocket(userId)
        }
    };

    useEffect(() => {
        console.log(`【Connection Effect】客户端 ${props.userId} 连接 ${connection ? '打开' : '关闭'}`)
    }, [props.userId, connection])

    useEffect(() => {
        (new Promise(r => setTimeout(r, 2000))
            .then(() => connectWebSocket(props.userId)))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={'card'}>
            <div className={connection ? 'up' : 'down'}/>
            客户端：{props.userId} {whichServer && <small>[{whichServer}]</small>}
            <hr style={{border: 'none'}}/>
            {!connection && '自动连接中...'}
            {msg}
            {connection && <>
                <br/>
                <Button onClick={() => {
                    websocket.close()
                }}>关闭</Button>
            </>}
        </div>
    )
}