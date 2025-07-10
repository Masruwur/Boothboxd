import oracledb

def normalize_release_date(date_str):
    if len(date_str) == 4:
        return f"{date_str}-01-01"
    elif len(date_str) == 7:
        return f"{date_str}-01"
    return date_str

def get_artist_id(cursor,artist_name):
    query = "SELECT artist_id FROM artists where artist_name = :name"
    cursor.execute(query,{
        'name' : artist_name
    })
    res = cursor.fetchone()
    return res[0] if res else None

def get_album_id(cursor,album_name):
    query = "SELECT album_id FROM albums where UPPER(album_name) = UPPER(:name)"
    cursor.execute(query,{
        'name' : album_name
    })
    res = cursor.fetchone()
    return res[0] if res else None



def get_genre_id(cursor,genre_name):
    query = "SELECT genre_id FROM genres where genre_name = :name"
    cursor.execute(query,{
        'name' : genre_name
    })
    res = cursor.fetchone()
    return res[0] if res else None

def register_song_genre(cursor,song_id,genre_id):
    query = """ INSERT INTO song_genre
                VALUES (:genre_id,:song_id)      
            """
    cursor.execute(query,{
        'genre_id' : genre_id,
        'song_id' : song_id
    })

def register_song_artist(cursor,song_id,artist_id):
    query = """ INSERT INTO song_artist
                VALUES (:song_id,:artist_id)      
            """
    cursor.execute(query,{
        'song_id' : song_id,
        'artist_id' : artist_id
    })

def register_album(cursor,album):
    query = " SELECT ALBUM_SEQ.NEXTVAL FROM dual"
    cursor.execute(query)
    album_id = cursor.fetchone()[0]


    query = """ INSERT INTO albums
                VALUES (:id,:name,:image,TO_DATE(:year,'YYYY-MM-DD'))      
            """
    try:   
        cursor.execute(query,{
            'id' : album_id,
            'name' : album.name,
            'image' : album.image,
            'year' : normalize_release_date(album.date),
        })
        return album_id
    except oracledb.Error as e:
        print(e)
        return None



def register_song(cursor,song):
    query = " SELECT SONG_SEQ.NEXTVAL FROM dual"
    cursor.execute(query)
    song_id = cursor.fetchone()[0]

    query = """ INSERT INTO songs
                VALUES (:id,:name,:album)      
            """
    try:   
        cursor.execute(query,{
            'id' : song_id,
            'name' : song.name,
            'album' : song.album_id
        })
        return song_id
    except oracledb.Error as e:
        print(e)
        return None
    

def register_artist(cursor,artist):
    artist_id = get_artist_id(cursor,artist.name)
    if artist_id is not None:
        return artist_id

    query = " SELECT ARTIST_SEQ.NEXTVAL FROM dual"
    cursor.execute(query)
    artist_id = cursor.fetchone()[0]

    query = """ INSERT INTO artists
                VALUES (:id,:name,:image,SYSDATE)     
            """
    try:   
        cursor.execute(query,{
            'id' : artist_id,
            'name' : artist.name,
            'image' : artist.image
        })
        return artist_id
    except oracledb.Error as e:
        print(e)
        return None
    

def register_genre(cursor,genre):
     genre_id = get_genre_id(cursor,genre.name)
     if genre_id is not None:
        return genre_id

     query = " SELECT GENRE_SEQ.NEXTVAL FROM dual"
     cursor.execute(query)
     genre_id = cursor.fetchone()[0]

     query = """ INSERT INTO genres
                 VALUES (:id,:name)     
             """
     try:   
        cursor.execute(query,{
            'id' : genre_id,
            'name' : genre.name
        })
        return genre_id
     except oracledb.Error as e:
        print(e)
        return None
     
def register_album_price(cursor,album_info):
    album_id = get_album_id(cursor,album_info['album_name'])
    if album_id is None:
        print(f"{album_info['album_name']} not found")
        return False
    
    query1 = """
              INSERT INTO prices VALUES
              (PRICES_SEQ.NEXTVAL,:id,'PRCS',SYSDATE,ADD_MONTHS(SYSDATE,12),:prcs)
            """
    query2 = """
              INSERT INTO prices VALUES
              (PRICES_SEQ.NEXTVAL,:id,'SUBS',SYSDATE,ADD_MONTHS(SYSDATE,12),:subs)
             """
    try:
        cursor.execute(query1,{
            'id' : album_id,
            'prcs' : album_info['prcs'],
        })
        cursor.execute(query2,{
            'id' : album_id,
            'subs' : album_info['subs'],
        })
        return True
    except:
        print(f"{album_info['album_name']} failed")
        return False


def connect():
    try:
        username = "booth_owner"
        password = "boothboxd"
        dsn = "localhost/XEPDB1"

        connection = oracledb.connect(user=username,password=password,dsn=dsn)
        cursor = connection.cursor()
        return connection,cursor
    except oracledb.Error as e:
        print(e)
        return None

def disconnect(cursor,connection):
    cursor.close()
    connection.close()

