from django.urls import path
from .views import SignUpView,LoginView,UniqueAlbumObtainView,AlbumSongObtainView,ArtistSongView,ArtistAlbumView,UniqueArtistObtainView,AlbumFilter,UserObtain,AlbumGenreObtain,CreatePlaylist
from .views import GetUserPlaylists,AddPlaylistSong,ObtainPlaylistsongs

urlpatterns = [
    path('signup/',view=SignUpView.as_view(),name='signup'),
    path('login/',view=LoginView.as_view(),name='login'),
    path('albums/<str:album_name>/',view=UniqueAlbumObtainView.as_view()),
    path('albums/<str:album_name>/songs/',view=AlbumSongObtainView.as_view()),
    path('artists/<str:artist_name>/songs/',view =ArtistSongView.as_view()),
    path('artists/<str:artist_name>/albums/',view =ArtistAlbumView.as_view()),
    path('artists/<str:artist_name>/',view =UniqueArtistObtainView.as_view()),
    path('albums/',view = AlbumFilter.as_view()),
    path('users/<int:id>/',view = UserObtain.as_view()),
    path('albums/<str:album_name>/genres/',view=AlbumGenreObtain.as_view()),
    path('playlists/create/',view=CreatePlaylist.as_view()),
    path('playlists/users/<int:user_id>/',view=GetUserPlaylists.as_view()),
    path('playlists/add/',view=AddPlaylistSong.as_view()),
    path('playlists/<int:user_id>/<str:playlist_name>/',view=ObtainPlaylistsongs.as_view())
]