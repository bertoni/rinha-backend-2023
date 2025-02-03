"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const uuid_random_1 = __importDefault(require("uuid-random"));
const PORT = Number(process.env.PORT);
const SHOW_LOG = process.env.SHOW_LOG === 'true';
if (!SHOW_LOG) {
    console.log = function () { };
}
class Pessoa {
    id;
    apelido;
    nome;
    nascimento;
    stack;
    constructor(data) {
        this.id = data.id;
        this.apelido = data.apelido;
        this.nome = data.nome;
        this.nascimento = data.nascimento;
        if (data.stack?.length) {
            this.stack = data.stack.split('|');
            return;
        }
        this.stack = null;
    }
}
const server = (0, fastify_1.default)();
server.get('/ping', async (request, reply) => {
    return 'pong\n';
});
server.post('/pessoas', async (request, reply) => {
    console.log('POST /pessoas route', request.body);
    if (!request.body?.apelido?.length) {
        reply.code(422).send();
        return;
    }
    if (request.body?.apelido?.length > 32) {
        reply.code(422).send();
        return;
    }
    if (!request.body?.nome?.length) {
        reply.code(422).send();
        return;
    }
    if (request.body?.nome?.length > 100) {
        reply.code(422).send();
        return;
    }
    if (!request.body?.nascimento?.length) {
        reply.code(422).send();
        return;
    }
    if (!/^[0-9]{4}(-[0-9]{2}){2}$/.test(request.body.nascimento)) {
        reply.code(422).send();
        return;
    }
    if (request.body.stack) {
        if (!Array.isArray(request.body.stack)) {
            reply.code(422).send();
            return;
        }
        if (!request.body.stack?.length) {
            reply.code(422).send();
            return;
        }
        if (request.body.stack.filter((item) => item.length > 32).length) {
            reply.code(422).send();
            return;
        }
    }
    reply.code(201).header('Location', `/pessoas/${(0, uuid_random_1.default)()}`).send();
});
server.get('/pessoas', async (request, reply) => {
    console.log('GET /pessoas route', request.query);
    if (!request.query?.t?.length) {
        reply.code(400).send();
        return;
    }
    reply.code(200).send([]);
});
server.get('/pessoas/:id', async (request, reply) => {
    console.log('GET /pessoas/:id route', request.params.id);
    if (!request.params?.id?.length) {
        reply.code(400).send();
        return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.params.id)) {
        reply.code(400).send();
        return;
    }
    const result = {
        id: request.params.id,
        apelido: 'Foo',
        nome: 'Baa',
        nascimento: '200-01-01',
        stack: null
    };
    reply.code(200).send(new Pessoa(result));
});
server.get('/contagem-pessoas', async (_request, reply) => {
    console.log('GET /contagem-pessoas route');
    reply.code(200).header('Content-type', 'text/plan').send('0');
});
server.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
