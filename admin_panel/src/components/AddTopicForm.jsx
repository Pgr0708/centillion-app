import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../constants';


const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const TopicForm = ({ existingData, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    horizontalImage: null,
    verticalImage: null
  });

  const [existingFiles, setExistingFiles] = useState({
    horizontalImage: '',
    verticalImage: ''
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        title: existingData.title,
        horizontalImage: null,
        verticalImage: null
      });

      setExistingFiles({
        horizontalImage: existingData.horizontal_image,
        verticalImage: existingData.vertical_image
      });
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    compareAndAppend('horizontalImage', existingFiles.horizontalImage);
    compareAndAppend('verticalImage', existingFiles.verticalImage);

    const payload = {
      title: formData.title,
      topic_id: existingData?.topic_id || null
    };

    data.append("topicData", JSON.stringify(payload));

    const url = existingData
      ? `${import.meta.env.VITE_API_URL}/topic/update`
      : `${import.meta.env.VITE_API_URL}/topic/upload`;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: data
      });
      const result = await res.json();
      alert("Topic saved successfully!");
      onClose();
    } catch (err) {
      alert("Failed to save topic");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {existingData ? "Edit Topic" : "Add Topic"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full mb-4 border p-2 rounded"
          />

          <div className="mb-4">
            <label className="block font-medium mb-1">Horizontal Image</label>
            {existingFiles.horizontalImage && (
              <img
                src={existingFiles.horizontalImage}
                alt="Previous Horizontal"
                className="w-20 h-10 rounded border"
              />
            )}
            <input
              type="file"
              name="horizontalImage"
              accept="image/jpeg, image/jpg"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!existingFiles.horizontalImage}
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Vertical Image</label>
            {existingFiles.verticalImage && (
              <img
                src={existingFiles.verticalImage}
                alt="Previous Vertical"
                className="w-20 h-10 rounded border"
              />
            )}
            <input
              type="file"
              name="verticalImage"
              accept="image/jpeg, image/jpg"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!existingFiles.verticalImage}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </form>

      </div>
    </div>
  );
};

export default TopicForm;
