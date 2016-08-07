var warning = require('warning')
var invariant = require('invariant')
var isArray = require('lodash/isArray')

const init = {
	timeout: () => 3000,
	retries: (attempt) => [1000, 2000][attempt] // 3 attemps in total
}

export default class DefaultNetworkLayer {

	constructor (uri, {timeout, retries} = init) {
		invariant(typeof uri === STRING && uri !== '', 'provided URI is invalid!')

		this._uri = uri
		this._timeout = isArray(timeout) ? (attempt) => timeout[attempt - 1] || init.timeout()
						: (typeof timeout === NUMBER) ? () => timeout
						: (typeof timeout === FUNCTION) ? (attempt) => timeout(attempt) || init.timeout()
						: init.timeout
		this._retries = isArray(retries) ? (attempt) => retries[attempt - 1]
						: (typeof retries === NUMBER) ? (attempt) => attempt < 3 && retries
						: (typeof retries === FUNCTION) ? retries
						: init.retries
		this.performQuery = this.performQuery.bind(this)
		this._performQuery = this._performQuery.bind(this)
	}

	performQuery (query, headers) {
		this._attempt = 0
		return this._performQuery(query, headers)
	}

	_performQuery (query, headers) {
		return new Promise((resolve, reject) => {
			const options = {
				body: JSON.stringify({
					query: query
				}),
				headers: {
					'Accept': '*/*',
					'Content-Type': 'application/json',
					...headers
				},
				method: 'POST'
			}

			_fetch = _fetch.bind(this) /* eslint no-func-assign:[0] */

			function _fetch (options) {
				const res = fetch(this._uri, {...options})
				const _attempt = this._attempt

				let timer = setTimeout(() => {
					const retryInt = this._retries(++this._attempt)
					warning(false, `Fetch attemp n° ${this._attempt} timed out.`)
					warning(retryInt, `Fetch failed after ${this._attempt} attemps!.`)

					retryInt
					? setTimeout(() => _fetch(options), retryInt)
					: reject(new Error(`Fetch failed after ${this._attempt} attemps!.`))
				}, this._timeout(_attempt + 1))

				res.then(
					(response) => {
						clearTimeout(timer)
						_attempt === this._attempt && response.json()
							.then((data) => data && data.errors ? reject(data.errors) : resolve(data.data))
							.catch((err) => reject(err))
					}
				).catch(
					(err) => _attempt === this._attempt && (clearTimeout(timer) || reject(err))
				)
			}

			_fetch(options)
		})
	}

}
