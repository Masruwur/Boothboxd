from django.urls import path
from .views import SignUpView,LoginView,AlbumObtainView,UniqueAlbumObtainView,AlbumSongObtainView,ArtistSongView,ArtistAlbumView,UniqueArtistObtainView

urlpatterns = [
    path('signup/',view=SignUpView.as_view(),name='signup'),
    path('login/',view=LoginView.as_view(),name='login'),
    path('albums/',view=AlbumObtainView.as_view()),
    path('albums/<str:album_name>/',view=UniqueAlbumObtainView.as_view()),
    path('albums/<str:album_name>/songs/',view=AlbumSongObtainView.as_view()),
    path('artists/<str:artist_name>/songs/',view =ArtistSongView.as_view()),
    path('artists/<str:artist_name>/albums/',view =ArtistAlbumView.as_view()),
    path('artists/<str:artist_name>/',view =UniqueArtistObtainView.as_view()),
]