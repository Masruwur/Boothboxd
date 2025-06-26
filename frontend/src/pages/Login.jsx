import React, { useState } from 'react';
import api from '../api'
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    localStorage.removeItem(ACCESS_TOKEN); 
    e.preventDefault()
    const credentials = {
        user_title : username,
        password : password 
    }
    try {
    const res = await api.post("login/", credentials);
    localStorage.setItem(ACCESS_TOKEN, res.data.access);
    navigate("/home");
    }  catch (error) {
    console.error(error)
    console.log(error.response?.data)
    const message = "Login failed. Please try again.";
    alert(message);
    navigate("/login")
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Log In</h2>
            <div className="w-12 h-1 bg-green-500 mx-auto rounded"></div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                User title
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
                onClick={handleLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Log In
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-green-400 hover:text-green-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}