'use strict'

const Sharp = require('./sharp')
const Express = require('express')
const { pick } = require('lodash')
const { key, showInfo, indexMessage, hosted } = require('../config.json')

module.exports = class FlatServer {
    constructor(port) {
        this.PORT = port || process.env.PORT || 8080
        this.STRG = { HIT: 0, ISO: new Date().toISOString(), HOSTED: hosted }

        this.startServer()
    }

    b64(s) {
        return Buffer.from(s, 'base64url').toString('utf8')
    }

    checkAuth(req, res, next) {
        if ( key.length > 0 )
            key.includes(req.headers['X-Flat-Key']) ? next() : res.sendStatus(403)
        else next()
    }

    startServer() {
        Express()
            .use(require('cors')())
            .use(this.checkAuth)
            .get('/', (_, res) => showInfo ? res.json(this.STRG) : res.send(indexMessage))
            .get('/:ext/:quality/:ds', async (req, res) => {
                let { ext, quality, ds } = req.params
                quality = parseInt(quality)

                if ( !ext || !quality || isNaN(quality) || !ds )
                    return res.status(403).send('invalid request params')

                // decode the string
                let D = this.b64(ds)
                // is this URL?
                let B = D.match(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)
            
                if ( B ) {
                    let N = await Sharp(D, {
                        headers: { ...pick(req.headers, ['cookie', 'dnt', 'referer', 'user-agent']) },
                        ext, quality
                    })

                    switch (N[0]) {
                        case 200:
                            this.STRG.HIT++
                            
                            if ( N[2] ) res.setHeader('X-Flat-Original', N[2])
                            res
                                .setHeader('Cache-control', 'public, max-age=259200')
                                .setHeader('Age', '100')
                                .contentType(ext)
                                .end(N[1])
                            break
                        case 302:
                            res
                                .setHeader('location', encodeURI(D))
                                .status(302).end()
                            break
                        default:
                            res.sendStatus(N[0])
                    }
                } else res.sendStatus(404)
            })
            .all('*', (_, res) => res.sendStatus(403))
            .listen(this.PORT, _ => console.log('[ Flat ] server is online, port:', this.PORT))
    }
}