import json
from .models import Album,Song,Artist,Genre
from .register import register_album,register_song,register_artist,register_song_artist,get_artist_id,register_song_genre,register_genre,get_genre_id


def getAlbumArtists(cursor,album_name):
    query = """
               SELECT distinct (SELECT artist_name FROM artists WHERE artist_id = SA.artist_id) FROM
               songs S JOIN ALBUMS A ON (S.ALBUM_ID = A.ALBUM_ID )
               JOIN SONG_ARTIST SA ON( SA.SONG_ID = S.SONG_ID )
               WHERE A.album_name = :album_name 
            """
    cursor.execute(query,{
        'album_name' : album_name
    })

    res = cursor.fetchall()
    return res

def getArtistSongs(cursor,artist_name):
    query = """
             SELECT (SELECT song_name from songs where song_id = SA.song_id ) from song_artist SA
             where artist_id = (SELECT artist_id from artists where artist_name = :artist_name)
            """
    cursor.execute(query,{
        'artist_name' : artist_name
    })

    res = cursor.fetchall()
    return res

def search_albums(sp,search_query):
    results = sp.search(q=search_query, type='album', limit=5)
    albums = []

    for item in results['albums']['items']:
        album = {
            'id': item['id'],
            'name': item['name'],
            'image': item['images'][1]['url'] if item['images'] else None,
            'artist': item['artists'][0]['name'] if item['artists'] else None,
            'date': item['release_date'][:4]
        }
        albums.append(album)

    return albums \
    
def reg_album_by_id(album_id, sp, cursor):
    try:
        album_data = sp.album(album_id)

        # Create Album object
        album = Album(
            id=album_data['id'],
            name=album_data['name'],
            image=album_data['images'][1]['url'] if len(album_data['images']) > 1 else album_data['images'][0]['url'] if album_data['images'] else None,
            date=album_data['release_date']
        )

        # Register the album in your database
        album_entry_id = register_album(cursor, album)
        
         # Get all tracks in album
        tracks = sp.album_tracks(album.id)
        songs = []
        artist_dict = {}
        genre_dict = {}

        for track in tracks['items']:
            song = Song(id=track['id'], name=track['name'], album_id=album_entry_id)
            songs.append(song)
            song_entry_id = register_song(cursor,song)

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
                    artist_entry_id = register_artist(cursor,artist_obj)
                else:
                    artist_entry_id = get_artist_id(cursor,artist_obj.name)
                register_song_artist(cursor,song_entry_id,artist_entry_id)


                # Add genres
                for genre_name in artist_detail['genres']:
                    genre_object = Genre(None,genre_name)
                    if genre_name not in genre_dict:
                        genre_dict[genre_name] = True
                        genre_entry_id = register_genre(cursor,genre_object)
                    else:
                        genre_entry_id = get_genre_id(cursor,genre_name)
                    register_song_genre(cursor,song_entry_id,genre_entry_id)
        return True
    except Exception as e:
        print(e)
        return False



