import React, { useState, useRef, useEffect } from 'react';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import Flag from 'react-world-flags'; // Import the flag component
import { HiOutlineSearch, HiChevronDown, HiCheck } from "react-icons/hi";

countries.registerLocale(enLocale);

const SearchableCountrySelector = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  const countryList = Object.entries(countries.getNames("en", { select: "official" }))
    .map(([code, name]) => ({ code, name }));

  const filteredCountries = countryList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountryName = countries.getName(value, "en");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col relative" ref={wrapperRef}>
      <label className="text-[12px] font-bold text-gray-600 mb-1 ml-1 font-sans">Country</label>
      
      {/* Select Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 flex items-center justify-between border ${
          isOpen ? "border-[#F2B53D] bg-white shadow-sm" : error ? "border-red-400" : "border-gray-200"
        } rounded-xl cursor-pointer transition-all bg-white`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Show flag if a value is selected */}
          {value ? (
            <Flag code={value} className="w-5 h-4 rounded-sm object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="w-5 h-4 bg-gray-100 rounded-sm shrink-0" />
          )}
          <span className={`text-[14px] truncate ${value ? "text-gray-800 font-medium" : "text-gray-400"}`}>
            {selectedCountryName || "Select Country"}
          </span>
        </div>
        <HiChevronDown className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-index:100; top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-slideUp">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-50 bg-gray-50 flex items-center gap-2">
            <HiOutlineSearch className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              className="bg-transparent w-full outline-none text-[13px] font-medium font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List of Countries */}
          <div className="max-height: 220px overflow-y-auto custom-scrollbar">
            {filteredCountries.map((c) => (
              <div
                key={c.code}
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Flag code={c.code} className="w-5 h-3.5 rounded-sm object-cover shadow-xs" />
                  <span className="text-[13px] text-gray-700 font-medium">{c.name}</span>
                </div>
                {value === c.code && <HiCheck className="text-[#F2B53D]" />}
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-[12px]">No countries found</div>
            )}
          </div>
        </div>
      )}
      {error && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1">{error}</span>}
    </div>
  );
};

export default SearchableCountrySelector;