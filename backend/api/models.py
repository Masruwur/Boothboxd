from django.db import models

class Song:
    def __init__(self,id,name,album_id):
        self.id = id
        self.name = name
        self.album_id = album_id
    
    def __str__(self):
        return self.name
    
class Album:
    def __init__(self,id,name,image,date):
        self.id = id
        self.name = name
        self.image = image
        self.date = date

    def __str__(self):
        return self.name
    
class Artist:
    def __init__(self,id,name,image,date):
        self.id = id
        self.name = name
        self.image = image
        self.date = date
    
    def __str__(self):
        return self.name
    
class Genre:
    def __init__(self,id,name):
        self.id = id
        self.name = name

     
    def __str__(self):
        return self.name
