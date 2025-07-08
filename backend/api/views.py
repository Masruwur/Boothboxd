from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.generics import CreateAPIView,GenericAPIView,ListAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .connection import connect,disconnect
from rest_framework import status
from .serializers import SignUpSerializer,LoginSerializer,AlbumSerializer,SongSerializer,ArtistSerializer,UserSerializer,GenreSerializer,PlaylistSerializer
from .serializers import PlaylistDataSerializer,PlayListSongSerializer,AlbumPricesSerializer,CardSerializer,PurchaseSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .queries import getAlbumArtists
from rest_framework.permissions import AllowAny

class SignUpView(CreateAPIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = SignUpSerializer 

    def perform_create(self,serializer):
        data = serializer.validated_data
        user_name = data['user_name']
        user_title = data['user_title']
        password = data['password']
        image = data.get('user_image')  # the uploaded image

        if not user_name or not user_title or not password:
            return Response({'error': 'All fields required'}, status=400)

        # Save image to disk if provided
        image_path = None
        if image:
            image_name = f"{user_name}_{image.name}"
            path = default_storage.save(image_name, image)
            image_path = default_storage.url(path)

        hashed_password = make_password(password)

        try:
                connection,cursor = connect()
                # Check for existing user
                cursor.execute("SELECT COUNT(*) FROM users WHERE user_title = :title", {'title':user_title})
                if cursor.fetchone()[0] > 0:
                    return Response({'error': 'User title already exists'}, status=409)

                # Insert user
                query = """ INSERT INTO users (user_id, user_name, user_title, password, created_at, user_image)
                            VALUES (user_seq.NEXTVAL,:user_name,:user_title,:user_pass,SYSDATE,:image_path)"""
                cursor.execute(query,
                    {
                        'user_name' : user_name,
                        'user_title' : user_title,
                        'user_pass' : hashed_password,
                        'image_path' : image_path 
                    }
                )

                connection.commit()
                disconnect(cursor,connection)
        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=500)
        

        
        return Response( {"message": "User created successfully."},status=status.HTTP_201_CREATED)
    



