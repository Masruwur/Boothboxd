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
