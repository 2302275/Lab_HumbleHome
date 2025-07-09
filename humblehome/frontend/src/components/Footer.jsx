import { useEffect, useState } from "react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-20 flex flex-col">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start">
        <div className="mb-10 md:mb-0 text-center md:text-left max-w-md">
          <h1 className="text-xl font-bold text-accent">HumbleHome</h1>
          <p className="mt-2">
            Furniture that fits your life. Thoughtfully designed, beautifully crafted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-20">
          <div className="flex flex-col">
            <p className="mb-4 font-semibold">Site Map</p>
            <a href="/about" className="hover:text-gray-300 text-sm mt-1">About</a>
            <a href="/contact" className="hover:text-gray-300 text-sm mt-1">Contact</a>
            <a href="/privacy" className="hover:text-gray-300 text-sm mt-1">Privacy</a>
          </div>

          <div className="flex flex-col">
            <p className="mb-4 font-semibold">Legal</p>
            <a href="/privacy" className="hover:text-gray-300 text-sm mt-1">Privacy</a>
            <a href="/terms" className="hover:text-gray-300 text-sm mt-1">Terms of Service</a>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-accent py-1">
        <p className="text-center text-sm text-white">
          © {new Date().getFullYear()} HumbleHome. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
