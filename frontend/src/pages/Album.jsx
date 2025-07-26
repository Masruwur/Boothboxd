import React, { useEffect, useState } from 'react';
import { Heart, Plus, ThumbsUp, Play, Clock, Calendar, Tag } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../api';
import PlaylistPopup from '../components/PlaylistPopUp';

const AlbumPage = () => {
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [likedAlbum, setLikedAlbum] = useState(false);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [albumData,setAlbumData] = useState({})
  const [songData,setSongData] = useState([])
  const [artistData,setArtistData] = useState({})
  const [genreData,setGenreData] = useState([])
  const [isPopUp,setIsPopUp] = useState(false)
  const [currentSong,setCurrentSong] = useState({})


  const albumParam = useParams()
  useEffect(()=>{
    const fetchData = async ()=> {
    try{
       const albumRaw = `albums/${albumParam.albumName}/`
       const albumUrl = albumRaw.replace(/ /g, "%20");
       const albumFetched = await api.get(albumUrl)
       setAlbumData(albumFetched.data[0])
       const songsFetched = await api.get(`${albumUrl}songs/`)
       setSongData(songsFetched.data)
       const genresFetched = await api.get(`${albumUrl}genres/`)
       setGenreData(genresFetched.data)
    }catch(e){
      console.log(e)
    }
  }
  fetchData();
       
  },[])

  useEffect(()=>{
      const fetchArtist = async () =>{
          if (!albumData) return;

          if (albumData.album_artist) {
            try{
              const artistName = albumData.album_artist.split(',')[0].trim();
              const artistRaw = `artists/${artistName}/`;
              const artistUrl = artistRaw.replace(/ /g,'%20')
              const res = await api.get(artistUrl)
              

              setArtistData(res.data[0])

            }catch(e){
              console.log(e)
            }
          }
      };
      fetchArtist()
  },[albumData])

 
  

  const reviews = [
    {
      id: 1,
      user: "MusicLover92",
      userPic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      content: "An absolute masterpiece that transcends time and genre. Every track flows seamlessly into the next, creating a cohesive sonic journey that explores themes of mental health, time, and human existence. The production quality is phenomenal even by today's standards.",
      likes: 24
    },
    {
      id: 2,
      user: "VinylCollector",
      userPic: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face",
      content: "This album changed my perspective on what music could be. The way Pink Floyd uses sound effects, layered vocals, and progressive song structures creates an immersive experience that's both challenging and deeply rewarding.",
      likes: 18
    },
    {
      id: 3,
      user: "ProgRockFan",
      userPic: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop&crop=face",
      content: "While I appreciate the artistic merit, I find some tracks a bit too experimental for my taste. However, songs like 'Time' and 'Money' are undeniable classics that showcase the band's incredible musicianship.",
      likes: 7
    }
  ];

  const songAddClick = (song) => {
     setCurrentSong(song)
     setIsPopUp(true)
  }

  const toggleSongLike = (songId) => {
    const newLikedSongs = new Set(likedSongs);
    if (newLikedSongs.has(songId)) {
      newLikedSongs.delete(songId);
    } else {
      newLikedSongs.add(songId);
    }
    setLikedSongs(newLikedSongs);
  };

  const toggleReviewLike = (reviewId) => {
    const newLikedReviews = new Set(likedReviews);
    if (newLikedReviews.has(reviewId)) {
      newLikedReviews.delete(reviewId);
    } else {
      newLikedReviews.add(reviewId);
    }
    setLikedReviews(newLikedReviews);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Album Cover */}
            <div className="flex-shrink-0">
              <img 
                src={albumData.album_image} 
                className="w-64 h-64 rounded-lg shadow-2xl object-cover"
              />
            </div>

            {/* Album Info */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{albumParam.albumName}</h1>
                <div className="flex items-center gap-3 mb-4">
                 {artistData?.artist_image ? (
                <img 
                   src={artistData.artist_image} 
                   className="w-8 h-8 rounded-full object-cover"
                   alt="Artist"
                 />
                 ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700" />
                 )}
                  <span className="text-xl text-gray-300">{albumData.album_artist}</span>
                </div>
              </div>

              {/* Album Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{albumData.year}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genreData.map((genre, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {genre.genre_name}
                  </span>
                ))}
              </div>

              {/* Album Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setLikedAlbum(!likedAlbum)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-colors ${
                    likedAlbum 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedAlbum ? 'fill-current' : ''}`} />
                  {likedAlbum ? 'Liked' : 'Like Album'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Songs List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Tracklist</h2>
            <div className="space-y-2">
              {songData.map((song, index) => (
                <div key={index} className="group bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{song.song_name}</h3>
                      <p className="text-gray-400 text-sm truncate">{song.song_artists}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleSongLike(song.id)}
                        className={`p-2 rounded-full transition-colors ${
                          likedSongs.has(song.id)
                            ? 'text-green-500 hover:text-green-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedSongs.has(song.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 rounded-full text-gray-400 hover:text-white transition-colors" onClick={() => songAddClick(song)}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <img 
                      src={review.userPic} 
                      alt={review.user}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium">{review.user}</h4>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {review.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => toggleReviewLike(review.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        likedReviews.has(review.id)
                          ? 'text-blue-400'
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                      {review.likes + (likedReviews.has(review.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PlaylistPopup
        isPopupOpen = {isPopUp}
        onClose={()=>setIsPopUp(false)}
        currentSong={currentSong}
      />
    </div>
  );
};

export default AlbumPage;