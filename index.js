require('dotenv').config() // for process.env stuff
const express = require('express') // node api, handle http requests
const cors = require('cors')
// const mongoose = require('mongoose') // mongoDB api
const Note = require('./models/note') // mongoDB schema
const app = express()
//

// logger middleware definition
const requestlogger = (request, response, next) => {
	console.log('method:', request.method)
	console.log('path:', request.path)
	console.log('body:', request.body)
	console.log('---')
	next()
}

// middleware
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(requestlogger)
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
	Note.find({}).then(notes => {
		response.json(notes)
	})
})

app.get('/api/notes/:id', (request, response, next) => {
	Note.findById(request.params.id)
		.then(note => {
			if (note) {
				response.json(note)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
	const { content, important } = request.body

	Note.findByIdAndUpdate(
		request.params.id,
		{ content, important },
		{ new: true, runValidators: true, context: 'query' }) // new: true to get the new note as updatedNote
		.then(updatedNote => {
			response.json(updatedNote)
		})
		.catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
	Note.findByIdAndRemove(request.params.id)
		.then(_result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

const generateId = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
	return maxId
}

app.post('/api/notes', (request, response, next) => {
	const body = request.body // this is now a JS object

	const note = new Note({
		content: body.content,
		important: body.important || false,
	})

	note.save().then(savedNote => {
		response.json(savedNote)
	})
	.catch(error => next(error))
})

// handle all unknown requests
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
