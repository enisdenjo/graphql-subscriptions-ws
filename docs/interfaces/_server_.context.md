**[graphql-ws](../README.md)**

> [Globals](../README.md) / ["server"](../modules/_server_.md) / Context

# Interface: Context\<E>

## Type parameters

Name | Default |
------ | ------ |
`E` | unknown |

## Hierarchy

* **Context**

## Index

### Properties

* [acknowledged](_server_.context.md#acknowledged)
* [connectionInitReceived](_server_.context.md#connectioninitreceived)
* [connectionParams](_server_.context.md#connectionparams)
* [extra](_server_.context.md#extra)
* [subscriptions](_server_.context.md#subscriptions)

## Properties

### acknowledged

• `Readonly` **acknowledged**: boolean

Indicates that the connection was acknowledged
by having dispatched the `ConnectionAck` message
to the related client.

___

### connectionInitReceived

• `Readonly` **connectionInitReceived**: boolean

Indicates that the `ConnectionInit` message
has been received by the server. If this is
`true`, the client wont be kicked off after
the wait timeout has passed.

___

### connectionParams

• `Optional` `Readonly` **connectionParams**: Readonly\<Record\<string, unknown>>

The parameters passed during the connection initialisation.

___

### extra

•  **extra**: E

An extra field where you can store your own context values
to pass between callbacks.

An object containing socket and request fields passed from `ws` connection event.

#### Fields:

Name     | Type      |
-------- | --------- |
`socket` | WebSocket |
`request` | http.IncomingMessage |

___

### subscriptions

• `Readonly` **subscriptions**: Record\<[ID](../modules/_types_.md#id), AsyncIterator\<unknown>>

Holds the active subscriptions for this context.
Subscriptions are for **streaming operations only**,
those that resolve once wont be added here.
