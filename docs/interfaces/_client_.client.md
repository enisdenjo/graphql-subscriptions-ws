**[graphql-ws](../README.md)**

> [Globals](../README.md) / ["client"](../modules/_client_.md) / Client

# Interface: Client

## Hierarchy

* [Disposable](_types_.disposable.md)

  ↳ **Client**

## Index

### Properties

* [dispose](_client_.client.md#dispose)

### Methods

* [on](_client_.client.md#on)
* [subscribe](_client_.client.md#subscribe)

## Properties

### dispose

•  **dispose**: () => void \| Promise\<void>

*Inherited from [Disposable](_types_.disposable.md).[dispose](_types_.disposable.md#dispose)*

Dispose of the instance and clear up resources.

## Methods

### on

▸ **on**\<E>(`event`: E, `listener`: [EventListener](../modules/_client_.md#eventlistener)\<E>): function

Listens on the client which dispatches events about the socket state.

#### Type parameters:

Name | Type |
------ | ------ |
`E` | [Event](../modules/_client_.md#event) |

#### Parameters:

Name | Type |
------ | ------ |
`event` | E |
`listener` | [EventListener](../modules/_client_.md#eventlistener)\<E> |

**Returns:** function

___

### subscribe

▸ **subscribe**\<T>(`payload`: [SubscribePayload](_message_.subscribepayload.md), `sink`: [Sink](_types_.sink.md)\<T>): function

Subscribes through the WebSocket following the config parameters. It
uses the `sink` to emit received data or errors. Returns a _cleanup_
function used for dropping the subscription and cleaning stuff up.

#### Type parameters:

Name | Default |
------ | ------ |
`T` | unknown |

#### Parameters:

Name | Type |
------ | ------ |
`payload` | [SubscribePayload](_message_.subscribepayload.md) |
`sink` | [Sink](_types_.sink.md)\<T> |

**Returns:** function
