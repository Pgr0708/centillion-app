
import React from 'react';
import { Outlet } from 'react-router-dom';
import DrawerWithNavigation from '../components/drawerWithNavigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({ children }) => {
    return (
        <div className="flex">
            <div className="w-64">
                <DrawerWithNavigation />
            </div>

            <div className="flex-1 p-6">
                <Outlet />
            </div>
            <ToastContainer />
        </div>
    );
};
export default MainLayout;