var DefaulNetworkLayer = require('./Network/Default')
var warning = require('warning')
var invariant = require('invariant')

const init = {
	uri: '/graphql',
	net: DefaulNetworkLayer,
	options: {},
	context: {}
}

export default class EndPoint {

	constructor ({uri = '', net = init.net, options = init.options, context = init.context} = init) {
		warning(uri && uri !== '',
		`no URI provided, fallback for default ${init.uri}!`)

		invariant(net && net.prototype && typeof net.prototype.performQuery === FUNCTION,
		'provided custom Network layer must define "performQuery" method!')

		this._options = options
		this._net = net
		this._uri = uri && uri !== '' ? uri : init.uri
		this._context = context
		this._preMdls = []
		this._postMdls = []

		this.pre = this.pre.bind(this)
		this.post = this.post.bind(this)
		this.fetch = this.fetch.bind(this)
		this._processFetch = this._processFetch.bind(this)
	}

	pre (...mdl) {
		this._preMdls = this._preMdls.concat(mdl)
		return this
	}

	post (...mdl) {
		this._postMdls = this._postMdls.concat(mdl)
		return this
	}

	fetch (query) {
		return new Promise((resolve, reject) => {
			let tmp = [].concat(
				this._preMdls,
				(headers) => next => this._processFetch(query, headers)(next),
				this._postMdls,
				(response, err) => _ => err ? reject(err) : resolve(response)
			)

			tmp.reverse().forEach((mdl) => {
				const currIndex = tmp.indexOf(mdl)
				const nxtfunc = currIndex ? tmp[currIndex - 1] : void 0
				tmp[currIndex] = (...args) => mdl(...args)(nxtfunc)
			})

			tmp[tmp.length - 1]({}, {...this._context})
		})
	}

	_processFetch (query, headers) {
		return next => {
			const _net = new this._net(this._uri, {...this._options})
			_net.performQuery(query, headers).then(
				(response) => next(response, void 0, {...this.context}, () => this.fetch(query))
			).catch(
				(err) => next(void 0, err, {...this.context}, () => this.fetch(query)))
		}
	}
}
