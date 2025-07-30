import React, { use } from 'react';
import { Star, User, Film } from 'lucide-react';
import { useEffect,useState } from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { jwtDecode } from 'jwt-decode';



const UserProfile = () => {

  const [ruser,setUser] = useState({})
  const [reviews,setReviews] = useState([])
  const [albums,setAlbums] = useState([])

  useEffect(()=>{
        const fetchData = async () =>{
            try{
                 const token = localStorage.getItem(ACCESS_TOKEN);
                 const user_id = jwtDecode(token).user_id;

                 const res = await api.get(`profile/${user_id}/`)
                 setUser(res.data?.user_info)
                 setReviews(res.data?.ratings)
                 setAlbums(res.data?.recent_albums)
            }catch(err){
                console.log(err)
            }
        }
       
        fetchData();

  },[])
  
  const StarRating = ({ stars }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= stars ? 'fill-orange-400 text-orange-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const DefaultUserImage = ({ size = "w-12 h-12" }) => (
    <div className={`${size} bg-gray-700 rounded-full flex items-center justify-center`}>
      <User className="text-gray-400" size={size.includes('w-12') ? 24 : 32} />
    </div>
  );

  const DefaultAlbumImage = ({ size = "w-full aspect-[2/3]" }) => (
    <div className={`${size} bg-gray-700 rounded-lg flex items-center justify-center`}>
      <Film className="text-gray-400" size={size.includes('w-8') ? 16 : 32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
          <div className="flex items-center gap-6 justify-between">
            <div className="flex items-center gap-6">
              {ruser.user_image ? (
                <img 
                  src={`http://127.0.0.1:8000${ruser.user_image}`} 
                  alt={ruser.user_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <DefaultUserImage size="w-20 h-20" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{ruser.user_name}</h1>
                <p className="text-gray-300 text-lg">{ruser.user_title}</p>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-orange-400">Recent Reviews</span>
          </h2>
          <div className="space-y-4">
            {reviews.map((review,id) => (
              <div key={id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  {ruser.user_image ? (
                    <img 
                      src={`http://127.0.0.1:8000${ruser.user_image}`} 
                      alt={ruser.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <DefaultUserImage />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{review.userName}</h3>
                      <StarRating stars={review.stars} />
                    </div>
                    <div className="flex gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {review.album_image ? (
                          <img 
                            src={review.album_image} 
                            alt={review.album_name}
                            className="w-8 h-12 object-cover rounded"
                          />
                        ) : (
                          <DefaultAlbumImage size="w-8 h-12" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-orange-400 font-medium text-sm mb-2">{review.album_name}</h4>
                        <p className="text-gray-300 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Albums */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-orange-400">Recent shopped Albums</span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {albums.map((album,id) => (
              <div key={id} className="group cursor-pointer">
                <div className="mb-3 transition-transform group-hover:scale-105">
                  {album.album_image ? (
                    <img 
                      src={album.album_image} 
                      alt={album.album_name}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                    />
                  ) : (
                    <DefaultAlbumImage />
                  )}
                </div>
                <h3 className="text-white font-medium text-center group-hover:text-orange-400 transition-colors">
                  {album.album_name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;