import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import uuid from 'uuid-random'

const PORT = Number(process.env.PORT)
const SHOW_LOG = process.env.SHOW_LOG === 'true'

if (!SHOW_LOG) {
  console.log = function(){}
}

type PessoaProp = {
  id: string
  apelido: string
  nome: string
  nascimento: string
  stack: string|null
}

class Pessoa {
  readonly id: string
  readonly apelido: string
  readonly nome: string
  readonly nascimento: string
  readonly stack: string[]|null
  constructor(data: PessoaProp){
    this.id = data.id
    this.apelido = data.apelido
    this.nome = data.nome
    this.nascimento = data.nascimento
    if (data.stack?.length) {
      this.stack = data.stack.split('|')
      return
    }
    this.stack = null
  }
}

const server = fastify()

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

type IPostUser = {
  apelido: string
  nome: string
  nascimento: string
  stack: string[] | null
}
server.post('/pessoas', async (request: FastifyRequest<{ Body: IPostUser }>, reply: FastifyReply) => {
  console.log('POST /pessoas route', request.body)

  if (!request.body?.apelido?.length) {
    reply.code(422).send()
    return
  }
  if (request.body?.apelido?.length > 32) {
    reply.code(422).send()
    return
  }

  if (!request.body?.nome?.length) {
    reply.code(422).send()
    return
  }
  if (request.body?.nome?.length > 100) {
    reply.code(422).send()
    return
  }

  if (!request.body?.nascimento?.length) {
    reply.code(422).send()
    return
  }
  if (!/^[0-9]{4}(-[0-9]{2}){2}$/.test(request.body.nascimento)) {
    reply.code(422).send()
    return
  }

  if (request.body.stack) {
    if (!Array.isArray(request.body.stack)) {
      reply.code(422).send()
      return
    }
    if (!request.body.stack?.length) {
      reply.code(422).send()
      return
    }
    if (request.body.stack.filter((item: string) => item.length > 32).length) {
      reply.code(422).send()
      return
    }
    // request.body.stack = request.body.stack.join('|')
  }

  reply.code(201).header('Location', `/pessoas/${uuid()}`).send()
})

server.get('/pessoas', async (request: FastifyRequest<{ Querystring: { t: string } }>, reply: FastifyReply) => {
  console.log('GET /pessoas route', request.query)

  if (!request.query?.t?.length) {
    reply.code(400).send()
    return
  }

  reply.code(200).send([])
})

server.get('/pessoas/:id', async (request: FastifyRequest<{ Params: { id: string }}>, reply: FastifyReply) => {
  console.log('GET /pessoas/:id route', request.params.id)

  if (!request.params?.id?.length) {
    reply.code(400).send()
    return
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.params.id)) {
    reply.code(400).send()
    return
  }

  const result = {
    id: request.params.id,
    apelido: 'Foo',
    nome: 'Baa',
    nascimento: '200-01-01',
    stack: null
  }

  reply.code(200).send(new Pessoa(result))
})

server.get('/contagem-pessoas', async (_request: FastifyRequest, reply: FastifyReply) => {
  console.log('GET /contagem-pessoas route')

  reply.code(200).header('Content-type', 'text/plan').send('0')
})

server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
