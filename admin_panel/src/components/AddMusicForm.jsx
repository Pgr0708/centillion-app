import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../constants';

const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const MusicForm = ({ onClose, existingData }) => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    sound: null,
    duration: '',
    type: 'free',
    isFeatured: false,
    horizontal_image: null,
    vertical_image: null,
    suggested_by: [],
    description: '',
    createdAt: '',
  });

  const [existingFiles, setExistingFiles] = useState({
    sound: '',
    horizontal_image: '',
    vertical_image: '',
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        title: existingData.title,
        duration: existingData.duration,
        description: existingData.description,
        type: existingData.type,
        isFeatured: existingData.isFeatured,
suggested_by: existingData.suggested_by || [],
        sound: null,
        horizontal_image: null,
        vertical_image: null,
      });

      setExistingFiles({
        sound: existingData.sound,
        horizontal_image: existingData.horizontal_image,
        vertical_image: existingData.vertical_image,
      });

      setSelectedTopic({ topic_id: existingData.music_topic_id });
      setSelectedCategories(existingData.music_category_id || []);
    }
  }, [existingData]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/topic`)
      .then(res => res.json())
      .then(data => {
        setTopics(data);
      })
      .catch();

    fetch(`${import.meta.env.VITE_API_URL}/music_category`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
      })
      .catch();
  }, []);

  const filteredCategories = selectedTopic
    ? categories.filter(
        cat => String(cat.topic_id) === String(selectedTopic.topic_id)
      )
    : [];

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

  const handleSuggestedByChange = (name) => {
    setFormData(prev => {
      const alreadySelected = prev.suggested_by.includes(name);
      return {
        ...prev,
        suggested_by: alreadySelected
          ? prev.suggested_by.filter(n => n !== name)
          : [...prev.suggested_by, name],
      };
    });
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

    compareAndAppend('sound', existingFiles.sound);
    compareAndAppend('horizontal_image', existingFiles.horizontal_image);
    compareAndAppend('vertical_image', existingFiles.vertical_image);

    const musicPayload = {
      ...formData,
      music_topic_id: selectedTopic?.topic_id,
      music_category_id: selectedCategories,
      created_at: formData.createdAt || new Date().toLocaleDateString("en-GB"),
      music_id: existingData?.music_id || null
    };

    data.append('musicData', JSON.stringify(musicPayload));

    const url = existingData
      ? `${import.meta.env.VITE_API_URL}/music/update`
      : `${import.meta.env.VITE_API_URL}/music/upload`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      alert("Music saved!");
      onClose(true);
    } catch (err) {
      alert("Error saving music");
    }
  };

  const checkboxOptions = ['michel rozer', 'richell pirade', 'john doe', 'jane smith'];

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Music</h2>
        <button onClick={onClose} className="text-red-500 font-bold text-2xl">×</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
        <div>
          <label className="block font-semibold mb-1">Music Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Topic</label>
          <select
            name="topic"
            value={selectedTopic?.topic_id || ""}
            onChange={(e) => {
              const selected = topics.find(t => String(t.topic_id) === e.target.value);
              setSelectedTopic(selected);
              setSelectedCategories([]);
            }}
            required
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic.topic_id} value={topic.topic_id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Categories</label>
          <div className="border border-gray-300 rounded-md p-3 shadow-sm bg-white max-h-64 overflow-y-auto">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.music_category_id);
              return (
                <label
                  key={cat.music_category_id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                >
                  <input
                    type="checkbox"
                    value={cat.music_category_id}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedCategories(prev => {
                        if (isSelected) {
                          return prev.filter(id => id !== cat.music_category_id);
                        } else {
                          return [...prev, cat.music_category_id];
                        }
                      });
                    }}
                  />
                  <span>{cat.title}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Choose Music File</label>
          {existingFiles.sound && (
            <p className="text-sm text-gray-500 mb-2">
              Previous: {stripUUID(existingFiles.sound)}
            </p>
          )}
          <input
            type="file"
            name="sound"
            onChange={handleFileChange}
            accept="audio/mp3"
            required={!existingFiles.sound}
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="Duration (mm:ss)"
            required
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div className="col-span-1 md:col-span-2 flex gap-6 items-center">
          <label className="font-semibold">Type:</label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="premium"
              checked={formData.type === 'premium'}
              onChange={handleInputChange}
            />
            Premium
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="free"
              checked={formData.type === 'free'}
              onChange={handleInputChange}
            />
            Free
          </label>
        </div>

        <label className="flex items-center gap-2 col-span-1 md:col-span-2 font-semibold">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              isFeatured: e.target.checked
            }))}
          />
          Featured
        </label>

        <div>
          <label className="block font-semibold mb-1">Choose Horizontal Image</label>
          {existingFiles.horizontal_image && (
            <img
              src={existingFiles.horizontal_image}
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
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Choose Vertical Image</label>
          {existingFiles.vertical_image && (
            <img
              src={existingFiles.vertical_image}
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
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <p className="font-semibold mb-2">Suggested By:</p>
          <div className="flex flex-wrap gap-4">
            {checkboxOptions.map(name => (
              <label key={name} className="flex items-center gap-2 font-medium text-gray-700">
                <input
                  type="checkbox"
                  value={name}
                  checked={formData.suggested_by.includes(name)}
                  onChange={() => handleSuggestedByChange(name)}
                />
                {name}
              </label>
            ))}
          </div>
        </div>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter description (max 150 words)"
          maxLength={1000}
          required
          className="p-3 border border-gray-300 rounded-md shadow-sm col-span-1 md:col-span-2"
        />

        <div className="col-span-1 md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default MusicForm;
