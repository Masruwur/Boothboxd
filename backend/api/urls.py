from django.urls import path
from .views import SignUpView,LoginView,UniqueAlbumObtainView,AlbumSongObtainView,ArtistSongView,ArtistAlbumView,UniqueArtistObtainView,AlbumFilter,UserObtain,AlbumGenreObtain,CreatePlaylist
from .views import GetUserPlaylists,AddPlaylistSong,ObtainPlaylistsongs,AlbumPrices,CreateCard,ObtainCardsView,Subscribe,Purchase,UserAlbums,ObtainFullUsers,BlockUser,UnblockUser
from .views import QueryAlbums,RegisterAlbum

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
    path('playlists/<int:user_id>/<str:playlist_name>/',view=ObtainPlaylistsongs.as_view()),
    path('prices/',view=AlbumPrices.as_view()),
    path('cards/create/',view=CreateCard.as_view()),
    path('cards/<int:user_id>/',view=ObtainCardsView.as_view()),
    path('market/subscribe/',view=Subscribe.as_view()),
    path('market/purchase/',view=Purchase.as_view()),
    path('albums/users/<int:user_id>/',view=UserAlbums.as_view()),
    path('users/all/',view=ObtainFullUsers.as_view()),
    path('users/block/<int:user_id>/',view=BlockUser),
    path('users/unblock/<int:user_id>/',view=UnblockUser),
    path('albums/search/<str:query>/',view=QueryAlbums),
    path('albums/add/<str:album_id>/',view=RegisterAlbum),
]