class LoginView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_title = serializer.validated_data['user_title']
        password = serializer.validated_data['password']


        try:
            connection, cursor = connect()
            cursor.execute("SELECT user_id, password,user_image FROM users WHERE user_title = :title", {'title': user_title})
            row = cursor.fetchone()
            disconnect(cursor, connection)

            if not row:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user_id, hashed_password , user_image = row

            if not check_password(password, hashed_password):
                return Response({'error': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)

            # Create JWT token manually
            refresh = RefreshToken()  # You don’t have a Django user object, so we’ll customize payload
            refresh['user_id'] = user_id
            refresh['user_title'] = user_title
            refresh['user_image'] = user_image

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    

        
class UniqueAlbumObtainView(ListAPIView):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        album_name = self.kwargs.get('album_name').replace("%20"," ")
        try:
            connection, cursor = connect()
            query = "SELECT * FROM ALBUMS where album_name = :album_name"
            cursor.execute(query,{'album_name':album_name})
            album = cursor.fetchone()

            album_artists = getAlbumArtists(cursor,album_name)
            artist_list = ", ".join([t[0] for t in album_artists])

            album_data = {
                'album_name' : album_name,
                'album_artist' : artist_list,
                'album_image' : album[2],
                'year' : str(album[3].year)
            }

            disconnect(cursor,connection)
            return [album_data]
        except Exception as e:
            print(e)
            return []
        
class AlbumSongObtainView(ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        album_name = self.kwargs.get('album_name').replace("%20"," ")
        try:
            connection, cursor = connect()
            query = """
                        SELECT S.song_name,A.album_name,A.album_image,A.release_year,
                        LISTAGG(AR.artist_name, ', ') WITHIN GROUP (ORDER BY AR.artist_name) AS artists
                        FROM songs S
                        JOIN albums A ON S.album_id = A.album_id
                        JOIN song_artist SA ON SA.song_id = S.song_id
                        JOIN artists AR ON SA.artist_id = AR.artist_id
                        WHERE A.album_name = :input
                        GROUP BY S.song_name,A.album_name,A.album_image,A.release_year
                    """
            cursor.execute(query,{'input':album_name})
            songs = cursor.fetchall()
            if songs is None:
                return []

            song_data = []
            for song in songs:
                song_data.append({
                    'song_name' : song[0],
                    'album_name' : song[1],
                    'album_image' : song[2],
                    'release_year' : str(song[3].year),
                    'song_artists' : song[4]
                })

            disconnect(cursor,connection)
            return song_data
        except Exception as e:
            print(e)
            return []

class ArtistSongView(ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        try:
                artist_name = self.kwargs.get('artist_name').replace("%20"," ")

                connection,cursor = connect()
                query = """
                        SELECT S.song_name,AL.album_name,AL.album_image,AL.release_year,
                        listagg(A.artist_name,',') WITHIN GROUP (ORDER BY A.artist_name) AS artists
                        FROM songs S
                        JOIN albums AL ON (AL.album_id = S.album_id)
                        JOIN song_artist SA ON (SA.song_id = S.song_id)
                        JOIN artists A ON(SA.artist_id = A.artist_id)
                        GROUP BY song_name,AL.album_name,AL.album_image,AL.release_year
                        HAVING (listagg(A.artist_name,',') WITHIN GROUP (ORDER BY A.artist_name)) LIKE '%'||:artist_name||'%'
                        """
                cursor.execute(query,{'artist_name' : artist_name})

                res = cursor.fetchall()
                disconnect(cursor,connection)
                if res is None : return []

                song_data = [
                    {
                        'song_name' : song[0],
                        'album_name' : song[1],
                        'album_image' : song[2],
                        'release_year' : str(song[3].year),
                        'song_artists' : song[4]
                    }
                    for song in res
                ]
                return song_data
        except Exception as e:
            print(e)
            return []
        

class ArtistAlbumView(ListAPIView):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        try:
            artist_name = self.kwargs.get('artist_name').replace("%20"," ")

            connection,cursor = connect()

            query = """
                    SELECT A.album_name,A.album_image,A.release_year FROM albums A
                    WHERE A.album_id IN
                    (SELECT DISTINCT S.album_id FROM songs S
                    JOIN song_artist SA ON (SA.song_id = S.song_id)
                    WHERE SA.artist_id = (SELECT artist_id FROM artists WHERE artist_name = :artist_name))              
                    """
            
            cursor.execute(query,{'artist_name':artist_name})

            res = cursor.fetchall()
            if res is None:
                disconnect(cursor,connection) 
                return []

            albums_data = []
            for album in res:
                album_name = album[0]
                album_artist = ""
                res = getAlbumArtists(cursor,album_name)
                if res : album_artist = res[0][0]

                albums_data.append({
                    'album_name' : album_name,
                    'album_artist' : album_artist,
                    'album_image' : album[1],
                    'year' : str(album[2].year)
                })

            disconnect(cursor,connection)
            return albums_data
        except Exception as e:
            print(e)
            return []


        
class UniqueArtistObtainView(ListAPIView):
    serializer_class = ArtistSerializer

    def get_queryset(self):
        try:
            artist_name = self.kwargs.get('artist_name').replace("%20"," ")

            connection,cursor = connect()

            query = "SELECT artist_image from artists where artist_name = :artist_name"
                
            cursor.execute(query,{'artist_name':artist_name})
            image = cursor.fetchone()[0]

            disconnect(cursor,connection)

            return [
                {
                    'artist_name' : artist_name,
                    'artist_image' : image
                }
            ]
        except Exception as e:
            print(e)
            return []
        

#search params for songs : name,artist,album,genre,year
#search params for albums : name,artist,genre,year
#search params for artist : name
# will add social params during 2nd half

class AlbumFilter(ListAPIView):
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        album_name = self.request.query_params.get('album_name',' ').replace('%20',' ')
        artist_name = self.request.query_params.get('artist_name',' ').replace('%20',' ')
        genre_name = self.request.query_params.get('genre_name',' ').replace('%20',' ')
        year = self.request.query_params.get('year',' ').replace('%20',' ')

        
        query = """
                    SELECT distinct A.album_name, A.album_image, A.release_year
                    FROM albums A 
                    LEFT JOIN songs S ON (S.album_id = A.album_id)
                    LEFT JOIN song_artist SA ON (SA.song_id = S.song_id)
                    LEFT JOIN artists AR ON (AR.artist_id = SA.artist_id)
                    LEFT JOIN song_genre SG ON (SG.song_id = S.song_id)
                    LEFT JOIN genres G ON (G.genre_id = SG.genre_id)
                    WHERE (:album_name = ' ' OR UPPER(A.album_name) LIKE '%' || UPPER(:album_name) || '%')
                    AND (:artist_name = ' ' OR UPPER(AR.artist_name) LIKE '%' || UPPER(:artist_name) || '%')
                    AND (:genre_name = ' ' OR UPPER(G.genre_name) LIKE '%' || UPPER(:genre_name) || '%')
                    AND (:year = ' ' OR (A.release_year BETWEEN ADD_MONTHS(TO_DATE(:year,'YYYY'),-24) 
                    AND ADD_MONTHS(TO_DATE(:year,'YYYY'),24)))
                """
        try:
            connection,cursor = connect()
            cursor.execute(query,{
                'album_name' : album_name,
                'artist_name' : artist_name,
                'genre_name' : genre_name,
                'year' : year
            })

            album_list = cursor.fetchall()

            albums_data = []
            for album in album_list:
                    album_name = album[0]
                    album_artist = ""
                    res = getAlbumArtists(cursor,album_name)
                    if res : album_artist = res[0][0]

                    albums_data.append({
                        'album_name' : album_name,
                        'album_artist' : album_artist,
                        'album_image' : album[1],
                        'year' : str(album[2].year)
                    })

            disconnect(cursor,connection)
            return albums_data
        except Exception as e:
            print(e)
            disconnect(cursor,connection)
            return []

class UserObtain(ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('id')
        try:
            query = "select * from users where user_id = :user_id"

            connection,cursor = connect()
            cursor.execute(query,{'user_id':user_id})
            res = cursor.fetchone()
            disconnect(cursor,connection)

            return [
                { 'user_name' : res[1],
                  'user_title' : res[2],
                  'user_image' : res[5]
                }
            ]
        except Exception as e:
            print(e)
            return []
        
class AlbumGenreObtain(ListAPIView):
    serializer_class = GenreSerializer

    def get_queryset(self):
        album_name = self.kwargs.get('album_name')

        query="""
                SELECT DISTINCT G.genre_name FROM albums A
                JOIN songs S ON (S.album_id = A.album_id)
                JOIN song_genre SG ON (S.song_id = SG.song_id)
                JOIN genres G ON (G.genre_id = SG.genre_id)
                WHERE UPPER(A.album_name) = UPPER(:album_name)
                ORDER BY G.genre_name
              """
        
        try:
            connection,cursor = connect()
            cursor.execute(query,{'album_name':album_name})
            res = cursor.fetchall()
            if res is None:
                return []
            
            return [
                {'genre_name':genre[0]}
                for genre in res
            ]
        except Exception as e:
            print(e)
            return []
        
class CreatePlaylist(CreateAPIView):
    serializer_class = PlaylistSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        user_id = data['user_id']
        playlist_name = data['playlist_name']

        if not user_id or not playlist_name:
            return Response({'error':'missing fields'},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            connection,cursor = connect()
            query = """
                      INSERT INTO PLAYLISTS VALUES (PLAYLIST_SEQ.NEXTVAL,:playlist_name,:user_id,SYSDATE,'T')
                    """
            cursor.execute(query,{
                'playlist_name':playlist_name,
                'user_id':user_id
            })
 
            connection.commit()
            disconnect(cursor,connection)
            return Response({'message':f'Playlist {playlist_name} created'},status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({'error':'dbms error'},status=status.HTTP_400_BAD_REQUEST)
    

class GetUserPlaylists(ListAPIView):
    serializer_class = PlaylistDataSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        query = """
                  SELECT P.playlist_name,count(PS.SONG_ID) song_count
                  FROM playlists P LEFT OUTER JOIN 
                  playlist_song PS ON (P.PL_ID = PS.PL_ID)
                  WHERE P.user_id = :user_id
                  GROUP BY P.PLAYLIST_NAME
                """
        try:
            connection,cursor = connect()
            cursor.execute(query,{
                'user_id':user_id
            })

            res = cursor.fetchall()

            disconnect(cursor,connection)

            return [{
                    'playlist_name' : p[0],
                    'song_count' : p[1]
                    }
                    for p in res
            ]
        except  Exception as e:
            print(e)
            return []
        

class AddPlaylistSong(CreateAPIView):
    serializer_class = PlayListSongSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        song_name = data['song_name']
        playlist_name = data['playlist_name']
        user_id = data['user_id']
        
        query="""
                INSERT INTO PLAYLIST_SONG VALUES ((SELECT PL_ID FROM PLAYLISTS WHERE PLAYLIST_NAME = :playlist_name
                AND USER_ID = :user_id),
                (SELECT SONG_ID FROM SONGS WHERE SONG_NAME = :song_name))
              """
        try:
            connection,cursor = connect()
            cursor.execute(query,{
                'playlist_name' : playlist_name,
                'song_name' : song_name,
                'user_id' :user_id
            })

            connection.commit()
            disconnect(cursor,connection)
            return Response({'message':'song added to playlist'},status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'error':f'{e}'},status=status.HTTP_400_BAD_REQUEST)

class ObtainPlaylistsongs(ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        playlist_name = self.kwargs.get('playlist_name')
        user_id = self.kwargs.get('user_id')

        query = """
                    SELECT S.song_name,A.album_name,A.album_image,A.release_year,
                    LISTAGG(AR.artist_name, ', ') WITHIN GROUP (ORDER BY AR.artist_name) AS artists
                    FROM SONGS S
                    JOIN ALBUMS A ON (A.ALBUM_ID = S.ALBUM_ID)
                    JOIN SONG_ARTIST SA ON (SA.SONG_ID = S.SONG_ID)
                    JOIN ARTISTS AR ON(AR.ARTIST_ID=SA.ARTIST_ID)
                    JOIN PLAYLIST_SONG PS ON (PS.SONG_ID = S.SONG_ID)
                    JOIN PLAYLISTS P ON (P.PL_ID = PS.PL_ID )
                    WHERE P.USER_ID = :user_id AND P.PLAYLIST_NAME = :playlist_name
                    GROUP BY S.song_name,A.album_name,A.album_image,A.release_year
                """
        try:
            connection,cursor = connect()
            cursor.execute(query,{
                'user_id' :user_id,
                'playlist_name' : playlist_name
            })

            res = cursor.fetchall()

            songs = [
                {
                     'song_name' : song[0],
                     'album_name' : song[1],
                     'album_image' : song[2],
                     'release_year' : str(song[3].year),
                     'song_artists' : song[4]
                }
                for song in res
            ]

            return songs
        except Exception as e:
            print(e)
            return []
        
class AlbumPrices(ListAPIView):
    serializer_class = AlbumPricesSerializer

    def get_queryset(self):
        query = """
                  SELECT A.album_name,A.album_image,p1.amount buy,p2.amount rent FROM Albums A
                  JOIN Prices p1 ON (P1.ALBUM_ID = A.album_id)
                  JOIN prices p2 ON (p2.album_id = A.album_id)
                  WHERE p1.TYPE = 'PRCS' AND p2.TYPE= 'SUBS'
                """
        try:
            connection,cursor = connect()
            cursor.execute(query)
            res = cursor.fetchall()

            prices = [
                {
                    'album_name' : price[0],
                    'album_image' : price[1],
                    'buy' : price[2],
                    'rent' : price[3]
                }
                for price in res
            ]

            return prices
        except Exception as e:
            print(e)
            return []
            
class CreateCard(CreateAPIView):
    serializer_class = CardSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data

        expiry = data['expiry']
        last4 = data['last4']
        method = data['method']
        user_id = data['user_id']

        query = 'INSERT INTO CARD_INFO VALUES (CARD_INFO_SEQ.NEXTVAL,:user_id,:method,:last4,:expiry)'

        try:
            connection,cursor = connect()
            cursor.execute(query,{
                'expiry' : expiry,
                'last4' : last4,
                'method' : method,
                'user_id' :user_id
            })
            connection.commit()
            disconnect(cursor,connection)

            return Response( {"message": "Card created successfully."},status=status.HTTP_201_CREATED)

        except Exception as e:
            print(e)

class ObtainCardsView(ListAPIView):
    serializer_class = CardSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        query = "SELECT METHOD_TYPE,LAST4,EXPIRY FROM CARD_INFO WHERE USER_ID = :user_id"

        try:
            connection,cursor = connect()
            cursor.execute(query,{'user_id':user_id})
            res = cursor.fetchall()

            cards = [{
                       'expiry' : card[2],
                       'last4' : card[1],
                       'method' : card[0],
                       'user_id' : user_id
                     }
                     for card in res
            ]

            return cards
        except Exception as e:
            print(e)
            return []


class Subscribe(CreateAPIView):
    serializer_class = PurchaseSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data

        amount = data['amount']
        album_name = data['album_name']
        expiry = data['expiry']
        last4 = data['last4']
        method = data['method']

        try:
            connection,cursor = connect()

            query = 'SELECT transactions_seq.NEXTVAL FROM DUAL'
            cursor.execute(query)
            trans_id = cursor.fetchone()[0]

            query = 'SELECT info_id FROM CARD_INFO WHERE last4 = :last4 AND expiry= :expiry AND method_type = :method'
            cursor.execute(query,{
                'last4' : last4,
                'expiry' : expiry,
                'method' : method
            })
            info_id = cursor.fetchone()[0]


            query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'S',SYSDATE)"
            cursor.execute(query,{
               'trans_id' : trans_id,
               'info_id' : info_id,
               'amount' : amount,
            })

            query = """
                       INSERT INTO SUBSCRIPTION VALUES(SUBSCRIPTION_SEQ.NEXTVAL,(SELECT ALBUM_ID FROM ALBUMS WHERE
                       ALBUM_NAME = :album_name),:trans_id,SYSDATE,ADD_MONTHS(SYSDATE,1),SYSDATE)
                    """
            cursor.execute(query,{
                'album_name' : album_name,
                'trans_id' : trans_id
            })

            connection.commit()
            disconnect(cursor,connection)

            return Response( {"message": "Subscription created successfully."},status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)

class Purchase(CreateAPIView):
    serializer_class = PurchaseSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data

        amount = data['amount']
        album_name = data['album_name']
        expiry = data['expiry']
        last4 = data['last4']
        method = data['method']

        try:
            connection,cursor = connect()

            query = 'SELECT transactions_seq.NEXTVAL FROM DUAL'
            cursor.execute(query)
            trans_id = cursor.fetchone()[0]

            query = 'SELECT info_id FROM CARD_INFO WHERE last4 = :last4 AND expiry= :expiry AND method_type = :method'
            cursor.execute(query,{
                'last4' : last4,
                'expiry' : expiry,
                'method' : method
            })
            info_id = cursor.fetchone()[0]


            query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'S',SYSDATE)"
            cursor.execute(query,{
               'trans_id' : trans_id,
               'info_id' : info_id,
               'amount' : amount,
            })

            query = """
                       INSERT INTO PURCHASES VALUES(PURCHASES_SEQ.NEXTVAL,(SELECT ALBUM_ID FROM ALBUMS WHERE
                       ALBUM_NAME = :album_name),:trans_id,SYSDATE)
                    """
            cursor.execute(query,{
                'album_name' : album_name,
                'trans_id' : trans_id
            })

            connection.commit()
            disconnect(cursor,connection)

            return Response( {"message": "Purchase created successfully."},status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
        
                  

class UserAlbums(ListAPIView):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')

        try:
            query = """
                      (SELECT a.album_name,a.album_image,a.RELEASE_YEAR FROM 
                       users U JOIN card_info C ON (U.user_id = C.user_id)
                       JOIN TRANSACTIONS T ON (T.INFO_ID = C.INFO_ID )
                       JOIN SUBSCRIPTION s ON (s.TRANS_ID = T.TRANS_ID )
                       JOIN albums a ON (a.ALBUM_ID = s.ALBUM_ID )
                       WHERE u.user_id = :user_id AND SYSDATE<s."to")
                       UNION
                       (SELECT A.album_name,a.album_image,a.RELEASE_YEAR FROM 
                       users U JOIN card_info C ON (U.user_id = C.user_id)
                       JOIN TRANSACTIONS T ON (T.INFO_ID = C.INFO_ID )
                       JOIN PURCHASES s ON (s.TRANS_ID = T.TRANS_ID )
                       JOIN albums a ON (a.ALBUM_ID = s.ALBUM_ID )
                       WHERE u.user_id = :user_id)
                    """
            connection,cursor = connect()
            cursor.execute(query,{'user_id':user_id})
            user_albums = cursor.fetchall()

            album_data = []

            for album in user_albums:
                album_artists = getAlbumArtists(cursor,album[0])
                #artist_list = ", ".join([t[0] for t in album_artists])
                artist_list = album_artists[0][0]

                album_data.append({
                    'album_name' : album[0],
                    'album_artist' : artist_list,
                    'album_image' : album[1],
                    'year' : str(album[2].year)
                })

            return album_data
        except Exception as e:
            print(e)
            return []

            
        
