const express = require('express')
const db = require('./db')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.post('/pessoas', async (req,res) => {
    try {
        const pessoa = req.body
        if (pessoa.apelido === null ||
            pessoa.nome === null   ||
            pessoa.nascimento === null) {
            const error = new Error("Unprocessable Entity/Content")
            error.code = '23505'
            throw error
        } 
        if (typeof pessoa.apelido !== 'string' ||
        typeof pessoa.nome !== 'string' ||
        typeof pessoa.nascimento !== 'string' ){
            const error = new Error("Bad Request")
            error.code = '400'
            throw error
        }
        let stackValue
        if (pessoa.stack !== null){
            pessoa.stack.forEach(element => {
                if(typeof element !== 'string'){
                    const error = new Error("Bad Request")
                    error.code = '400'
                    throw error
                }
            });
            stackValue = pessoa.stack
        
        } else {
            stackValue = []
        }

        const id = await db.query(`
            INSERT INTO pessoas(apelido, nome, nascimento, stack) 
            VALUES($1, $2, $3, $4)
            RETURNING id
        `, [pessoa.apelido, pessoa.nome, pessoa.nascimento, stackValue])
        .then(result =>  result.rows[0].id)
        res.setHeader("Location", `/pessoas/${id}`).status(201).send(id)
    } catch (error) {
        if (error.code === '23505'){
            res.status(422).send("Unprocessable Entity/Content")
        } else {
            res.status(400).send("Bad Request")
        }
        console.error(error)
    }
})

app.get('/pessoas/:id', (req,res)=> {
    try {
        db.query(`
            SELECT * FROM pessoas WHERE id = $1
        `, [req.params.id]).then(results => {
            if(results.rows.length === 0){
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
        console.log(req.query);
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
    } catch (error) {
        console.error(error);
    }
});
