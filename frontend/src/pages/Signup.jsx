import React, { useState } from 'react';
import { Upload, User } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [password, setPassword] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('user_name', username);
  formData.append('user_title', userTitle);
  formData.append('password', password);
  if (userImage) {
    formData.append('user_image', userImage);
  }

  try {
    const res = await api.post('signup/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.status === 201) {
      navigate('/login');
    }
  } catch (error) {
    console.error(error);
    alert('Sign up failed - Try again');
  }
};


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Sign Up</h2>
            <div className="w-12 h-1 bg-green-500 mx-auto rounded"></div>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="userTitle" className="block text-sm font-medium text-gray-300 mb-2">
                User Title
              </label>
              <input
                id="userTitle"
                name="userTitle"
                type="text"
                required
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your title"
              />
            </div>

            <div>
              <label htmlFor="userImage" className="block text-sm font-medium text-gray-300 mb-2">
                User Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-600">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="userImage" className="cursor-pointer">
                    <div className="flex items-center justify-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors">
                      <Upload className="w-4 h-4 text-gray-300 mr-2" />
                      <span className="text-sm text-gray-300">Upload Image</span>
                    </div>
                    <input
                      id="userImage"
                      name="userImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSignUp}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              Already have an account? Log in
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            By signing up, you agree to our{' '}
            <a href="#" className="font-medium text-green-400 hover:text-green-300 transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}