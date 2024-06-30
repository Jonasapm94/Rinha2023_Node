const express = require('express')
const db = require('./db')
const app = express()
const port = `${process.env.API_PORT}`
const { v4: uuidv4 } = require('uuid');
const cluster = require('cluster')
const { logger } = require('./logger');

app.use(express.json())

db.query(`Select * from pessoas`).then(resposta => {
    console.log(resposta.rows)
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Api listening on port ${port}`)
})


app.post('/pessoas', async (req, res) => {
    try {
        const pessoa = req.body
        if (pessoa.apelido === null ||
            pessoa.nome === null ||
            pessoa.nascimento === null) {
            // const error = new Error("Unprocessable Entity/Content")
            // error.code = '23505'
            // throw error
            res.status(422).send("Unprocessable Entity/Content")
        }
        if (typeof pessoa.apelido !== 'string' ||
            typeof pessoa.nome !== 'string' ||
            typeof pessoa.nascimento !== 'string') {
            // const error = new Error("Bad Request")
            // error.code = '400'
            // throw error
            res.status(400).send("Bad Request")
        }
        let stackValue
        if (pessoa.stack !== null) {
            pessoa.stack.forEach(element => {
                if (typeof element !== 'string') {
                    // const error = new Error("Bad Request")
                    // error.code = '400'
                    // throw error
                    res.status(400).send("Bad Request")
                }
            });
            stackValue = pessoa.stack

        } else {
            stackValue = []
        }



        db.query(`
            INSERT INTO pessoas(id, apelido, nome, nascimento, stack) 
            VALUES($1, $2, $3, $4, $5)
            RETURNING id
        `, [uuidv4(), pessoa.apelido, pessoa.nome, pessoa.nascimento, stackValue])
            .then(result => {
                const id = result.rows[0].id
                res.setHeader("Location", `/pessoas/${id}`).status(201).send(id)
            })
            .catch(error => {
                if (error.code === '23505') {
                    res.status(422).send("Unprocessable Entity/Content")
                } else {
                    res.status(400).send("Bad Request")
                }
            })
    } catch (error) {
        if (error.code === '23505') {
            res.status(422).send("Unprocessable Entity/Content")
        } else {
            res.status(400).send("Bad Request")
        }
    }
})

app.get('/pessoas/:id', (req, res) => {
    try {
        db.query(`
            SELECT * FROM pessoas WHERE id = $1
        `, [req.params.id]).then(results => {
            if (results.rows.length === 0) {
                res.sendStatus(404)
            } else {
                res.status(200).send(results.rows[0])
            }
        })
    } catch (error) {
        console.error(error)
    }
})

app.get('/pessoas', (req, res) => {
    try {
        if (req.query.t === '' || Object.keys(req.query).length === 0) {
            res.sendStatus(400)
        } else {
            const termo = '%' + req.query.t + '%'
            db.query(`
                SELECT *
                FROM pessoas
                WHERE apelido ILIKE $1 OR 
                    nome ILIKE $1 OR
                    EXISTS (SELECT 1 FROM unnest(stack) s WHERE s ILIKE $1)
                LIMIT 50;
            `, [termo]).then(results => {
                res.status(200).send(results.rows);
            });
        }
    } catch (error) {
        console.error(error);
    }
});

app.get(`/contagem-pessoas`, (req, res) => {
    try {
        db.query(`
        SELECT COUNT(id) FROM pessoas
    `).then(result => {
            res.status(200).send(result.rows[0].count)
        })
    } catch (error) {
        console.error(error)
    }
})

app.delete('/pessoas', (req, res) => {
    console.log('chegou aqui')
    db.query(` delete from pessoas where 1=1`)
        .then(() => res.sendStatus(200))
})

const numForks = Number(process.env.CLUSTER_WORKERS) || 1;

if (cluster.isPrimary && process.env.CLUSTER === 'true') {
    logger.info(`index.js: Primary ${process.pid} is running`);

    for (let i = 0; i < numForks; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.info(`index.js: worker ${worker.process.pid} died: code ${code} signal ${signal}`);
    });
} else {
    const serverApp = app.listen(process.env.API_PORT, () => {
        logger.info(`index.js:${process.pid}:Listening on ${process.env.API_PORT}`);
    });

    if (process.env.USE_TIMEOUT === 'true') {
        serverApp.setTimeout(TIMEOUT)
        logger.info(`Starting with timeout as ${TIMEOUT}ms`)

        serverApp.on('timeout', (socket) => {
            logger.warn(`Timing out connection`);
            socket.end();
        })
    }
}

