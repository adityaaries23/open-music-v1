const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = 'album-' + nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'Insert Into albums values($1, $2, $3, $4, $5) Returning id',
      values: [id, name, year, createdAt, updatedAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('fail post album');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('select id, name, year from albums');
    return result.rows;
  }

  async getAlbumById(albumId) {
    const query = {
      text: 'select id, name, year from albums where id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('album not found');
    }
    const { id, name, year } = result.rows[0];
    const query2 = {
      text: 'select id, title, performer from songs where album_id = $1',
      values: [id],
    };
    const result2 = await this._pool.query(query2);
    const songs = result2.rows;

    return {
      id,
      name,
      year,
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('album not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('album not found');
    }
  }
}

module.exports = AlbumService;
