import { useState, useRef, useEffect } from 'react';
import { City } from 'country-state-city';
import { HiOutlineSearch, HiChevronDown, HiCheck } from "react-icons/hi";
import { HiOutlineBuildingOffice } from "react-icons/hi2";

const SearchableCitySelector = ({ countryCode, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  // Get cities for the selected country
  const cities = countryCode
    ? City.getCitiesOfCountry(countryCode).map(c => c.name)
    : [];

  const filtered = cities.filter(c =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset city when country changes
  useEffect(() => {
    onChange("");
  }, [countryCode]);

  return (
    <div className="flex flex-col relative" ref={wrapperRef}>
      <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
        City <span className="text-red-500">*</span>
      </label>

      {/* Trigger */}
      <div
        onClick={() => countryCode && setIsOpen(!isOpen)}
        className={`w-full h-8 px-3 flex items-center justify-between border rounded-xl transition-all bg-white ${
          !countryCode
            ? 'bg-gray-50 cursor-not-allowed opacity-60'
            : 'cursor-pointer'
        } ${
          isOpen ? 'border-[#F2B53D]' : error ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <HiOutlineBuildingOffice className="text-gray-400 shrink-0" size={12} />
          <span className={`text-[11px] truncate ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {value || (countryCode ? 'Select city' : 'Select country first')}
          </span>
        </div>
        <HiChevronDown
          className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </div>

      {/* Inline error */}
      {error && (
        <span className="absolute right-3 top-[28px] text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
          {error}
        </span>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-slideUp">
          {/* Search */}
          <div className="p-2 border-b border-gray-50 bg-gray-50 flex items-center gap-2">
            <HiOutlineSearch className="text-gray-400" size={12} />
            <input
              autoFocus
              type="text"
              placeholder="Search city..."
              className="bg-transparent w-full outline-none text-[11px] font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((city) => (
                <div
                  key={city}
                  onClick={() => {
                    onChange(city);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 flex items-center justify-between hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <span className="text-[11px] text-gray-700 font-medium">{city}</span>
                  {value === city && <HiCheck className="text-[#F2B53D]" size={12} />}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-400 text-[10px]">
                {searchTerm ? 'No cities found' : 'No cities available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCitySelector;