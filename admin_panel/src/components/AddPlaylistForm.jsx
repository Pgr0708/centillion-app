import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../constants';


const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const AddPlaylistForm = ({ existingData, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    horizontal_image: null,
    vertical_image: null,
  });

  const [existingFiles, setExistingFiles] = useState({
    horizontal_image: '',
    vertical_image: '',
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        title: existingData.title,
        horizontal_image: null,
        vertical_image: null,
      });

      setExistingFiles({
        horizontal_image: existingData.horizontal_image,
        vertical_image: existingData.vertical_image,
      });


    }
  }, [existingData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    const compareAndAppend = (field, existingUrl) => {
      const file = formData[field];
      if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
        data.append(field, file);
      }
    };

    compareAndAppend('horizontal_image', existingFiles.horizontal_image);
    compareAndAppend('vertical_image', existingFiles.vertical_image);

    data.append('title', formData.title);
    if (existingData?.playlist_id) data.append('playlist_id', existingData.playlist_id);
    if (formData.horizontal_image) data.append('horizontal_image', formData.horizontal_image);
    if (formData.vertical_image) data.append('vertical_image', formData.vertical_image);

    const url = existingData
      ? `${import.meta.env.VITE_API_URL}/playlist/update`
      : `${import.meta.env.VITE_API_URL}/playlist/upload`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      alert("Playlist saved!");
      onClose();
    } catch (err) {
      alert("Error saving playlist");
    }
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl p-6 max-w-2xl mx-auto border rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {existingData ? 'Edit Playlist' : 'Add Playlist'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter title"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Horizontal Image</label>
          {existingFiles.horizontal_image && (
            <img
              src={`${import.meta.env.VITE_API_URL}/images/${existingFiles.horizontal_image}`}
              alt="Previous Horizontal"
              className="w-20 h-10 rounded border"
            />
          )}

          <input
            type="file"
            name="horizontal_image"
            onChange={handleFileChange}
            accept="image/jpeg, image/jpg"
            required={!existingFiles.horizontal_image}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Vertical Image</label>
          {existingFiles.vertical_image && (
            <img
              src={`${import.meta.env.VITE_API_URL}/images/${existingFiles.vertical_image}`}
              alt="Previous Vertical"
              className="w-20 h-10 rounded border"
            />
          )}
          <input
            type="file"
            name="vertical_image"
            onChange={handleFileChange}
            accept="image/jpeg, image/jpg"
            required={!existingFiles.vertical_image}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlaylistForm;
