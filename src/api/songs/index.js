const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songHandler = new AlbumHandler(service, validator);
    server.route(routes(songHandler));
  },
};
