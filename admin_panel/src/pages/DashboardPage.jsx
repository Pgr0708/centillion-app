import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../constants.jsx';


const DashboardPage = () => {
  const [counts, setCounts] = useState({
    music: 0,
    categories: 0,
    topics: 0,
    quotes: 0,
    playlists: 0,
    specialists: 0,
  });


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/data`, {
          method: 'POST'
        });
        const data = await res.json();

        setCounts({
          music: data.music || 0,
          categories: data.music_category || 0,
          topics: data.topic || 0,
          quotes: data.quote || 0,
          playlists: data.playlist || 0,
          specialists: data.specialist || 0,
        });
      } catch (error) {
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link to="/musics" className="bg-blue-500 text-white rounded-lg p-6 shadow-lg hover:bg-blue-600 transition">
          <h2 className="text-2xl font-semibold">Musics</h2>
          <p className="text-lg mt-2">{counts.music} Items</p>
        </Link>

        <Link to="/categories" className="bg-green-500 text-white rounded-lg p-6 shadow-lg hover:bg-green-600 transition">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="text-lg mt-2">{counts.categories} Items</p>
        </Link>

        <Link to="/topics" className="bg-yellow-500 text-white rounded-lg p-6 shadow-lg hover:bg-yellow-600 transition">
          <h2 className="text-2xl font-semibold">Topics</h2>
          <p className="text-lg mt-2">{counts.topics} Items</p>
        </Link>

        <Link to="/quotes" className="bg-purple-500 text-white rounded-lg p-6 shadow-lg hover:bg-purple-600 transition">
          <h2 className="text-2xl font-semibold">Quotes</h2>
          <p className="text-lg mt-2">{counts.quotes} Items</p>
        </Link>

        <Link to="/playlists" className="bg-pink-500 text-white rounded-lg p-6 shadow-lg hover:bg-pink-600 transition">
          <h2 className="text-2xl font-semibold">Playlists</h2>
          <p className="text-lg mt-2">{counts.playlists} Items</p>
        </Link>
                <Link to="/specialists" className="bg-pink-500 text-white rounded-lg p-6 shadow-lg hover:bg-pink-600 transition">
          <h2 className="text-2xl font-semibold">Specialists</h2>
          <p className="text-lg mt-2">{counts.specialists} Items</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
