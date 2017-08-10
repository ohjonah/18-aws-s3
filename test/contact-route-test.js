'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Contact = require('../model/contact.js');
const Promise = require('bluebird');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleContact = {
  name: 'Test Contact',
  dob: '10/12/1984',
  phone: 2065555555,
};

describe('Contact Routes', function() {

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Contact.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/contact', function() {
    beforeEach( done => {
      let user = new User(exampleUser);

      user.generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    it('200: should return a contact', done => {
      request.post(`${url}/api/contact`)
      .send(exampleContact)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).equal(200);
        done();
      });
    });

    it('401: no token provided', done => {
      request.post(`${url}/api/contact`)
      .send(exampleContact)
      .set({
        Authorization: ''
      })
      .end((err, res) => {
        expect(res.status).equal(401);
        done();
      });
    });

    it('400: no body provided', done => {
      request.post(`${url}/api/contact`)
      .send()
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).equal(400);
        done();
      });
    });
  });

  describe('GET: /api/contact/:id', () => {
    beforeEach( done => {
      let user = new User(exampleUser);

      user.generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      exampleContact.userID = this.tempUser._id.toString();
      new Contact(exampleContact).save()
      .then( contact => {
        this.tempContact = contact;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete exampleContact.userID;
    });

    it('200: should return a contact', done => {
      request.get(`${url}/api/contact/${this.tempContact._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body.name).equal(exampleContact.name);
        expect(res.status).equal(200);
        done();
      });
    });

    it('401: no token provided', done => {
      request.get(`${url}/api/contact/${this.tempContact._id}`)
      .set({
        Authorization: ''
      })
      .end((err, res) => {
        expect(res.status).equal(401);
        done();
      });
    });

    it('404: should return no request found', done => {
      request.get(`${url}/api/contact/12345`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).equal(404);
        done();
      });
    });
  });

  describe('PUT: /api/contact/id:', () => {
    beforeEach( done => {
      let user = new User(exampleUser);

      user.generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      exampleContact.userID = this.tempUser._id.toString();
      new Contact(exampleContact).save()
      .then( contact => {
        this.tempContact = contact;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete exampleContact.userID;
    });

    let updated = { name: 'My Updated Contact', phone: 2531111111};

    it('200: should update an existing contact', done => {
      request.put(`${url}/api/contact/${this.tempContact._id}`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).equal(200);
        expect(res.body.name).equal(updated.name);
        expect(res.body.phone).equal(updated.phone);
        done();
      });
    });

    it('401: no token provided', done => {
      request.put(`${url}/api/contact/${this.tempContact._id}`)
      .send(updated)
      .set({
        Authorization: ''
      })
      .end((err, res) => {
        expect(res.status).equal(401);
        done();
      });
    });

    it('400: no update provided', done => {
      request.put(`${url}/api/contact/${this.tempContact._id}`)
      .send()
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).equal(400);
        done();
      });
    });

    it('404: valid request but no id found', done => {
      request.put(`${url}/api/contact/12345`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).equal(404);
        done();
      });
    });
  });
});
