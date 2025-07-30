from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.generics import CreateAPIView,GenericAPIView,ListAPIView,UpdateAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .connection import connect,disconnect
from rest_framework import status
from .serializers import SignUpSerializer,LoginSerializer,AlbumSerializer,SongSerializer,ArtistSerializer,UserSerializer,GenreSerializer,PlaylistSerializer
from .serializers import PlaylistDataSerializer,PlayListSongSerializer,AlbumPricesSerializer,CardSerializer,CardSerializer2,PurchaseSerializer,UserFullSerializer,ReviewSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .queries import getAlbumArtists
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from .queries import search_albums,reg_album_by_id
from decimal import Decimal
import json




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
                query = """ INSERT INTO users (user_id, user_name, user_title, password, created_at, user_image,status)
                            VALUES (user_seq.NEXTVAL,:user_name,:user_title,:user_pass,SYSDATE,:image_path,'S')"""
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
            cursor.execute("SELECT user_id, password,user_image,status FROM users WHERE user_title = :title", {'title': user_title})
            row = cursor.fetchone()
            disconnect(cursor, connection)

            if not row:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user_id, hashed_password , user_image ,stat = row

            if stat != 'S':
                return Response({'error': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)

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
                    ORDER BY A.album_name
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
                (SELECT SONG_ID FROM SONGS WHERE SONG_NAME = :song_name fetch first 1 rows only))
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

            disconnect(cursor,connection)

            return songs
        except Exception as e:
            print(e)
            return []
        
