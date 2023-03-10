// ya yeet
const express = require('express')
const cors = require('cors')
const app = express()

const requestLogger = (request, response, next) => {
	console.log('Method:', request.method)
	console.log('Path:', request.path)
	console.log('Body:', request.body)
	console.log('---')
	next()
}
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}
app.use(cors())
app.use(express.json())
app.use(requestLogger)
let notes = [
	{
		id: 1,
		content: "HTML is EZ",
		important: true
	},
	{
		id: 2,
		content: "Browser can execute only JS",
		important: false
	},
	{
		id: 3,
		content: "GET and POST are the most important methods of HTTP",
		important: true
	}
]

app.get('/', (_request, response) => {
	response.send('<h1>Hello Worldo</h1>')
})

app.get('/api/notes', (_request, response) => {
	response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id)
	const note = notes.find(note => note.id === id)
	if (note) {
		response.json(note)
	} else {
		response.status(404).end() // use end() to respond to the request without sending any data
	}
})

app.delete('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id)
	notes = notes.filter(note => note.id !== id)
	response.status(204).end() // 204 no content
})

const generateId = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
	return maxId
}

app.post('/api/notes', (request, response) => {
	const body = request.body // this is now a JS object

	if (!body.content) {
		return response.status(400).json({ // 400 bad request
			error: "content missing..."
		})
	}

	const note = {
		content: body.content,
		important: body.important || false,
		id: generateId()
	}

	notes = notes.concat(note)
	console.log(note)
	response.json(note)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
