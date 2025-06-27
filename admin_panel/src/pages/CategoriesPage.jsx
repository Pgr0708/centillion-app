import React, { useEffect, useState } from "react";
import CategoryForm from "../components/AddCategoryForm";
import { BASE_URL } from '../constants';



const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [musics, setMusics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = () => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/music_category`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setCurrentPage(1);
      })
      .catch((error) => { });
  };

  const fetchMusics = () => {
    fetch(` ${import.meta.env.VITE_BASE_URL}/music`)
      .then((res) => res.json())
      .then((data) => setMusics(data))
      .catch((error) => { });
  };

  useEffect(() => {
    fetchCategories();
    fetchMusics();
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId);
  };

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategoryClick = (categoryId) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    fetch(` ${import.meta.env.VITE_BASE_URL}/music_category/${categoryId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryId)
        );
      })
      .catch((error) => { });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title1?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.max(
    Math.ceil(filteredCategories.length / itemsPerPage),
    1
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Categories</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-1/3 focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAddCategoryClick}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Add
        </button>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={1}
            value={itemsPerPage}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setItemsPerPage("");
                return;
              }

              const parsed = parseInt(raw);
              if (!isNaN(parsed) && parsed > 0) {
                setItemsPerPage(parsed);
                setCurrentPage(1);
              }
            }}
            onBlur={() => {
              if (!itemsPerPage || itemsPerPage === "") {
                setItemsPerPage(10);
              }
            }}
            className="p-2 border rounded w-20"
          />
          <span className="text-gray-700 font-medium">Per Page</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-bold">ID</th>
              <th className="px-6 py-3 font-bold">Image</th>
              <th className="px-6 py-3 font-bold">Title</th>
              <th className="px-6 py-3 font-bold">Number of Musics</th>
              <th className="px-6 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((cat, index) => {
              const categoryId = cat.id;
              const relatedMusics = musics.filter(
                (music) => {
                  const ids = music.music_category_ids
                    ? music.music_category_ids.split(',').map(Number)
                    : [];

                  return ids.includes(categoryId);
                }
              );

              return (
                <React.Fragment key={categoryId}>
                  <tr className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4 font-semibold">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={cat.image_name1}
                        alt={cat.title1}
                        className="w-20 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">{cat.title1}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCategoryToggle(categoryId)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {cat.no_of_musics}
                      </button>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEditCategoryClick(cat)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategoryClick(categoryId)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {activeCategoryId === categoryId &&
                    relatedMusics.length > 0 && (
                      <tr className="bg-blue-50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedMusics.map((music) => (
                              <div
                                key={music.id}
                                className="flex items-center space-x-4 bg-white shadow-sm p-3 rounded-md border"
                              >
                                <img
                                  src={music.image_name1}
                                  alt={music.title1}
                                  className="w-14 h-14 object-cover rounded"
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {music.title1}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Music ID: {music.id}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Duration: {music.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              );
            })}

            {paginatedCategories.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          existingData={editingCategory}
          onClose={() => {
            setShowForm(false); fetchCategories();
            fetchMusics();
          }}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
