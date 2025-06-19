import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../constants';
const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const CategoryForm = ({ existingData, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    topic_id: '',
    horizontalImage: null
  });

  const [existingFiles, setExistingFiles] = useState({
    horizontalImage: ''
  });

  useEffect(() => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
      .then(res => res.json())
      .then(data => setTopics(data))
      .catch(err => { });
    console.log('existingData', existingData);
    if (existingData) {
      setFormData({
        title: existingData.title,
        topic_id: existingData.topic_id || '',
        horizontalImage: null
      });

      setExistingFiles({
        horizontalImage: existingData.image,
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

    const payload = {
      music_category_id: existingData?.id || null, // 👈 Add this
      title: formData.title,
      topic_id: formData.topic_id,
      created_at: existingData?.created_at || new Date().toLocaleDateString('en-GB'),
      updated_id: new Date().toLocaleDateString('en-GB'),
    };
    data.append('musicCategoryData', JSON.stringify(payload));

    const url = existingData
      ? ` ${import.meta.env.VITE_BASE_URL}/music_category/update`
      : ` ${import.meta.env.VITE_BASE_URL}/music_category/upload`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      alert('Category saved successfully!');
      onClose();
    } catch (err) {
      alert('Failed to save category');
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
          {existingData ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Category Title"
            className="w-full mb-4 border p-2 rounded"
            required
          />

          <div className="mb-4">
            <label className="block font-medium mb-1">Select Topic</label>
            <select
              name="topic_id"
              value={formData.topic_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Image</label>
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
              accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required={!existingFiles.horizontalImage}
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

export default CategoryForm;
