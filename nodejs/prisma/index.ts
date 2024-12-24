import express, { Express, NextFunction, Request, Response, Router } from 'express'
import cluster from 'cluster'
import { Prisma, PrismaClient } from '@prisma/client'

const PORT = process.env.PORT
const SHOW_LOG = process.env.SHOW_LOG === 'true'
const NUM_FORKS = Number(process.env.CLUSTER_WORKERS) || 1;

if (!SHOW_LOG) {
  console.log = function(){}
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

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

export function createServer(): Express {

  const app: Express = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb', strict: true }))

  app.use((err: SyntaxError, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.log('Erro na validacao do body', { erro: err.message })
      res.status(400).send({ error: err.message })
      return
    }
    next()
  })

  const route = Router()

  route.post('/pessoas', async (req: Request, res: Response): Promise<void> => {
    console.log('POST /pessoas route', req.body)

    if (!req.body?.apelido?.length) {
      res.status(422).end()
      return
    }
    if (req.body?.apelido?.length > 32) {
      res.status(422).end()
      return
    }

    if (!req.body?.nome?.length) {
      res.status(422).end()
      return
    }
    if (req.body?.nome?.length > 100) {
      res.status(422).end()
      return
    }

    if (!req.body?.nascimento?.length) {
      res.status(422).end()
      return
    }
    if (!/^[0-9]{4}(-[0-9]{2}){2}$/.test(req.body.nascimento)) {
      res.status(422).end()
      return
    }

    if (req.body.stack) {
      if (!Array.isArray(req.body.stack)) {
        res.status(422).end()
        return
      }
      if (!req.body.stack?.length) {
        res.status(422).end()
        return
      }
      if (req.body.stack.filter((item: string) => item.length > 32).length) {
        res.status(422).end()
        return
      }
      req.body.stack = req.body.stack.join('|')
    }

    let searchable = `${req.body.apelido} || ${req.body.nome}`
    if (req.body.stack) {
      searchable += ` || ${req.body.stack}`
    }

    try {
      const result = await prisma.pessoa.create({
        data: {
          apelido: req.body.apelido,
          nome: req.body.nome,
          nascimento: req.body.nascimento,
          stack: req.body.stack,
          searchable
        },
      })
      if (!result) {
        res.status(500).end()
        return
      }
      res.status(201).set('Location', `/pessoas/${result.id}`).end()
    } catch (error) {
      res.status(500).end()
      return
    }
  })

  route.get('/pessoas/:id', async (req: Request, res: Response): Promise<void> => {
    console.log('GET /pessoas/:id route', req.params)

    if (!req.params?.id?.length) {
      res.status(400).end()
      return
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
      res.status(400).end()
      return
    }

    const result = await prisma.pessoa.findUnique({
      where: {
        id: req.params.id
      }
    })

    if (!result) {
      res.status(404).end()
      return
    }

    res.status(200).send(new Pessoa(result)).end()
  })

  route.get('/pessoas', async (req: Request, res: Response): Promise<void> => {
    console.log('GET /pessoas route', req.query)

    if (!req?.query?.t?.length) {
      res.status(400).end()
      return
    }

    const result = await prisma.pessoa.findMany({
      where: {
        searchable: {
          equals: `%${req.query.t}%`,
          mode: "insensitive",
        },
      },
    })

    if (!result.length) {
      res.status(200).send([]).end()
      return
    }

    res.status(200).send(result.map(res => new Pessoa(res))).end()
  })

  route.get('/contagem-pessoas', async (req: Request, res: Response): Promise<void> => {
    console.log('GET /contagem-pessoas route')

    const result = await prisma.pessoa.count()

    res.status(200).set('Content-type', 'text/plan').send(result.toString()).end()
  })

  app.use(route)
  
  return app
}

const app = createServer()
if (cluster.isPrimary && NUM_FORKS > 1) {
  console.log(`Primary ${process.pid} is running`)

  for (let i = 0; i < NUM_FORKS; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died: code ${code} signal ${signal}`);
  })
} else {
  app.listen(PORT, async () => {
    console.info('Server is running', { address: `http://localhost:${PORT}` })
  })
}
