import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import dotenv_values
from query import query_album
from register import connect,disconnect

creds = dotenv_values('.env')
client_id = creds['CLIENT_ID']
client_secret = creds['CLIENT_SECRET']
client_credential_manager = SpotifyClientCredentials(
    client_id=client_id,
    client_secret=client_secret
)

sp = spotipy.Spotify(client_credentials_manager=client_credential_manager)
connection,cursor = connect()

with open("albums.txt","r",encoding="utf-8") as albumList:
    albumNames = [line.strip() for line in albumList if line.strip()]

counter = 0
for albumName in albumNames:
    if query_album(albumName,sp,cursor):
        print(f"{albumName} registered to DB")
    else:
        print(f"{albumName} failed")
        counter += 1



connection.commit()
    

disconnect(cursor,connection)












