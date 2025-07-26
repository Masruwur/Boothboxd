from rest_framework import serializers

class SignUpSerializer(serializers.Serializer):
    user_name = serializers.CharField(max_length=255)
    user_title = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True,max_length=255)
    user_image = serializers.ImageField(required=False,allow_null=True)


class LoginSerializer(serializers.Serializer):
    user_title = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserSerializer(serializers.Serializer):
    user_name = serializers.CharField()
    user_title = serializers.CharField()
    user_image = serializers.CharField()

class AlbumSerializer(serializers.Serializer):
    album_name = serializers.CharField(max_length=255)
    album_artist = serializers.CharField(max_length=255)
    album_image = serializers.CharField(max_length=1000)
    year = serializers.CharField(max_length=100)

class SongSerializer(serializers.Serializer):
    song_name = serializers.CharField(max_length=255)
    album_name = serializers.CharField(max_length=255)
    album_image = serializers.CharField(max_length=1000)
    release_year = serializers.CharField(max_length=100)
    song_artists = serializers.CharField(max_length=1000)

class ArtistSerializer(serializers.Serializer):
    artist_name = serializers.CharField(max_length=255)
    artist_image = serializers.CharField(max_length=1000)

class GenreSerializer(serializers.Serializer):
    genre_name = serializers.CharField()

class PlaylistSerializer(serializers.Serializer):
    playlist_name = serializers.CharField(max_length=255)
    user_id = serializers.IntegerField()

class PlaylistDataSerializer(serializers.Serializer):
    playlist_name = serializers.CharField(max_length=255)
    song_count = serializers.IntegerField()
class PlayListSongSerializer(serializers.Serializer):
    playlist_name = serializers.CharField(max_length=255)
    song_name = serializers.CharField(max_length=255)
    user_id = serializers.IntegerField()
class AlbumPricesSerializer(serializers.Serializer):
    album_name = serializers.CharField()
    album_image = serializers.CharField()
    buy = serializers.DecimalField(max_digits=8, decimal_places=2)
    rent = serializers.DecimalField(max_digits=8, decimal_places=2)
class CardSerializer(serializers.Serializer):
    expiry = serializers.CharField(max_length=5)
    last4 = serializers.CharField(max_length=4)
    method = serializers.CharField()
    user_id = serializers.IntegerField()
    balance = serializers.DecimalField(max_digits=8,decimal_places=2)
class PurchaseSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=8,decimal_places=2)
    album_name = serializers.CharField()
    expiry = serializers.CharField(max_length=5)
    last4 = serializers.CharField(max_length=4)
    method = serializers.CharField()
    user_id = serializers.IntegerField()

class UserFullSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    user_title = serializers.CharField()
    join_date = serializers.CharField()
    user_status = serializers.CharField()





    

