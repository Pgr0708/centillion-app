import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const stripUUID = (urlOrName) => {
  if (!urlOrName) return '';
  const name = decodeURIComponent(urlOrName.split('/').pop());
  const parts = name.split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

const MusicForm = ({ onClose, existingData, setShowForm, setEditingMusic,refreshList }) => {
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
    description: '',
    createdAt: '',
    specialist_id: null,
    isHidden: 0,
    isInfinite: 0
  });

  const resetForm = () => {
    setFormData({
      title: '',
      sound: null,
      duration: '',
      type: 'free',
      isFeatured: false,
      horizontal_image: null,
      description: '',
      createdAt: '',
      specialist_id: null,
      isHidden: 0,
      isInfinite: 0
    });
    setSelectedTopic(null);
    setSelectedCategories([]);
    setExistingFiles({ sound: '', horizontal_image: '' });
  };



  const [availableSpecialists, setAvailableSpecialists] = useState([]);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`);
        const data = await response.json();
        setAvailableSpecialists(data || []);
        console.log('Available specialists:', data.specialists);
      } catch (error) {
        console.error('Error fetching specialists:', error);
        setAvailableSpecialists([]); // fallback to empty array
      }
    };

    fetchSpecialists();
  }, []);

  const [existingFiles, setExistingFiles] = useState({
    sound: '',
    horizontal_image: ''
  });

  const isEdit = !!existingData;


  useEffect(() => {
    console.log('Existing data:', existingData);
    if (existingData) {
      setFormData({
        title: existingData.title,
        duration: existingData.duration,
        description: existingData.description,
        type: existingData.is_premium ? 'premium' : 'free',
        isFeatured: existingData.is_featured,
        sound: null,
        horizontal_image: null,
        specialist_id: existingData.specialist_id || null, // ✅ set it
        isHidden: existingData.is_hidden || 0,
        isInfinite: existingData.infinite || 0,

      });

      setExistingFiles({
        sound: existingData.sound,
        horizontal_image: existingData.image,
      });

      setSelectedTopic({ topic_id: existingData.topic_id });
      setSelectedCategories(existingData.music_category_id || []);
    }
  }, [existingData]);

  useEffect(() => {
    if (!selectedTopic?.topic_id) return;

    const fetchSpecialists = async () => {
      try {
        const res = await fetch(` ${import.meta.env.VITE_BASE_URL}/specialist`);
        const data = await res.json();
        const matched = data.filter(s => s.topic_id === selectedTopic.topic_id);
        setAvailableSpecialists(matched);
      } catch (err) {
        console.error('Failed to load specialists', err);
      }
    };

    fetchSpecialists();
  }, [selectedTopic?.topic_id]);

  const handleSpecialistChange = (e) => {
    const { value, checked } = e.target;
    const specialistId = parseInt(value, 10);
    setFormData((prev) => {
      const specialists = new Set(prev.specialists);
      if (checked) {
        specialists.add(specialistId);
      } else {
        specialists.delete(specialistId);
      }
      return { ...prev, specialists: Array.from(specialists) };
    });
  };

  useEffect(() => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/topic`)
      .then(res => res.json())
      .then(data => {
        setTopics(data);
      })
      .catch();

    fetch(` ${import.meta.env.VITE_BASE_URL}/music_category`)
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

    const musicPayload = {
      ...formData,
      music_topic_id: selectedTopic?.topic_id,
      music_category_id: selectedCategories,
      created_at: formData.createdAt || new Date().toLocaleDateString("en-GB"),
      music_id: existingData?.id || null,
    };
    console.log('Music Payload:', musicPayload);

    data.append('musicData', JSON.stringify(musicPayload));


    const url = existingData
      ? ` ${import.meta.env.VITE_BASE_URL}/music/update`
      : ` ${import.meta.env.VITE_BASE_URL}/music/upload`;

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
const handleContinue = async () => {
  const data = new FormData();

  const compareAndAppend = (field, existingUrl) => {
    const file = formData[field];
    if (file && stripUUID(file.name) !== stripUUID(existingUrl)) {
      data.append(field, file);
    }
  };

  compareAndAppend('sound', existingFiles.sound);
  compareAndAppend('horizontal_image', existingFiles.horizontal_image);

  const musicPayload = {
    ...formData,
    music_topic_id: selectedTopic?.topic_id,
    music_category_id: selectedCategories,
    created_at: new Date().toLocaleDateString("en-GB"),
    music_id: null,
    isHidden: formData.isHidden || 0,
    isInfinite: formData.isInfinite || 0,
  };

  data.append('musicData', JSON.stringify(musicPayload));

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/music/upload`, {
      method: 'POST',
      body: data,
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    alert("Music saved!");

    if (typeof refreshList === 'function') {
      refreshList(); // ✅ optional: refresh list in parent if needed
    }

    // ✅ Wait until after upload is fully done to reset form state
    flushSync(() => {
      setShowForm(false);
      setEditingMusic(null);
    });

    // ✅ Delay slightly to allow re-render, then show new form
    setTimeout(() => {
      setShowForm(true);
    }, 50);
  } catch (err) {
    console.error(err);
    alert("Failed to save music");
  }
};


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
              const selected = topics.find(t => String(t.id) === e.target.value);
              setSelectedTopic({ topic_id: selected.id });
              setSelectedCategories([]);
            }}
            required
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          >
            <option value="">Select Topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Categories</label>
          <div className="border border-gray-300 rounded-md p-3 shadow-sm bg-white max-h-64 overflow-y-auto">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                >
                  <input
                    type="checkbox"
                    value={cat.id}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedCategories(prev => {
                        if (isSelected) {
                          return prev.filter(id => id !== cat.id);
                        } else {
                          return [...prev, cat.id];
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
            accept=".mp3,.m4a,.wav,.aac,.ogg,.flac,.webm"
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

        <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-x-8 gap-y-4">
          {/* Type */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Type:</label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                value="premium"
                checked={formData.type === 'premium'}
                onChange={handleInputChange}
              />
              Premium
            </label>
            <label className="flex items-center gap-1">
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

          {/* Hidden */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Hidden:</label>
            <input
              type="checkbox"
              checked={!!formData.isHidden}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  isHidden: e.target.checked ? 1 : 0
                }))
              }
            />
          </div>

          {/* Infinite */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Infinite:</label>
            <input
              type="checkbox"
              checked={!!formData.isInfinite}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  isInfinite: e.target.checked ? 1 : 0
                }))
              }
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Featured:</label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  isFeatured: e.target.checked
                }))
              }
            />
          </div>
        </div>


        <div>
          <label className="block font-semibold mb-1"> Image</label>
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
            accept="image/jpeg, image/png, image/webp, image/svg+xml, image/jpg"
            required={!existingFiles.horizontal_image}
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Select Specialist</label>
          <select
            value={formData.specialist_id || ""}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                specialist_id: e.target.value === "" ? null : parseInt(e.target.value)
              }))
            }
            className="p-3 border border-gray-300 rounded-md shadow-sm w-full"
          >
            <option value="">Select Specialist</option>
            {availableSpecialists.map((specialist) => (
              <option key={specialist.id} value={specialist.id}>
                {specialist.name}
              </option>
            ))}
          </select>
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
          {!isEdit && (
            <button
              type="button"
              onClick={handleContinue}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-semibold mr-3"
            >
              Continue
            </button>
          )}
          {/* <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            Submit
          </button> */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            Done
          </button>

        </div>
      </form>
    </div>
  );
};

export default MusicForm;
