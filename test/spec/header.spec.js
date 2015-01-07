
'use strict';

var Header = require('header');

describe('Header', function() {
	describe('#constructor', function() {
		it('should create empty header with no arguments', function() {
			var h = new Header();
			expect(h).to.not.be.null;
		});
		it('should parse strings', function() {
			var h = new Header('Basic ff33');
			expect(h).to.not.be.null;
		});
		it('should handle objects', function() {
			var h = new Header({ scheme: 'basic', token: 'ff33' });
			expect(h).to.not.be.null;
		});
		it('should handle arrays', function() {
			var h = new Header(['Basic ff33', 'Bearer potato']);
			expect(h).to.not.be.null;
		});
		it('should fail on boolean values', function() {
			expect(function() {
				var h = new Header(true);
				expect(h).to.not.be.null;
			}).to.throw(TypeError);
		});
		it('should work as a plain function', function() {
			var header = Header;
			expect(header()).to.not.be.null;
		});
	});

	describe('.parse', function() {
		it('should create new header', function() {
			expect(Header.parse('Basic xyz')).to.be.an.instanceof(Header);
		});
	});

	describe('.format', function() {
		it('should generate strings', function() {
			expect(Header.format({ scheme: 'Basic' })).to.be.a.string;
		});
	});

	describe('#is', function() {
		it('should return true if types match', function() {
			var h = new Header({ scheme: 'basic', token: 'ff33' });
			expect(h.is('Basic')).to.be.true;
		});
		it('should return false if types do not match', function() {
			var h = new Header({ scheme: 'basic', token: 'ff33' });
			expect(h.is('bas')).to.be.false;
		});
		it('should return true if query matches', function() {
			var h = new Header('Basic cheese=edam');
			expect(h.is('basic', { cheese: 'edam' })).to.be.true;
		});
		it('should return false if query does not match', function() {
			var h = new Header('Basic cheese=edam');
			expect(h.is('basic', { cheese: 'cheddar' })).to.be.false;
		});
	});

	describe('#for', function() {
		beforeEach(function() {
			this.header = new Header([
				'Basic cheese=edam,color=blue',
				'Basic cheese=cheddar,color=red',
				'Bearer love=real'
			]);
		});
		it('should return the matching entry', function() {
			expect(this.header.for('Basic', { cheese: 'edam' }).params)
				.to.have.property('color', 'blue');
		});
		it('should return null on no match', function() {
			expect(this.header.for('Potato')).to.be.null;
		});
		it('should throw error in the ambiguous case', function() {
			var header = this.header;
			expect(function() {
				header.for('Basic');
			}).to.throw(Error);
		});
		it('should treat empty params as null params', function() {
			var header = new Header([
				'Basic foo'
			]);
			expect(header.for('Basic', { }).params).to.not.be.null;
		});
	});

	describe('#length', function() {
		it('should return the number of header entries', function() {
			var h = new Header(['Basic ff33', 'Bearer potato']);
			expect(h).to.have.property('length', 2);
		});
	});

});
