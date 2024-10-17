import React, { useState, useEffect } from 'react';

const ThemeBtn = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {

        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                value=""
                className="sr-only peer"
                onChange={toggleTheme}
                checked={theme === 'dark'}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-600 dark:peer-focus:ring-[#0F3460] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0F3460] dark:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-white"></div>
            <span className="ml-3 text-sm font-medium dark:text-white text-gray-200">Toggle Theme</span>
        </label>
    );
};

export default ThemeBtn;
