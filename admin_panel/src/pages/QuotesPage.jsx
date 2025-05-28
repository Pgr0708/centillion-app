import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../constants';

const categories = [
  { id: '1', name: 'Daily Mindfulness' },
  { id: '2', name: 'Breath Awareness' },
  { id: '3', name: 'Presence & Stillness' },
  { id: '4', name: 'Observing Thoughts' },
  { id: '5', name: 'Letting Go' },
  { id: '6', name: 'Acceptance' },
  { id: '7', name: 'Emotional Balance' },
  { id: '8', name: 'Silence & Serenity' },
  { id: '9', name: 'Self-Discovery' },
  { id: '10', name: 'Inner Strength' },
  { id: '11', name: 'Embracing Change' },
  { id: '12', name: 'Shadow Work' },
  { id: '13', name: 'Self-Acceptance' },
  { id: '14', name: 'Kindness to Self' },
  { id: '15', name: 'Worthiness' },
  { id: '16', name: 'Gentle Reminders' },
  { id: '17', name: 'Morning Inspiration' },
  { id: '18', name: 'Uplifting Energy' },
  { id: '19', name: 'Affirmations' },
  { id: '20', name: 'Resilience' },
  { id: '21', name: 'Winding Down' },
  { id: '22', name: 'Peaceful Night' },
  { id: '23', name: 'Restful Mind' },
  { id: '24', name: 'Soothing Reflections' },
  { id: '25', name: 'Higher Self' },
  { id: '26', name: 'Universal Energy' },
  { id: '27', name: 'Gratitude' },
  { id: '28', name: 'Divine Guidance' },
  { id: '29', name: 'Lessons from Nature' },
  { id: '30', name: 'Beauty in Simplicity' },
  { id: '31', name: 'Flow & Seasons' },
  { id: '32', name: 'Grounding' },
  { id: '33', name: 'Mental Clarity' },
  { id: '34', name: 'Present Focus' },
  { id: '35', name: 'Letting Go of Distractions' },
  { id: '36', name: 'Awareness of Now' },
];

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/quote`, {
      method: 'GET',
    });
    const data = await res.json();
    setQuotes(data);
    setFilteredQuotes(data);
  };

  const getCategoryName = (id) => {
    const found = categories.find(c => c.id === id);
    return found ? found.name : 'Unknown';
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = quotes.filter(q => {
      const categoryName = getCategoryName(q.quote_category_id).toLowerCase();
      return categoryName.includes(term);
    });

    setFilteredQuotes(filtered);
    setCurrentPage(1);
  };

  const handleAddQuote = async () => {
    if (!newQuote.trim() || !selectedCategory) return;

    const selectedCat = categories.find(c => c.id === selectedCategory);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/quote/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_line: newQuote,
        quote_category_id: selectedCat.id,
        quote_category_name: selectedCat.name,
      }),
    });

    if (res.ok) {
      setNewQuote('');
      setSelectedCategory('');
      fetchQuotes();
    } else {
      alert('Failed to add quote');
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quote?')) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/quote/delete/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setQuotes(prev => prev.filter(q => q.quote_id !== id));
      setFilteredQuotes(prev => prev.filter(q => q.quote_id !== id));
    } else {
      alert('Failed to delete quote');
    }
  };

  const totalPages = Math.ceil(filteredQuotes.length / (itemsPerPage || 1));
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * (itemsPerPage || 1),
    currentPage * (itemsPerPage || 1)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Quotes</h2>
        <div className="flex items-end gap-2 w-1/10">
          <input
            type="text"
            placeholder="New quote"
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddQuote}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add New Quote
          </button>
        </div>
      </div>


      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by category..."
          value={searchTerm}
          onChange={handleSearch}
          className="border px-3 py-2 rounded w-1/4"
        />
        <div className="flex items-center gap-2 px-10">
          <input
            type="number"
            min={1}
            value={itemsPerPage}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setItemsPerPage('');
              } else {
                const num = parseInt(val);
                if (!isNaN(num) && num > 0) {
                  setItemsPerPage(num);
                }
              }
            }}
            onBlur={() => {
              if (!itemsPerPage) {
                setItemsPerPage(5);
              }
            }}
            className="p-2 border rounded w-20"
            placeholder="Quotes per page"
          />

          <span className="text-sm text-gray-600">Quotes per page</span>

        </div>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Quote</th>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedQuotes.map((quote, index) => (
            <tr key={quote.quote_id}>
              <td className="border px-4 py-2">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>

              <td className="border px-4 py-2">{quote.quote_line}</td>
              <td className="border px-4 py-2">
                {quote.quote_category_name}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDelete(quote.quote_id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {paginatedQuotes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No quotes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotesPage;
