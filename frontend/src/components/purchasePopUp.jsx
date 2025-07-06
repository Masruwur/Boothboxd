import React, { useState,useEffect } from 'react';
import { X, Music, Calendar, CreditCard } from 'lucide-react';
import api from '../api';

const PurchaseConfirmationPopup = ({isOpen,onClose,data}) => {
  const [albumData,setAlbumData] = useState({})
  const paymentData = {
    last4: data.last4,
    method: data.method,
    expiry: data.expiry
  };

  useEffect(()=>{
    const fetchData = async ()=> {
    try{
       const albumRaw = `albums/${data.album_name}/`
       const albumUrl = albumRaw.replace(/ /g, "%20");
       const albumFetched = await api.get(albumUrl)
       setAlbumData(albumFetched.data[0])
    }catch(e){
      console.log(e)
    }
   }
   fetchData()
  },[])

  const handleConfirm = () => {
    // Handle purchase confirmation logic here
    alert(`${data.ops === 'buy' ? 'Purchase' : 'Rental'} confirmed!`);
    onClose();
  };

  const formatPrice = (price) => {
    return `$${price}`;
  };

  if(!isOpen) return null;
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          {/* Popup */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Confirm {data.ops === 'buy' ? 'Purchase' : 'Rental'}
              </h2>
              <button
                onClick={() => onClose()}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Album Info */}
            <div className="p-6 space-y-4">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={albumData.album_image}
                    alt={albumData.album_name}
                    className="w-20 h-20 rounded-lg object-cover shadow-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {albumData.album_name}
                  </h3>
                  <p className="text-gray-300 truncate">{albumData.album_artist}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {albumData.year}
                    </span>
                    <span className="flex items-center">
                      <Music size={14} className="mr-1" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Type:</span>
                  <span className="text-white font-medium capitalize">
                    {data.ops === 'buy' ? 'Digital Purchase' : 'Rental (1 month)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-green-400 font-bold text-lg">
                    {data.ops === 'buy'? formatPrice(data.buy) : formatPrice(data.rent)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <CreditCard size={18} className="mr-2" />
                  Payment Method
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <span className="text-gray-300">
                      {paymentData.method} •••• {paymentData.last4}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    Exp: {paymentData.expiry}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-400 leading-relaxed">
                {data.ops === 'buy' 
                  ? 'By purchasing, you agree to our Terms of Service. This purchase grants you a personal, non-transferable license to download and enjoy this album.'
                  : 'By renting, you agree to our Terms of Service. Access expires 48 hours after purchase or 24 hours after first play, whichever comes first.'
                }
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-6 bg-gray-750 border-t border-gray-700">
              <button
                onClick={() => onClose()}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  data.ops === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                Confirm {data.ops === 'buy' ? 'Purchase' : 'Rental'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseConfirmationPopup;