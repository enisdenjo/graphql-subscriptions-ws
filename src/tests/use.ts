import http from 'http';
import {
  MessageType,
  stringifyMessage,
  parseMessage,
  SubscribePayload,
} from '../message';
import { createTClient } from './utils';

import { tServers } from './fixtures/simple';
import WebSocket from 'ws';

for (const { tServer, startTServer } of tServers) {
  const itForWS = tServer === 'ws' ? it : it.skip,
    itForUWS = tServer === 'uWebSockets.js' ? it : it.skip;

  describe(tServer, () => {
    it('should gracefully go away when disposing', async () => {
      const server = await startTServer();

      const client1 = await createTClient(server.url);
      const client2 = await createTClient(server.url);

      await server.dispose(true);

      await client1.waitForClose((event) => {
        expect(event.code).toBe(1001);
        expect(event.reason).toBe('Going away');
        expect(event.wasClean).toBeTruthy();
      });
      await client2.waitForClose((event) => {
        expect(event.code).toBe(1001);
        expect(event.reason).toBe('Going away');
        expect(event.wasClean).toBeTruthy();
      });
    });

    it('should add the initial request and websocket in the context extra', async (done) => {
      const server = await startTServer({
        onConnect: (ctx) => {
          if (tServer === 'uWebSockets.js') {
            // uWebSocket.js does not export classes, we can rely on the name only
            expect(ctx.extra.socket.constructor.name).toEqual('uWS.WebSocket');
            expect(ctx.extra.request.constructor.name).toEqual(
              'uWS.HttpRequest',
            );
          } else if (tServer === 'ws') {
            expect(ctx.extra.socket).toBeInstanceOf(WebSocket);
            expect(ctx.extra.request).toBeInstanceOf(http.IncomingMessage);
          } else {
            throw new Error('Missing test case for ' + tServer);
          }
          done();
          return false; // reject client for sake of test
        },
      });

      const client = await createTClient(server.url);
      client.ws.send(
        stringifyMessage<MessageType.ConnectionInit>({
          type: MessageType.ConnectionInit,
        }),
      );
    });

    it('should close the socket with errors thrown from any callback', async () => {
      const error = new Error('Stop');

      // onConnect
      let server = await startTServer({
        onConnect: () => {
          throw error;
        },
      });
      const client = await createTClient(server.url);
      client.ws.send(
        stringifyMessage<MessageType.ConnectionInit>({
          type: MessageType.ConnectionInit,
        }),
      );
      await client.waitForClose((event) => {
        expect(event.code).toBe(1011);
        expect(event.reason).toBe(error.message);
        expect(event.wasClean).toBeTruthy();
      });
      await server.dispose();

      async function test(
        url: string,
        payload: SubscribePayload = {
          query: `query { getValue }`,
        },
      ) {
        const client = await createTClient(url);
        client.ws.send(
          stringifyMessage<MessageType.ConnectionInit>({
            type: MessageType.ConnectionInit,
          }),
        );

        await client.waitForMessage(({ data }) => {
          expect(parseMessage(data).type).toBe(MessageType.ConnectionAck);
          client.ws.send(
            stringifyMessage<MessageType.Subscribe>({
              id: '1',
              type: MessageType.Subscribe,
              payload,
            }),
          );
        });

        await client.waitForClose((event) => {
          expect(event.code).toBe(1011);
          expect(event.reason).toBe(error.message);
          expect(event.wasClean).toBeTruthy();
        });
      }

      // onSubscribe
      server = await startTServer({
        onSubscribe: () => {
          throw error;
        },
      });
      await test(server.url);
      await server.dispose();

      server = await startTServer({
        onOperation: () => {
          throw error;
        },
      });
      await test(server.url);
      await server.dispose();

      // execute
      server = await startTServer({
        execute: () => {
          throw error;
        },
      });
      await test(server.url);
      await server.dispose();

      // subscribe
      server = await startTServer({
        subscribe: () => {
          throw error;
        },
      });
      await test(server.url, { query: 'subscription { greetings }' });
      await server.dispose();

      // onNext
      server = await startTServer({
        onNext: () => {
          throw error;
        },
      });
      await test(server.url);
      await server.dispose();

      // onError
      server = await startTServer({
        onError: () => {
          throw error;
        },
      });
      await test(server.url, { query: 'query { noExisto }' });
      await server.dispose();

      // onComplete
      server = await startTServer({
        onComplete: () => {
          throw error;
        },
      });
      await test(server.url);
      await server.dispose();
    });

    it('should close the socket on request if schema is left undefined', async () => {
      const { url } = await startTServer({
        schema: undefined,
      });

      const client = await createTClient(url);

      client.ws.send(
        stringifyMessage<MessageType.ConnectionInit>({
          type: MessageType.ConnectionInit,
        }),
      );

      await client.waitForMessage(({ data }) => {
        expect(parseMessage(data).type).toBe(MessageType.ConnectionAck);
        client.ws.send(
          stringifyMessage<MessageType.Subscribe>({
            id: '1',
            type: MessageType.Subscribe,
            payload: {
              operationName: 'TestString',
              query: `query TestString {
                  getValue
                }`,
              variables: {},
            },
          }),
        );
      });

      await client.waitForClose((event) => {
        expect(event.code).toBe(1011);
        expect(event.reason).toBe('The GraphQL schema is not provided');
        expect(event.wasClean).toBeTruthy();
      });
    });

    it('should close the socket on empty arrays returned from `onSubscribe`', async () => {
      const { url } = await startTServer({
        onSubscribe: () => {
          return [];
        },
      });

      const client = await createTClient(url);

      client.ws.send(
        stringifyMessage<MessageType.ConnectionInit>({
          type: MessageType.ConnectionInit,
        }),
      );

      await client.waitForMessage(({ data }) => {
        expect(parseMessage(data).type).toBe(MessageType.ConnectionAck);
      });

      client.ws.send(
        stringifyMessage<MessageType.Subscribe>({
          id: '1',
          type: MessageType.Subscribe,
          payload: {
            query: 'subscription { ping }',
          },
        }),
      );

      await client.waitForClose((event) => {
        expect(event.code).toBe(1011);
        expect(event.reason).toBe(
          'Invalid return value from onSubscribe hook, expected an array of GraphQLError objects',
        );
        expect(event.wasClean).toBeTruthy();
      });
    });

    it('should close socket with error thrown from the callback', async () => {
      const error = new Error("I'm a teapot");

      const { url } = await startTServer({
        onConnect: () => {
          throw error;
        },
      });

      const client = await createTClient(url);
      client.ws.send(
        stringifyMessage<MessageType.ConnectionInit>({
          type: MessageType.ConnectionInit,
        }),
      );

      await client.waitForClose((event) => {
        expect(event.code).toBe(1011);
        expect(event.reason).toBe(error.message);
        expect(event.wasClean).toBeTruthy();
      });
    });

    itForWS(
      'should report server errors to clients by closing the connection',
      async () => {
        const { url, ws } = await startTServer();

        const client = await createTClient(url);

        const emittedError = new Error("I'm a teapot");
        ws.emit('error', emittedError);

        await client.waitForClose((event) => {
          expect(event.code).toBe(1011); // 1011: Internal Error
          expect(event.reason).toBe(emittedError.message);
          expect(event.wasClean).toBeTruthy(); // because the server reported the error
        });
      },
    );

    describe('Keep-Alive', () => {
      it('should dispatch pings after the timeout has passed', async (done) => {
        const { url } = await startTServer(undefined, 50);

        const client = await createTClient(url);
        client.ws.send(
          stringifyMessage<MessageType.ConnectionInit>({
            type: MessageType.ConnectionInit,
          }),
        );

        client.ws.once('ping', () => done());
      });

      it('should not dispatch pings if disabled with nullish timeout', async (done) => {
        const { url } = await startTServer(undefined, 0);

        const client = await createTClient(url);
        client.ws.send(
          stringifyMessage<MessageType.ConnectionInit>({
            type: MessageType.ConnectionInit,
          }),
        );

        client.ws.once('ping', () => fail('Shouldnt have pinged'));

        setTimeout(done, 50);
      });

      it('should terminate the socket if no pong is sent in response to a ping', async () => {
        const { url } = await startTServer(undefined, 50);

        const client = await createTClient(url);
        client.ws.send(
          stringifyMessage<MessageType.ConnectionInit>({
            type: MessageType.ConnectionInit,
          }),
        );

        // disable pong
        client.ws.pong = () => {
          /**/
        };

        // ping is received
        await new Promise((resolve) => client.ws.once('ping', resolve));

        // termination is not graceful or clean
        await client.waitForClose((event) => {
          expect(event.code).toBe(1006);
          expect(event.wasClean).toBeFalsy();
        });
      });
    });
  });
}
