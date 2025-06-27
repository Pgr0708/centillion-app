import React, { useState, useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import TopicsPage from './pages/TopicsPage';
import CategoriesPage from './pages/CategoriesPage';
import MusicsPage from './pages/MusicsPage';
import QuotesPage from './pages/QuotesPage';
import PlaylistPage from './pages/PlaylistPage';
import SpecialistPage from './pages/SpecialistPage';
import PrivateRoute from './components/PrivateRoute'; 

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('isAuthenticated');
    if (storedAuthStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('isAuthenticated', status); 
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route 
          path="/" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <MainLayout />
            </PrivateRoute>                                                         
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='/topics' element={<TopicsPage />} />
          <Route path='/categories' element={<CategoriesPage />} />
          <Route path='/musics' element={<MusicsPage />} />
          <Route path='/playlists' element={<PlaylistPage />} />
          <Route path='/quotes' element={<QuotesPage />} />
          <Route path='/specialists' element={<SpecialistPage />} /> 
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;



