CREATE TABLE users (
  user_id NUMBER PRIMARY KEY,
  user_name VARCHAR2(255),
  user_title VARCHAR2(255) UNIQUE,
  password VARCHAR2(255),
  created_at DATE,
  user_image VARCHAR2(1000)
);

CREATE TABLE posts (
  post_id NUMBER PRIMARY KEY,
  user_id NUMBER,
  content_id NUMBER UNIQUE,
  created_at DATE
);

CREATE TABLE post_music (
  post_id NUMBER,
  music_id NUMBER,
  music_type CHAR(1),
  created_at DATE,
  PRIMARY KEY (post_id, music_id)
);

CREATE TABLE comments (
  comment_id NUMBER PRIMARY KEY,
  user_id NUMBER,
  content_id NUMBER UNIQUE,
  created_at DATE,
  post_id NUMBER,
  parent_id NUMBER,
  like_count NUMBER
);

CREATE TABLE vote (
  content_id NUMBER,
  user_id NUMBER,
  type CHAR(1),
  content_type CHAR(1),
  created_at DATE,
  PRIMARY KEY (content_id, user_id)
);

CREATE TABLE visited (
  post_id NUMBER,
  user_id NUMBER,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE following (
  follower_id NUMBER,
  followee_id NUMBER,
  followd_at DATE,
  PRIMARY KEY (follower_id, followee_id)
);

CREATE TABLE playlists (
  pl_id NUMBER PRIMARY KEY,
  playlist_name VARCHAR2(255),
  user_id NUMBER,
  created_at DATE,
  access_type CHAR(1)
);

CREATE TABLE playlist_song (
  pl_id NUMBER,
  song_id NUMBER,
  PRIMARY KEY (pl_id, song_id)
);

CREATE TABLE playlist_access (
  pl_id NUMBER,
  user_id NUMBER,
  PRIMARY KEY (pl_id, user_id)
);

CREATE TABLE ratings (
  rating_id NUMBER PRIMARY KEY,
  stars NUMBER,
  content_id NUMBER UNIQUE,
  user_id NUMBER,
  music_id NUMBER,
  music_type CHAR(1),
  created_at DATE,
  vote_count NUMBER
);

CREATE TABLE upvotes (
  rating_id NUMBER,
  user_id NUMBER,
  PRIMARY KEY (rating_id, user_id)
);

CREATE TABLE text_content (
  content_id NUMBER PRIMARY KEY,
  text CLOB
);


-- posts
ALTER TABLE posts ADD FOREIGN KEY (user_id) REFERENCES users (user_id);

-- text_content
ALTER TABLE text_content ADD FOREIGN KEY (content_id) REFERENCES posts (content_id);
ALTER TABLE text_content ADD FOREIGN KEY (content_id) REFERENCES comments (content_id);
ALTER TABLE text_content ADD FOREIGN KEY (content_id) REFERENCES ratings (content_id);

-- post_music
ALTER TABLE post_music ADD FOREIGN KEY (post_id) REFERENCES posts (post_id);
ALTER TABLE post_music ADD FOREIGN KEY (music_id) REFERENCES songs (song_id);
ALTER TABLE post_music ADD FOREIGN KEY (music_id) REFERENCES albums (album_id);

-- comments
ALTER TABLE comments ADD FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE comments ADD FOREIGN KEY (post_id) REFERENCES posts (post_id);
ALTER TABLE comments ADD CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (comment_id);


-- vote
ALTER TABLE vote ADD FOREIGN KEY (content_id) REFERENCES posts (post_id);
ALTER TABLE vote ADD FOREIGN KEY (content_id) REFERENCES comments (comment_id);
ALTER TABLE vote ADD FOREIGN KEY (user_id) REFERENCES users (user_id);

-- visited
ALTER TABLE visited ADD FOREIGN KEY (post_id) REFERENCES posts (post_id);
ALTER TABLE visited ADD FOREIGN KEY (user_id) REFERENCES users (user_id);

-- following
ALTER TABLE following ADD FOREIGN KEY (follower_id) REFERENCES users (user_id);
ALTER TABLE following ADD FOREIGN KEY (followee_id) REFERENCES users (user_id);

-- playlists
ALTER TABLE playlists ADD FOREIGN KEY (user_id) REFERENCES users (user_id);

-- playlist_song
ALTER TABLE playlist_song ADD FOREIGN KEY (pl_id) REFERENCES playlists (pl_id);
ALTER TABLE playlist_song ADD FOREIGN KEY (song_id) REFERENCES songs (song_id);

-- playlist_access
ALTER TABLE playlist_access ADD FOREIGN KEY (pl_id) REFERENCES playlists (pl_id);
ALTER TABLE playlist_access ADD FOREIGN KEY (user_id) REFERENCES users (user_id);

-- ratings
ALTER TABLE ratings ADD FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE ratings ADD FOREIGN KEY (music_id) REFERENCES songs (song_id);
ALTER TABLE ratings ADD FOREIGN KEY (music_id) REFERENCES albums (album_id);

-- upvotes
ALTER TABLE upvotes ADD FOREIGN KEY (rating_id) REFERENCES ratings (rating_id);
ALTER TABLE upvotes ADD FOREIGN KEY (user_id) REFERENCES users (user_id);


CREATE SEQUENCE user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE post_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE comment_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE rating_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE playlist_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE content_seq START WITH 1 INCREMENT BY 1;

