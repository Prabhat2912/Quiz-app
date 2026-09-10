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
                aria-label="Toggle dark theme"
            />
            <div className="w-11 h-6 bg-rule peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--accent)] after:border after:border-rule after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            <span className="ml-3 text-sm max-md:hidden font-medium text-soft">
                {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
        </label>
    );
};

export default ThemeBtn;
