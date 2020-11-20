**[graphql-ws](../README.md)**

> [Globals](../README.md) / ["server"](../modules/_server_.md) / Context

# Interface: Context

## Hierarchy

* **Context**

## Index

### Properties

* [acknowledged](_server_.context.md#acknowledged)
* [connectionInitReceived](_server_.context.md#connectioninitreceived)
* [connectionParams](_server_.context.md#connectionparams)
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

### subscriptions

• `Readonly` **subscriptions**: Record\<[ID](../modules/_types_.md#id), AsyncIterator\<unknown>>

Holds the active subscriptions for this context.
Subscriptions are for **streaming operations only**,
those that resolve once wont be added here.
