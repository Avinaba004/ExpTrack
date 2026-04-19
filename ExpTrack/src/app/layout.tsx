import React from 'react';

const Layout = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Expense Tracker</h1>
                <nav>
                    {/* Navigation links can be added here */}
                </nav>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Expense Tracker</p>
            </footer>
        </div>
    );
};

export default Layout;