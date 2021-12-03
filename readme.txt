-----------
flat-server
-----------

config.json:
- key          : list of string for api authentication
- threshold    : minimum image bytes to perform compression
- showInfo     : show info HIT and ISO on index path as json
- indexMessage : fallback message if the "showInfo" is disabled
- hosted       : watermark/hosted info for "showInfo"


request params:
- /:extension/:quality/:url
--- extension : image format/extension (e.g: png)
--- quality   : positive integers range 1 - 100
--- url       : base64url encoded full url w/ protocol


request headers:
- X-Flat-Key : api key (only needed if config.json:key at least have 1 string)


user headers (request):
- cookie     : bypassing image origin if cookie info is needed
- user-agent : spoof the user-agent request match to user browser
- dnt        : do not track browser header
- referer    : referer header from origin address


response headers:
- X-Flat-Original : original image size before compression


port input:
- "PORT" environment variable
- 8080


