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

  xdescribe('allTags', () => {
    it('should be an exported method', () => {
      baton.allTags.should.be.a('function')
    })
  })

  xdescribe('byTag', () => {
    it('should be an exported method', () => {
      baton.byTag.should.be.a('function')
    })
  })

  describe('token', () => {
    it('should be an exported method', () => {
      baton.token.should.be.a('function')
    })

    xit('should resolve with the expected token for team_id and team_domain combination', () => {

    })

    it('should reject if no token for the team_id and team_domain combination can be found', () => {
      baton.token('non', 'existent').should.be.rejected
    })

    it('should reject if the team_id or team_domain is missing', () => {
      baton.token('123').should.be.rejected
      baton.token(null, 'madhax').should.be.rejected
    })
  })

  describe('register', () => {
    it('should be an exported method', () => {
      baton.register.should.be.a('function')
    })

    it('should reject if the token, team_id or team_domain is missing', () => {
      baton.register('token').should.be.rejected
      baton.register(null, 'id').should.be.rejected
      baton.register('token', 'id').should.be.rejected
      baton.register(null, 'id', 'domain').should.be.rejected
      baton.register('token', null, 'domain').should.be.rejected
    })

    xit('should reject if the team is already registered', () => {

    })
  })

  xdescribe('drop', () => {
    it('should be an exported method', () => {
      baton.drop.should.be.a('function')
    })
  })
  
})
