import React from "react";

const Header = () => (
  <header className="w-5/6 flex justify-between items-center p-4 border-b shadow-sm bg-page">
    <div className="text-xl font-bold text-accent">HumbleHome</div>
      <form class="flex w-1/2">   
        <div class="relative w-full">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.15 5.6h.01m3.337 1.913h.01m-6.979 0h.01M5.541 11h.01M15 15h2.706a1.957 1.957 0 0 0 1.883-1.325A9 9 0 1 0 2.043 11.89 9.1 9.1 0 0 0 7.2 19.1a8.62 8.62 0 0 0 3.769.9A2.013 2.013 0 0 0 13 18v-.857A2.034 2.034 0 0 1 15 15Z"/>
                </svg>
            </div>
            <input type="text" class="bg-black-100 border text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 dark:bg-white dark:placeholder-gray-400" placeholder="Search..." required />
        </div>
        <button type="submit" class="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-accent_focused dark:bg-accent dark:hover:bg-accent_focused dark:focus:ring-accent_focused">
            <svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>Search
        </button>
    </form>
    <div className="flex items-center gap-4">
      <span>Welcome Back</span>
    </div>
  </header>
);

export default Header;