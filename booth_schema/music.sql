-- Create tables
CREATE TABLE albums (
  album_id NUMBER PRIMARY KEY,
  album_name VARCHAR2(255),
  album_image VARCHAR2(1000),
  release_year DATE
);

CREATE TABLE songs (
  song_id NUMBER PRIMARY KEY,
  song_name VARCHAR2(255),
  album_id NUMBER
);

CREATE TABLE artists (
  artist_id NUMBER PRIMARY KEY,
  artist_name VARCHAR2(255),
  artist_image VARCHAR2(1000),
  join_date DATE
);

CREATE TABLE genres (
  genre_id NUMBER PRIMARY KEY,
  genre_name VARCHAR2(100)
);

CREATE TABLE song_artist (
  song_id NUMBER,
  artist_id NUMBER,
  PRIMARY KEY (song_id, artist_id)
);

CREATE TABLE song_genre (
  genre_id NUMBER,
  song_id NUMBER,
  PRIMARY KEY (genre_id, song_id)
);

-- Foreign key constraints
ALTER TABLE songs ADD CONSTRAINT fk_songs_album
  FOREIGN KEY (album_id) REFERENCES albums(album_id);

ALTER TABLE song_artist ADD CONSTRAINT fk_song_artist_song
  FOREIGN KEY (song_id) REFERENCES songs(song_id);

ALTER TABLE song_artist ADD CONSTRAINT fk_song_artist_artist
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id);

ALTER TABLE song_genre ADD CONSTRAINT fk_song_genre_genre
  FOREIGN KEY (genre_id) REFERENCES genres(genre_id);

ALTER TABLE song_genre ADD CONSTRAINT fk_song_genre_song
  FOREIGN KEY (song_id) REFERENCES songs(song_id);

CREATE SEQUENCE SONG_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ALBUM_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ARTIST_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE GENRE_SEQ START WITH 1 INCREMENT BY 1;
