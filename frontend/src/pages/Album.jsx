import React, { useEffect, useState } from 'react';
import { Heart, Plus, ThumbsUp, Play, Clock, Calendar, Tag, Star, X, ArrowUp } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import PlaylistPopup from '../components/PlaylistPopUp';
import { ACCESS_TOKEN } from '../constants';

const AlbumPage = () => {
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [upvotedReviews, setUpvotedReviews] = useState(new Set());
  const [albumData,setAlbumData] = useState({})
  const [songData,setSongData] = useState([])
  const [artistData,setArtistData] = useState({})
  const [genreData,setGenreData] = useState([])
  const [isPopUp,setIsPopUp] = useState(false)
  const [currentSong,setCurrentSong] = useState({})
  const [ratings,setRatings] = useState([])
  
  // Review modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

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

  useEffect(()=>{
    const fetchRatings = async () => {
       if(!albumData) return

       const raw = `reviews/albums/${albumParam.albumName}/`
       const url = raw.replace(/ /g, "%20");

      try{
        const res = await api.get(url)
        console.log(res.data)
        setRatings(res.data)
      }catch(err){
        console.log(err)
      }
    }

    fetchRatings();

  },[])

  

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

  const toggleReviewUpvote = async (reviewId) => {
    const newUpvotedReviews = new Set(upvotedReviews);
    
    let count=0
    if (newUpvotedReviews.has(reviewId)) {
      count = -1
      newUpvotedReviews.delete(reviewId);
    } else {
      count = 1
      newUpvotedReviews.add(reviewId);
    }
    setUpvotedReviews(newUpvotedReviews);

     const token = localStorage.getItem(ACCESS_TOKEN)
     const user_id = jwtDecode(token).user_id
     
     const data = {
       user_id: user_id,
       rating_id: reviewId,
       count: count
     }
     console.log(data)
     await api.post('reviews/upvote/',data)
  };

  const handleSubmitReview = async () => {
    if (reviewText.trim() && reviewRating > 0) {
      const token = localStorage.getItem(ACCESS_TOKEN)
      const user_id = jwtDecode(token).user_id
      const data = {
        stars: reviewRating,
        album_name : albumData.album_name,
        content: reviewText,
        user_id: user_id
      }
      console.log('Review submitted:', data);

      await api.post('reviews/add/',data)
      
      // Reset form and close modal
      setReviewText('');
      setReviewRating(0);
      setHoverRating(0);
      setIsReviewModalOpen(false);

       const fetchRatings = async () => {
       if(!albumData) return

       const raw = `reviews/albums/${albumParam.albumName}/`
       const url = raw.replace(/ /g, "%20");

      try{
        const res = await api.get(url)
        console.log(res.data)
        setRatings(res.data)
      }catch(err){
        console.log(err)
      }
    }

    fetchRatings();
    }
  };

  const renderStars = (rating, interactive = false, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = interactive ? 
        (hoverRating >= starNumber || (!hoverRating && reviewRating >= starNumber)) :
        rating >= starNumber;
      
      return (
        <Star
          key={index}
          className={`${size} cursor-pointer transition-colors ${
            isActive ? 'text-yellow-400 fill-current' : 'text-gray-400'
          }`}
          onClick={interactive ? () => setReviewRating(starNumber) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(starNumber) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    });
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
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  Review Album
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
              {ratings.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <img 
                      src= {`http://127.0.0.1:8000${review.userPic}`}
                      alt={review.user}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium">{review.user}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {review.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => toggleReviewUpvote(review.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        upvotedReviews.has(review.id)
                          ? 'text-blue-400'
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                    >
                      <ArrowUp className={`w-4 h-4 ${upvotedReviews.has(review.id) ? 'fill-current' : ''}`} />
                      {review.upvotes + (upvotedReviews.has(review.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Review Album</h3>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {renderStars(reviewRating, true, 'w-8 h-8')}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this album..."
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewText.trim() || reviewRating === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PlaylistPopup
        isPopupOpen = {isPopUp}
        onClose={()=>setIsPopUp(false)}
        currentSong={currentSong}
      />
    </div>
  );
};

export default AlbumPage;