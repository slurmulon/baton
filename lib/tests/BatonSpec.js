import * as baton from '../src/baton'
import chai from 'chai'

chai.should() // use "should-style" assertions (proto based)

const mockDbRun = (btn) => {run: (_, fn) => fn(null, btn)}

describe('baton', () => {

  describe('.pass', () => {
    it('should be an exported method', () => {
      baton.pass.should.be.a('function')
    })

    describe('when provided valid links', () => {
      it('should resolve with the valid baton', () => {
        baton.pass({link: 'http://madhax.io'}).should.be.fulfilled
      })
    })

    describe('when provided invalid links', () => {
      it('falsy link', () => {
        baton.pass().should.be.rejected
        baton.pass('').should.be.rejected
        baton.pass(null).should.be.rejected
      })

      it('malformed link', () => {
        baton.pass({link: 'http://foo'}).should.be.rejected
      })
    })
  })

  xdescribe('drop', () => {
    it('should be an exported method', () => {
      baton.drop.should.be.a('function')
    })
  })

  xdescribe('find', () => {
    it('should be an exported method', () => {
      baton.find.should.be.a('function')
    })
  })

  xdescribe('all', () => {
    it('should be an exported method', () => {
      baton.all.should.be.a('function')
    })
  })

  xdescribe('byId', () => {
    it('should be an exported method', () => {
      baton.byId.should.be.a('function')
    })
  })

  xdescribe('token', () => {
    it('should be an exported method', () => {
      baton.token.should.be.a('function')
    })
  })

  xdescribe('register', () => {
    it('should be an exported method', () => {
      baton.register.should.be.a('function')
    })
  })
  
})
