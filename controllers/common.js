"use strict";

function ping(request, response) {
	response.json('pong')
	response.end()
}

module.exports = { ping }
