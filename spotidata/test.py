import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import dotenv_values
from query import search_albums

creds = dotenv_values('.env')
client_id = "86515bf4a83049d2bca32f954369399e"
client_secret = "0c3dc407799b4b5d88c1b22be85544ac"
client_credential_manager = SpotifyClientCredentials(
    client_id=client_id,
    client_secret=client_secret
)

sp = spotipy.Spotify(client_credentials_manager=client_credential_manager)

query = "Metallica"

data = search_albums(sp,query)
print(data)