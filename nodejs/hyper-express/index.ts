import HyperExpress, { Server } from 'hyper-express'
import uuid from 'uuid-random'
import { Prisma, PrismaClient } from '@prisma/client'
import cluster from 'cluster'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'


const PORT = Number(process.env.PORT)
const SHOW_LOG = process.env.SHOW_LOG === 'true'
const FAKE_RESPONSE = process.env.FAKE_RESPONSE === 'true'
const NUM_FORKS = Number(process.env.CLUSTER_WORKERS) || 1;

if (!SHOW_LOG) {
  console.log = function(){}
}

const prisma = new PrismaClient({
  log: SHOW_LOG ? ['query', 'info', 'warn', 'error'] : [],
})

if (SHOW_LOG) {
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

type PessoaProp = {
  id: string
  apelido: string
  nome: string
  nascimento: string
  stack: string|null
}

const formatPessoa = (data: PessoaProp) => {
  const result = {
    id: data.id,
    apelido: data.apelido,
    nome: data.nome,
    nascimento: data.nascimento,
    stack: null
  } as any
  if (data.stack?.length) {
    result.stack = data.stack.split('|')
  }
  return result
}


const createServer = (): Server => {
  const Webserver = new HyperExpress.Server()

  Webserver.get('/health', async (_request, response) => {
    console.log('GET /health')

    response
      .status(200)
      .header('Content-type', 'text/plan')
      .send('health')
  })
  
  Webserver.post('/pessoas', async (request, response) => {
    console.log('POST /pessoas route')
  
    const body = await request.json()
  
    if (!body?.apelido?.length) {
      response.status(422).send()
      return
    }
    if (body?.apelido?.length > 32) {
      response.status(422).send()
      return
    }
  
    if (!body?.nome?.length) {
      response.status(422).send()
      return
    }
    if (body?.nome?.length > 100) {
      response.status(422).send()
      return
    }
  
    if (!body?.nascimento?.length) {
      response.status(422).send()
      return
    }
    if (!/^[0-9]{4}(-[0-9]{2}){2}$/.test(body.nascimento)) {
      response.status(422).send()
      return
    }
  
    if (body.stack) {
      if (!Array.isArray(body.stack)) {
        response.status(422).send()
        return
      }
      if (!body.stack?.length) {
        response.status(422).send()
        return
      }
      if (body.stack.filter((item: string) => item.length > 32).length) {
        response.status(422).send()
        return
      }
      body.stack = body.stack.join('|')
    }
  
    let searchable = `${body.apelido} || ${body.nome}`
    if (body.stack) {
      searchable += ` || ${body.stack}`
    }
  
    try {
      if (FAKE_RESPONSE) {
        response
          .status(201)
          .header('Location', `/pessoas/${uuid()}`)
          .send()
        return
      }
  
      const result = await prisma.pessoa.create({
        data: {
          id: uuid(),
          apelido: body.apelido,
          nome: body.nome,
          nascimento: body.nascimento,
          stack: body.stack,
          searchable
        }
      })
      if (!result) {
        response.status(500).send()
        return
      }
      response
        .status(201)
        .header('Location', `/pessoas/${result.id}`)
        .send()
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code == 'P2002') {
        response.status(422).send()
        return
      }
      response.status(500).send()
    }
  })
  
  Webserver.get('/pessoas', async (request, response) => {
    console.log('GET /pessoas route', request.query)
  
    if (!request.query?.t?.length) {
      response.status(400).send()
      return
    }
  
    if (FAKE_RESPONSE) {
      response.status(200).json([])
      return
    }
  
    const result = await prisma.pessoa.findMany({
      where: {
        searchable: {
          equals: `%${request.query.t}%`,
          mode: "insensitive",
        },
      },
      skip: 0,
      take: 50,
    })
  
    if (!result.length) {
      response.status(200).json([])
      return
    }
  
    response
      .status(200)
      .json(result.map(res => formatPessoa(res)))
  })
  
  Webserver.get('/pessoas/:id', async (request, response) => {
    console.log('GET /pessoas/:id route', request?.path_parameters?.id)
  
    if (!request?.path_parameters?.id?.length) {
      response.status(400).send()
      return
    }
  
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.path_parameters.id)) {
      response.status(400).send()
      return
    }
  
    if (FAKE_RESPONSE) {
      response
        .status(200)
        .type('json')
        .send(JSON.stringify({
          id: request.path_parameters.id,
          apelido: 'Foo',
          nome: 'Baa',
          nascimento: '200-01-01',
          stack: null
        }))
      return
    }
  
    const result = await prisma.pessoa.findUnique({
      where: {
        id: request.path_parameters.id
      }
    })
  
    if (!result) {
      response.status(404).send()
      return
    }
  
    response
      .status(200)
      .type('json')
      .send(JSON.stringify(formatPessoa(result)))
  })
  
  Webserver.get('/contagem-pessoas', async (_request, response) => {
    console.log('GET /contagem-pessoas route')
  
    if (FAKE_RESPONSE) {
      response
      .status(200)
      .header('Content-type', 'text/plan')
      .send('0')
    }
  
    const result = await prisma.pessoa.count()
  
    response
      .status(200)
      .header('Content-type', 'text/plan')
      .send(result.toString())
  })

  return Webserver
}

if (cluster.isPrimary && NUM_FORKS > 1) {
  console.log(`Primary ${process.pid} is running`)

  for (let i = 0; i < NUM_FORKS; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died: code ${code} signal ${signal}`);
  })
} else {
  createServer().listen(PORT)
    .then((_socket) => console.log(`Server listening at ${PORT}`))
    .catch((code) => {
      console.error(`Failed to start webserver on port ${PORT}: ${code}`)
      process.exit(1)
    })
}

