from rest_framework import serializers

class SignUpSerializer(serializers.Serializer):
    user_name = serializers.CharField(max_length=255)
    user_title = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True,max_length=255)
    user_image = serializers.ImageField(required=False,allow_null=True)


class LoginSerializer(serializers.Serializer):
    user_title = serializers.CharField()
    password = serializers.CharField(write_only=True)

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

