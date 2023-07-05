/* eslint-disable quotes */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapDBToResponseSong } = require('../utils');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = 'song-' + nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'Insert Into songs values($1, $2, $3, $4, $5, $6, $7, $8, $9) Returning id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('fail post song');
    }
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query;
    if (title !== undefined && performer !== undefined) {
      query = `select id, title, performer from songs where title ilike '%${title}%' and performer ilike '%${performer}%'`;
    } else if (title !== undefined && performer === undefined) {
      query = `select id, title, performer from songs where title ilike '%${title}%'`;
    } else if (title === undefined && performer !== undefined) {
      query = `select id, title, performer from songs where performer ilike '%${performer}%'`;
    } else {
      query = `select id, title, performer from songs`;
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'select id, title, year, genre, performer, duration, album_id from songs where id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('song not found');
    }
    return result.rows.map(mapDBToResponseSong)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('song not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'Delete from songs where id = $1 returning id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('song not found');
    }
  }
}

module.exports = SongService;
