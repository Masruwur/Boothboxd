from models import Album,Song,Genre,Artist
import register


def query_album(search_query,sp,cursor):
    try:
        results = sp.search(q=f'album:{search_query}', type='album', limit=1)
        album_data = results['albums']['items'][0]

        # Create Album object
        album = Album(
            id=album_data['id'],
            name=album_data['name'],
            image=album_data['images'][1]['url'] if album_data['images'] else None,
            date=album_data['release_date']
        )

        album_entry_id = register.register_album(cursor,album)


        # Get all tracks in album
        tracks = sp.album_tracks(album.id)
        songs = []
        artist_dict = {}
        genre_dict = {}

        for track in tracks['items']:
            song = Song(id=track['id'], name=track['name'], album_id=album_entry_id)
            songs.append(song)
            song_entry_id = register.register_song(cursor,song)

            for artist_info in track['artists']:
                artist_id = artist_info['id']
                artist_detail = sp.artist(artist_id)
                artist_obj = Artist(
                        id=artist_detail['id'],
                        name=artist_detail['name'],
                        image=artist_detail['images'][1]['url'] if artist_detail['images'] else None,
                        date=None  # Spotify doesn't expose artist creation dates
                )

                if artist_id not in artist_dict:
                    artist_dict[artist_id] = artist_obj
                    artist_entry_id = register.register_artist(cursor,artist_obj)
                else:
                    artist_entry_id = register.get_artist_id(cursor,artist_obj.name)
                register.register_song_artist(cursor,song_entry_id,artist_entry_id)


                # Add genres
                for genre_name in artist_detail['genres']:
                    genre_object = Genre(None,genre_name)
                    if genre_name not in genre_dict:
                        genre_dict[genre_name] = True
                        genre_entry_id = register.register_genre(cursor,genre_object)
                    else:
                        genre_entry_id = register.get_genre_id(cursor,genre_name)
                    register.register_song_genre(cursor,song_entry_id,genre_entry_id)
        return True
    except:
        return False
         
    
