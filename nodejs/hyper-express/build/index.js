"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hyper_express_1 = __importDefault(require("hyper-express"));
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
const Webserver = new hyper_express_1.default.Server();
Webserver.post('/pessoas', async (request, response) => {
    console.log('POST /pessoas route');
    const body = await request.json();
    if (!body?.apelido?.length) {
        response.status(422).send();
        return;
    }
    if (body?.apelido?.length > 32) {
        response.status(422).send();
        return;
    }
    if (!body?.nome?.length) {
        response.status(422).send();
        return;
    }
    if (body?.nome?.length > 100) {
        response.status(422).send();
        return;
    }
    if (!body?.nascimento?.length) {
        response.status(422).send();
        return;
    }
    if (!/^[0-9]{4}(-[0-9]{2}){2}$/.test(body.nascimento)) {
        response.status(422).send();
        return;
    }
    if (body.stack) {
        if (!Array.isArray(body.stack)) {
            response.status(422).send();
            return;
        }
        if (!body.stack?.length) {
            response.status(422).send();
            return;
        }
        if (body.stack.filter((item) => item.length > 32).length) {
            response.status(422).send();
            return;
        }
    }
    response
        .status(201)
        .header('Location', `/pessoas/${(0, uuid_random_1.default)()}`)
        .send();
});
Webserver.get('/pessoas', async (request, response) => {
    console.log('GET /pessoas route', request.query);
    if (!request.query?.t?.length) {
        response.status(400).send();
        return;
    }
    response
        .status(200)
        .type('json')
        .send(JSON.stringify([]));
});
Webserver.get('/pessoas/:id', async (request, response) => {
    console.log('GET /pessoas/:id route', request?.path_parameters?.id);
    if (!request?.path_parameters?.id?.length) {
        response.status(400).send();
        return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.path_parameters.id)) {
        response.status(400).send();
        return;
    }
    const result = {
        id: request.path_parameters.id,
        apelido: 'Foo',
        nome: 'Baa',
        nascimento: '200-01-01',
        stack: null
    };
    response
        .status(200)
        .type('json')
        .send(JSON.stringify(new Pessoa(result)));
});
Webserver.get('/contagem-pessoas', async (request, response) => {
    console.log('GET /contagem-pessoas route');
    response
        .status(200)
        .header('Content-type', 'text/plan')
        .send('0');
});
Webserver.listen(PORT)
    .then((socket) => console.log(`Server listening at ${PORT}`))
    .catch((code) => {
    console.error(`Failed to start webserver on port ${PORT}: ${code}`);
    process.exit(1);
});
