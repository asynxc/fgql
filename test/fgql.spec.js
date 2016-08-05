import chai from 'chai'
import {EndPoint,  DefaultNetworkLayer, QueryObject} from '../lib/fgql.min'
import 'fetch-everywhere'

chai.expect()

const expect = chai.expect

var endPoint
var networkLayer
var queryObject

describe('Testing DefaultNetworkLayer Module', function () {

	describe('Create instance with invalid parameters', function () {
		it('should throw error "provided URI is invalid!"', () => {
			expect(() => new DefaultNetworkLayer('')).to.throw('provided URI is invalid!')
		})
	})

	describe('Create instance without parameters', function () {
		it('should throw error "provided URI is invalid!"', () => {
			expect(() => new DefaultNetworkLayer('')).to.throw('provided URI is invalid!')
		})
	})

	describe('Create instance with valid parameters', function () {
		it('should use passed URI "http://graphql-swapi.parseapp.com/"', () => {
			expect(new DefaultNetworkLayer('http://graphql-swapi.parseapp.com/')).to.have.property('_uri').equal('http://graphql-swapi.parseapp.com/')
		})
	})

	describe('Test DefaultNetworkLayer.performQuery() functionality', () => {
		it('should proccess a query request and fetch results', (done) => {
			networkLayer = new DefaultNetworkLayer('http://localhost:1000/graphql')
			networkLayer.performQuery('query { Viewer{ Groups { label } } }').then((data) => done()).catch((err) => done(err))
		})
	})

})

describe('Testing EndPoint Module', function () {

	describe('Create instance with invalid parameters', function () {
		it('should fallback to default URI "/graphql"', () => {
			expect(new EndPoint({uri: ''})).to.have.property('_uri').equal('/graphql')
		})

		it('should throw error "...Network layer must define performQuery method!"', () => {
			expect(() => new EndPoint({net: () => {}})).to.throw(/performQuery/)
		})
	})

	describe('Create instance without parameters', function () {
		before(() => {
			endPoint = new EndPoint()
		})

		it('should fallback to default URI "/graphql"', () => {
			expect(endPoint).to.have.property('_uri').equal('/graphql')
		})

		it('should use default network layer "DefaultNetworkLayer"', () => {
			expect(endPoint).to.have.property('_net').equal(DefaultNetworkLayer)
		})
	})

	describe('Create instance with valid parameters', function () {
		before(() => {
			endPoint = new EndPoint({
				uri: 'http://graphql-swapi.parseapp.com/',
				net: DefaultNetworkLayer
			})
		})

		it('should use passed URI "http://graphql-swapi.parseapp.com/"', () => {
			expect(endPoint).to.have.property('_uri').equal('http://graphql-swapi.parseapp.com/')
		})

		it('should use passed network layer "DefaultNetworkLayer"', () => {
			expect(endPoint).to.have.property('_net').equal(DefaultNetworkLayer)
		})


	})

	describe('Test EndPoint.fetch() functionality', () => {
		it('should invoke pre-middlwares before start fetching', () => {
			endPoint = new EndPoint({
				uri: 'http://localhost:1000/graphql',
				net: DefaultNetworkLayer
			}).pre((header, context) => next => {
				next({Test: 'Test'}, context)
			}).pre((header, context) => next => {
				expect(header).to.have.property('Test').equal('Test')
			})
			endPoint.fetch('query { Viewer{ Groups { label } } }')
		})

		it('should invoke post-middlwares after done fetching', (done) => {
			endPoint = new EndPoint({
				uri: 'http://localhost:1000/graphql',
				net: DefaultNetworkLayer
			}).post((responce, err, refech, context) => next => {
				done(err)
			})
			endPoint.fetch('query { Viewer{ Groups { label } } }')
		})

		it('should send query request and fetch results', (done) => {
			endPoint = new EndPoint({
				uri: 'http://localhost:1000/graphql',
				net: DefaultNetworkLayer
			})
			endPoint.fetch('query { Viewer{ Groups { label } } }').then((data) => done()).catch((err) => done(err))
		})
	})
})
