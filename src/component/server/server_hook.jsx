import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import Button from '../button'
import {baseURL} from "../../endpoint";
import '../../App.css';

function ServerList(props, ref) {
    const [containers, setContainers] = useState([]);
    const [serverInfo, setServerInfo] = useState([]);
    const [namingInfo, setNamingInfo] = useState([]);

    // 更新：为了兄弟组件调用 -> 先提升到父组件
    // 子组件需要 useImperativeHandle
    useImperativeHandle(ref, () => ({
        // updateServerInfo 就是暴露给父组件的方法
        updateServerInfo: (ip, userCount) => {
            console.log(`更新 ip 为 ${ip} 的数量到 ${userCount}`)
            // 判断是否已经有 IP
            if (!serverInfo.some((element) => {
                const sameIp = element.ip === ip
                if (sameIp) {
                    element.userCount = userCount
                }
                return sameIp
            })) {
                serverInfo.push({ip, userCount})
            }
            setServerInfo(serverInfo);
        }
    }))

    useEffect(() => {
        // 获取服务列表
        getContainer().then()
        const dataPolling = setInterval(async () => {
            await getServerStatus();
        }, 5000);
        return () => {
            clearInterval(dataPolling);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const createContainer = async () => {
        const res = await fetch(`${baseURL}/docker/run?imageName=websocket:1.0.0`);
        const messageOrId = await res.text();
        if (res.status === 200) {
            await getContainer();
        } else {
            alert(messageOrId);
        }
    }

    useEffect(() => {
        console.log(`【Server Effect】服务端实例数量变动为：${containers.length}`)
    }, [containers])

    const removeContainer = async (containerId) => {
        const res = await fetch(`${baseURL}/docker/rm?containerId=${containerId}`);
        await res.text();
        await getContainer();
    }

    const getContainer = async () => {
        const res = await fetch(`${baseURL}/docker/ps?containerName=websocket-server`)
        const ps = await res.json()
        setContainers(ps)
        await getServerStatus();
    }

    const getServerStatus = async () => {
        const res = await fetch(`${baseURL}/discovery/naming`);
        const ipAndStatusJSON = await res.json();
        setNamingInfo(ipAndStatusJSON)
    }

    return (
        <div className='top20'>
            <Button onClick={getContainer}>刷新 WebSocket 服务列表</Button>
            <table style={{margin: '0 auto'}}>
                <thead>
                <tr>
                    <th>🐳 ContainerID</th>
                    <th>ImageName</th>
                    <th>ContainerName</th>
                    <th>ClusterIP</th>
                    <th>State</th>
                    <th>WebSocketClients</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {containers.map((v, i) => {
                    const serverIPAddress = v.NetworkSettings.Networks['compose-network'].IPAddress
                    const isHealthy = namingInfo[serverIPAddress]
                    return <tr key={i}>
                        <td>{v.Id.slice(0, 12)}</td>
                        <td>{v.Image}</td>
                        <td>{v.Names[0].slice(1)}</td>
                        <td>{serverIPAddress}</td>
                        <td>
                            <div className={v.State === 'running' ?
                                (isHealthy ? 'up' : 'unhealthy') : 'down'}/>
                        </td>
                        <td>{serverInfo.filter((element) => {
                            return element.ip === serverIPAddress
                        }).map((v) => {
                            return v.userCount
                        })}
                        </td>
                        <td>{<Button onClick={() => removeContainer(v.Id)}>下线</Button>}</td>
                    </tr>
                })}
                </tbody>
            </table>
            <Button onClick={createContainer}>
                + WebSocket 服务实例
            </Button>
        </div>
    )
}

export default forwardRef(ServerList);