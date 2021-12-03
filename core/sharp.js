'use strict'

const { threshold } = require('../config.json')
const Axios = require('axios').default
const Sharp = require('sharp')

const GetImage = async (url, headers) => {
    return (await Axios.get(url, { headers, responseType: 'arraybuffer' })).data
}

const CompressImage = async (url, headers, ext, quality) => {
    let Image = await GetImage(url, headers)

    return Sharp(Image)
        .toFormat(ext, {
            quality,
            progressive: true,
            optimizeScans: true
        })
        .toBuffer()
}

module.exports = async (url, { headers, ext, quality }) => {
    try {
        let R = await Axios.head(url, { headers })
        let H = R.headers
        let S = R.status

        if ( S !== 200 ) return [403]

        if ( !H['content-type'].startsWith('image/') )
            return [403]

        if ( parseInt(H['content-length']) < threshold )
            return [302]

        return [200, await CompressImage(url, headers, ext, quality), H['content-length']]
    } catch (err) { 
        console.error(err)
        return [403]
    }
}