class AlbumPrices(ListAPIView):
    serializer_class = AlbumPricesSerializer

    def get_queryset(self):
        query = """
                  SELECT distinct A.album_name,A.album_image,p1.amount buy,p2.amount rent FROM Albums A
                  JOIN Prices p1 ON (P1.ALBUM_ID = A.album_id)
                  JOIN prices p2 ON (p2.album_id = A.album_id)
                  WHERE p1.TYPE = 'PRCS' AND p2.TYPE= 'SUBS'
                  and A.album_id != 144
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
            
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
import json

@csrf_exempt
def create_card(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)

        method = data.get('method')
        last4 = data.get('last4')
        expiry = data.get('expiry')
        passkey = data.get('passkey')
        user_id = data.get('user_id')

        if not all([method, last4, expiry, passkey, user_id]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        connection, cursor = connect()

        # 1. Fetch passkey from card_creds
        cursor.execute(
            """
            SELECT passkey FROM card_creds
            WHERE method_type = :method AND last4 = :last4 AND expiry = :expiry
            """,
            {'method': method, 'last4': last4, 'expiry': expiry}
        )
        row = cursor.fetchone()
        if not row:
            disconnect(cursor, connection)
            return JsonResponse({'error': 'Card credentials not found'}, status=404)

        db_passkey = row[0]

        # 2. Check passkey match
        if db_passkey != passkey:
            disconnect(cursor, connection)
            return JsonResponse({'error': 'Invalid passkey'}, status=403)

        # 3. Insert into CARD_INFO
        insert_query = """
            INSERT INTO CARD_INFO 
            VALUES (CARD_INFO_SEQ.NEXTVAL, :user_id, :method, :last4, :expiry, ROUND(DBMS_RANDOM.VALUE(100,200),2))
        """

        cursor.execute(insert_query, {
            'user_id': user_id,
            'method': method,
            'last4': last4,
            'expiry': expiry
        })
        connection.commit()
        disconnect(cursor, connection)

        return JsonResponse({'message': 'Card created successfully.'}, status=201)

    except Exception as e:
        print('Error:', e)
        return JsonResponse({'error': 'Server error'}, status=500)


class ObtainCardsView(ListAPIView):
    serializer_class = CardSerializer2

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        query = "SELECT METHOD_TYPE,LAST4,EXPIRY,BALANCE FROM CARD_INFO WHERE USER_ID = :user_id"

        try:
            connection,cursor = connect()
            cursor.execute(query,{'user_id':user_id})
            res = cursor.fetchall()

            cards = [{
                       'expiry' : card[2],
                       'last4' : card[1],
                       'method' : card[0],
                       'user_id' : user_id,
                       'balance' : card[3]
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

        amount = Decimal(str(data['amount']))
        album_name = data['album_name']
        expiry = data['expiry']
        last4 = data['last4']
        method = data['method']
        user_id = data['user_id']


        try:
            connection,cursor = connect()

            query = 'SELECT info_id,balance FROM CARD_INFO WHERE last4 = :last4 AND expiry= :expiry AND method_type = :method'
            cursor.execute(query,{
                'last4' : last4,
                'expiry' : expiry,
                'method' : method
            })
            res = cursor.fetchone()
            info_id = res[0]
            balance = Decimal(str(res[1]))


            query = 'SELECT transactions_seq.NEXTVAL FROM DUAL'
            cursor.execute(query)
            trans_id = cursor.fetchone()[0]

            query = ''
            if(amount>balance):
                 query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'F',SYSDATE)"
            else:
                 query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'S',SYSDATE)"


            cursor.execute(query,{
               'trans_id' : trans_id,
               'info_id' : info_id,
               'amount' : amount,
            })

            connection.commit()


            if(balance>=amount):
                    query = """
                            update card_info set balance = :new_balance where user_id = :user_id and info_id = :info_id
                            """
                    cursor.execute(query,{
                        'user_id':user_id,
                        'new_balance': balance-amount,
                        'info_id' : info_id
                    })

        
            query = """
                       INSERT INTO SUBSCRIPTION VALUES(SUBSCRIPTION_SEQ.NEXTVAL,(SELECT ALBUM_ID FROM ALBUMS WHERE
                       ALBUM_NAME = :album_name fetch first 1 rows only),:trans_id,SYSDATE,ADD_MONTHS(SYSDATE,1),SYSDATE,:user_id)
                    """
            try:
                cursor.execute(query,{
                    'album_name' : album_name,
                    'trans_id' : trans_id,
                    'user_id':user_id
                })

                connection.commit()
            except Exception as e:
                connection.rollback()
                disconnect(cursor,connection)
                return Response( {"message": "Purchase failed"},status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            disconnect(cursor,connection)

            return Response( {"message": "Purchase created successfully."},status=status.HTTP_201_CREATED)
        except Exception as e:
                print(e)
        

class Purchase(CreateAPIView):
    serializer_class = PurchaseSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data

        amount = Decimal(str(data['amount']))
        album_name = data['album_name']
        expiry = data['expiry']
        last4 = data['last4']
        method = data['method']
        user_id = data['user_id']

        try:
            connection,cursor = connect()

            query = 'SELECT info_id,balance FROM CARD_INFO WHERE last4 = :last4 AND expiry= :expiry AND method_type = :method'
            cursor.execute(query,{
                'last4' : last4,
                'expiry' : expiry,
                'method' : method
            })
            res = cursor.fetchone()
            info_id = res[0]
            balance = Decimal(str(res[1]))


            query = 'SELECT transactions_seq.NEXTVAL FROM DUAL'
            cursor.execute(query)
            trans_id = cursor.fetchone()[0]

            query = ''
            if(amount>balance):
                 query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'F',SYSDATE)"
            else:
                 query = "INSERT INTO TRANSACTIONS VALUES (:trans_id,:info_id,:amount,'S',SYSDATE)"


            cursor.execute(query,{
               'trans_id' : trans_id,
               'info_id' : info_id,
               'amount' : amount,
            })

            connection.commit()


            if(balance>=amount):
                    query = """
                            update card_info set balance = :new_balance where user_id = :user_id and info_id = :info_id
                            """
                    cursor.execute(query,{
                        'user_id':user_id,
                        'new_balance': balance-amount,
                        'info_id' : info_id
                    })
            else:
                print('here')

            query = """
                       INSERT INTO PURCHASES VALUES(PURCHASES_SEQ.NEXTVAL,(SELECT ALBUM_ID FROM ALBUMS WHERE
                       ALBUM_NAME = :album_name fetch first 1 rows only),:trans_id,SYSDATE,:user_id)
                    """
            try:
                cursor.execute(query,{
                    'album_name' : album_name,
                    'trans_id' : trans_id,
                    'user_id' : user_id
                })

                connection.commit()
            except Exception as e:
                connection.rollback()
                disconnect(cursor,connection)
                return Response( {"message": "Purchase failed"},status=status.HTTP_422_UNPROCESSABLE_ENTITY)

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
        
class ObtainFullUsers(ListAPIView):
    serializer_class = UserFullSerializer

    def get_queryset(self):
        try:
            query = """
                    select user_name,user_title,created_at,status,user_id from users where user_id not like '22%'
                    """
            connection,cursor = connect()
            cursor.execute(query)
            users = cursor.fetchall()

            disconnect(cursor,connection)

            user_data = [{
                'user_id' : user[4],
                'user_name' : user[0],
                'user_title' : user[1],
                'join_date' : str(user[2]),
                'user_status' : user[3]  
            }
            for user in users]

            return user_data
        except Exception as e:
            print(e)
            return []
        
@csrf_exempt
def BlockUser(request,user_id):
    if(request.method=='POST'):
        try:
            connection,cursor = connect();
            query = "update users set status='B' where user_id = :user_id"
            cursor.execute(query,{'user_id':user_id})
            connection.commit()
            disconnect(cursor,connection)
            return JsonResponse({'message': 'User blocked successfully'})
        except Exception as e:
            print(e)
@csrf_exempt
def UnblockUser(request,user_id):
    if(request.method=='POST'):
        try:
            connection,cursor = connect();
            query = "update users set status='S' where user_id = :user_id"
            cursor.execute(query,{'user_id':user_id})
            connection.commit()
            disconnect(cursor,connection)
        except Exception as e:
            print(e)

@csrf_exempt
def QueryAlbums(request,query):
    if request.method=='GET':
        try:
            client_id = "86515bf4a83049d2bca32f954369399e"
            client_secret = "0c3dc407799b4b5d88c1b22be85544ac"
            client_credential_manager = SpotifyClientCredentials(
              client_id=client_id,
              client_secret=client_secret
            )

            sp = spotipy.Spotify(client_credentials_manager=client_credential_manager)
            search_query = query.replace('%20',' ')

            data = search_albums(sp,search_query)

            return JsonResponse(data,safe=False)
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@csrf_exempt
def RegisterAlbum(request,album_id):
    if request.method=='POST':
        try:
            client_id = "86515bf4a83049d2bca32f954369399e"
            client_secret = "0c3dc407799b4b5d88c1b22be85544ac"
            client_credential_manager = SpotifyClientCredentials(
              client_id=client_id,
              client_secret=client_secret
            )

            sp = spotipy.Spotify(client_credentials_manager=client_credential_manager)
            
            connection,cursor = connect()

            if reg_album_by_id(album_id,sp,cursor) == True:
                connection.commit()

            disconnect(cursor,connection)

            return  JsonResponse({'message': f'{album_id} registered'}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@csrf_exempt
def setPrice(request):
    if request.method=='POST':
        data = json.loads(request.body)
        new_price = data.get('price')
        album_name = data.get('album_name')
        price_type = data.get('type')
        print(new_price,album_name,price_type)

        connection,cursor = connect()
        try:
            
             query = ''
             if price_type == 'buy':
                 query = '''update prices set amount = :new_price where type = 'PRCS' and album_id = (select album_id from albums where album_name = :album_name) '''
             else:
                 query = '''update prices set amount = :new_price where type = 'SUBS' and album_id = (select album_id from albums where album_name = :album_name) '''

             cursor.execute(query,{
                'new_price' : new_price,
                'album_name' : album_name
             })

             connection.commit()
             return JsonResponse({'message': 'Price updated successfully'})
        except Exception as e:
            connection.rollback()
            print(e)

        disconnect(cursor,connection)


class CreateReview(CreateAPIView):
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
         data = serializer.validated_data
         stars = data.get('stars')
         album_name = data.get('album_name')
         content = data.get('content')
         user_id = data.get('user_id')

         try:
             connection,cursor = connect()
             query = 'select album_id from albums where album_name = :album_name fetch first 1 rows only'
             cursor.execute(query,{'album_name' : album_name})

             album_id = cursor.fetchone()[0]

             query = 'select content_seq.NEXTVAL from dual'
             cursor.execute(query)
             content_id = cursor.fetchone()[0]

             query = 'insert into text_content values(:content_id,:content)'

             cursor.execute(query,{
                 'content_id' : content_id,
                 'content' : content
             })
             connection.commit()

             query = """
                         insert into ratings values (rating_seq.NEXTVAL,:stars,:content_id,:user_id,:album_id,'A',SYSDATE,0)
                     """
             
             cursor.execute(query,{
                 'stars' : stars,
                 'content_id' : content_id,
                 'user_id' : user_id,
                 'album_id' : album_id 
             })

             connection.commit()

         except Exception as e:
             print(e)
             connection.rollback()
             disconnect(cursor,connection)
             return Response({'error': str(e)}, status=500)
         

         disconnect(cursor,connection)
         return Response( {"message": "User created successfully."},status=status.HTTP_201_CREATED)
    

def readLOB(lob):
     if hasattr(lob, 'read'):
        content = lob.read()
        return content
     return lob
     

@csrf_exempt
def get_ratings(request,album_name):
    data = []
    try:
        connection,cursor = connect()
        query = """
                 SELECT R.rating_id,U.user_name,U.user_image,C.text,R.vote_count,R.stars 
                 FROM ratings R 
                 JOIN users U ON (R.user_id = U.user_id)
                 JOIN text_content C ON (C.content_id = R.content_id)
                 WHERE R.music_id = (SELECT album_id FROM albums WHERE album_name = :album_name fetch first 1 rows only)
                 order by R.vote_count desc
                """
        
        cursor.execute(query,{'album_name':album_name})

        res = cursor.fetchall()

        data = [{
            'id': rating[0],
           'user': rating[1],
           'userPic': rating[2],
           'content': readLOB(rating[3]),
           'upvotes': rating[4],
           'rating': rating[5]
        }

        for rating in res]

    except Exception as e:
        print(e)

    disconnect(cursor,connection)

    return JsonResponse(data,safe=False)



@csrf_exempt
def upvote(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        rating_id = data.get('rating_id')
        user_id = data.get('user_id')
        count = data.get('count')
        connection,cursor = connect()
        try:
            query = "update ratings set vote_count = vote_count+:count where rating_id = :rating_id"
            cursor.execute(query,{'rating_id':rating_id,'count':count})
            connection.commit()

            query = 'insert into upvotes values(:rating_id,:user_id)'
            cursor.execute(query,{'rating_id':rating_id,'user_id':user_id})
            connection.commit()
            
        except Exception as e:
            connection.rollback()
            print(e)

        disconnect(cursor,connection)
        return JsonResponse({'message': 'upvoted'})
    else:
            print('eee')
            return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
    

@csrf_exempt
def singlestats(request):
    try:
        connection,cursor = connect()
        cursor.execute('select count(*) from albums')
        album_count = cursor.fetchone()[0]
        cursor.execute('select count(*) from ratings')
        rating_count = cursor.fetchone()[0]
        cursor.execute('''select count(*) from users where user_id not like '22%' ''')
        user_count = cursor.fetchone()[0]

        data = {
            'album_count':album_count,
            'rating_count':rating_count,
            'user_count':user_count
        }

        disconnect(cursor,connection)
        return JsonResponse(data,safe=False)
    except Exception as e:
        print(e)

@csrf_exempt
def groupstats(request):
    try:
        connection,cursor = connect()
        data=[]
        query = """
                SELECT album_id,album_name,album_image,
                (SELECT count(*) FROM ratings WHERE music_id = A.album_id) review_count FROM albums A
                ORDER BY (SELECT count(*) FROM ratings WHERE music_id = A.album_id) DESC
                FETCH FIRST 4 ROWS ONLY
                """
        cursor.execute(query)
        res = cursor.fetchall()

        r_order = [
            {
                'album_id' : r[0],
                'album_name' : r[1],
                'album_image' : r[2],
                'count' : r[3]
            }
            for r in res
        ]

        data.append(r_order)

        query = """ SELECT A.album_id,A.album_name,A.album_image,count(*) pl_count FROM PLAYLIST_SONG ps
                    JOIN songs S ON  (S.song_id = ps.song_id)
                    JOIN albums A ON (S.album_id = A.album_id)
                    GROUP BY A.album_id,A.album_name,A.album_image
                    ORDER BY count(*) DESC
                    FETCH FIRST 4 ROWS ONLY """
        
        cursor.execute(query)
        res = cursor.fetchall()

        pl_order = [
            {
                'album_id' : r[0],
                'album_name' : r[1],
                'album_image' : r[2],
                'count' : r[3]
            }
            for r in res
        ]

        data.append(pl_order)

        query = """
                SELECT album_id,album_name,album_image,(SELECT Round(NVL(avg(stars),0),2) FROM ratings WHERE music_id = A.album_id) star
                FROM Albums A
                ORDER BY (SELECT NVL(avg(stars),0) FROM ratings WHERE music_id = A.album_id) DESC
                FETCH FIRST 4 ROWS ONLY
                """
        
        cursor.execute(query)
        res = cursor.fetchall()

        star_order = [
            {
                'album_id' : r[0],
                'album_name' : r[1],
                'album_image' : r[2],
                'star' : r[3]
            }
            for r in res
        ]

        data.append(star_order)

        disconnect(cursor,connection)

        return JsonResponse(data,safe=False)

    except Exception as e:
        print(e)


@csrf_exempt
def marketstats(request):
    connection, cursor = connect()

    try:
        cursor.execute("""
            SELECT U.USER_ID, U.user_title, SUM(T.amount) total
            FROM users U
            JOIN card_info C ON C.USER_ID = U.USER_ID 
            JOIN TRANSACTIONS T ON T.info_id = C.info_id
            WHERE U.user_id NOT LIKE '22%' AND T.status='S'
            GROUP BY U.USER_ID, U.USER_TITLE
            ORDER BY (SUM(T.amount)) DESC
            FETCH FIRST 4 ROWS ONLY
        """)
        top_users = [
            {"user_id":row[0],"user_title": row[1], "total": float(row[2])}
            for row in cursor.fetchall()
        ]

        cursor.execute("""
            SELECT A.album_id, A.album_name, A.album_image 
            FROM Albums A
            JOIN PURCHASES P ON P.ALBUM_ID = A.ALBUM_ID 
            JOIN TRANSACTIONS T ON T.TRANS_ID = P.TRANS_ID 
            GROUP BY A.album_id, A.album_name, A.album_image
            ORDER BY SUM(T.amount) DESC
            FETCH FIRST 4 ROWS ONLY
        """)
        top_bought = [
            {"album_id":row[0],"album_name": row[1], "album_image": row[2]}
            for row in cursor.fetchall()
        ]

        cursor.execute("""
            SELECT A.album_id, A.album_name, A.album_image 
            FROM Albums A
            JOIN SUBSCRIPTION S ON S.ALBUM_ID = A.ALBUM_ID 
            JOIN TRANSACTIONS T ON T.TRANS_ID = S.TRANS_ID 
            GROUP BY A.album_id, A.album_name, A.album_image
            ORDER BY (SUM(T.amount)) DESC
            FETCH FIRST 4 ROWS ONLY
        """)
        top_rented = [
             {"album_id":row[0],"album_name": row[1], "album_image": row[2]}
             for row in cursor.fetchall()
        ]


        cursor.execute("""
            SELECT SUM(T.amount) FROM transactions T
            JOIN PURCHASES P ON P.TRANS_ID = T.TRANS_ID
        """)
        total_buy = cursor.fetchone()[0] or 0

        cursor.execute("""
            SELECT SUM(T.amount) FROM transactions T
            JOIN SUBSCRIPTION S ON S.TRANS_ID = T.TRANS_ID
        """)
        total_rent = cursor.fetchone()[0] or 0

        total_all = total_buy + total_rent
        revenue_data = [
            {"name": "Buy", "value": round(total_buy * 100 / total_all) if total_all else 0, "amount": float(total_buy)},
            {"name": "Rent", "value": round(total_rent * 100 / total_all) if total_all else 0, "amount": float(total_rent)},
        ]

        cursor.execute("SELECT COUNT(*) FROM TRANSACTIONS T WHERE T.STATUS = 'S'")
        success = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM TRANSACTIONS T WHERE T.STATUS = 'F'")
        failure = cursor.fetchone()[0]

        transaction_status = [
            {"name": "Successful", "value": round(success * 100 / (success + failure)) if (success + failure) else 0, "count": success},
            {"name": "Failed", "value": round(failure * 100 / (success + failure)) if (success + failure) else 0, "count": failure},
        ]

        # 6. Transaction Heatmap
        cursor.execute("""
            SELECT TO_CHAR(created_at, 'HH24'), SUM(amount)
            FROM transactions
            GROUP BY TO_CHAR(created_at, 'HH24')
            ORDER BY TO_CHAR(created_at, 'HH24')
            fetch first 12 rows only
        """)
        heatmap = [
            {"hour": int(row[0]), "amount": float(row[1])}
            for row in cursor.fetchall()
        ]



        # Combine everything
        data = {
            "topUsers": top_users,
            "topBoughtAlbums": top_bought,
            "topRentedAlbums": top_rented,
            "revenueData": revenue_data,
            "transactionHeatmap": heatmap,
            "transactionStatus": transaction_status
        }

        return JsonResponse(data,safe=False)

    finally:
        disconnect(cursor, connection)

@csrf_exempt
def user_summary(request, user_id):
    if request.method != 'GET':
        return HttpResponseBadRequest('Only GET method allowed.')

    try:
        connection,cursor = connect()
        # 1. User info
        cursor.execute("""
            SELECT user_name, user_title, user_image
            FROM users
            WHERE user_id = :user_id
        """, {'user_id': user_id})

        row = cursor.fetchone()
        user_info = dict(zip(['user_name', 'user_title', 'user_image'], row)) if row else {}

        # 2. Ratings with content and album info
        cursor.execute("""
            SELECT stars,
                (SELECT text FROM text_content WHERE content_id = r.content_id) AS content,
                (SELECT album_name FROM albums WHERE album_id = r.music_id) AS album_name,
                (SELECT album_image FROM albums WHERE album_id = r.music_id) AS album_image
            FROM ratings r
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            FETCH FIRST 4 ROWS ONLY
        """, {'user_id': user_id})

        ratings = [
            {
                'stars' : row[0],
                'text' : readLOB(row[1]),
                'album_name' : row[2],
                'album_image' : row[3]
            }
            for row in cursor.fetchall()
        ]

        # 3. Recently purchased or subscribed albums
        cursor.execute("""
            SELECT album_name, album_image FROM (
                (SELECT A.album_name, A.album_image, P.created_at
                    FROM purchases P
                    JOIN albums A ON A.album_id = P.album_id
                    WHERE P.user_id = :user_id)
                UNION
                (SELECT A.album_name, A.album_image, S.created_at
                    FROM subscription S
                    JOIN albums A ON A.album_id = S.album_id
                    WHERE S.user_id = :user_id)
            )
            ORDER BY created_at DESC
            FETCH FIRST 4 ROWS ONLY
        """, {'user_id': user_id})

        recent_albums = [
            dict(zip(['album_name', 'album_image'], row))
            for row in cursor.fetchall()
        ]

        return JsonResponse({
            'user_info': user_info,
            'ratings': ratings,
            'recent_albums': recent_albums
        })

    except Exception as e:
        print('Error:', e)
        return JsonResponse({'error': 'Internal server error'}, status=500)
    finally:
        disconnect(cursor,connection)





    


    




        

        

        


            
        
