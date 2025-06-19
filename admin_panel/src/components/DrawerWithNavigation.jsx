import React from 'react';
import { MdCategory, MdOutlineCategory } from "react-icons/md";
import { MdOutlineDashboard, MdDashboard } from "react-icons/md";
import { IoMusicalNotesOutline, IoMusicalNotesSharp } from "react-icons/io5";
import { BsChatRightQuote, BsChatRightQuoteFill } from "react-icons/bs";
import { HiOutlineUsers, HiUsers } from "react-icons/hi2";
import { MdOutlineTopic, MdTopic } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';


const DrawerWithNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  const handleClick = (item) => {
    navigate(`/${item}`);
  };

  const navItem = (item, text, Icon, ActiveIcon, onClick, additionalClass = "") => {
    const isActive = currentPath === item;
    return (
      <li>
        <div
          className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 group cursor-pointer ${isActive ? 'bg-black text-white' : ''
            } ${additionalClass}`}
          onClick={() => onClick(item)}
        >
          {isActive ? (
            <ActiveIcon className="w-5 h-5 text-white" />
          ) : (
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
          )}
          <span className="ml-3">{text}</span>
        </div>
      </li>
    );
  };

  return (
    <div>
      <div
        id="drawer-navigation"
        className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto bg-white w-64 dark:bg-gray-800`}
        tabIndex="-1"
        aria-labelledby="drawer-navigation-label"
      >
        <h5 id="drawer-navigation-label" className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Meditation00</h5>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">

            {navItem('dashboard', 'Dashboard', MdOutlineDashboard, MdDashboard, handleClick)}
            {navItem('topics', 'Topics', MdOutlineTopic, MdTopic, handleClick)}
    
            {navItem('categories', 'Categories', MdOutlineCategory, MdCategory, handleClick)}
            {navItem('musics', 'Musics', IoMusicalNotesOutline, IoMusicalNotesSharp, handleClick)}
            {navItem('playlists', 'Playlists', BsChatRightQuote, BsChatRightQuoteFill, handleClick)}

            {/* {navItem('authors', 'Authors', HiOutlineUsers, HiUsers, handleClick)} */}
            {navItem('quotes', 'Quotes', BsChatRightQuote, BsChatRightQuoteFill, handleClick)}

                                    {navItem('specialists', 'Specialists', HiOutlineUsers, HiUsers, handleClick)}



          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrawerWithNavigation;
