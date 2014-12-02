
// We use multiple `WWW-Authenticate` headers following the notes herein: http://stackoverflow.com/questions/10239970/what-is-the-delimiter-for-www-authenticate-for-multiple-schemes

'use strict';

module.exports = {
	parse: require('./parse'),
	format: require('./format')
};
