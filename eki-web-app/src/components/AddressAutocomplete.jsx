import { useState, useEffect, useRef } from 'react';
import { HiOutlineLocationMarker } from 'react-icons/hi';

const extractCity = (address) => {
  // Nominatim returns city in different fields depending on country
  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    ""
  );
};

const AddressAutocomplete = ({ value, onChange, onAddressParsed, onBlur, error }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            // Required by Nominatim usage policy - identify your app
            "Accept-Language": "en",
          },
        }
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (err) {
      console.error("Address search error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (suggestion) => {
    const displayName = suggestion.display_name;
    setInputValue(displayName);
    onChange(displayName);
    setSuggestions([]);
    setIsOpen(false);

    // Extract city and zip from Nominatim's address object
    const addr = suggestion.address || {};
    onAddressParsed({
      city: extractCity(addr),
      zip: addr.postcode || "",
    });
  };

  return (
    <div className="flex flex-col relative" ref={wrapperRef}>
      <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
        Street Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <HiOutlineLocationMarker
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          size={12}
        />
        <input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder="Start typing your address..."
          className={`w-full h-8 pl-9 pr-3 border rounded-xl text-[11px] focus:outline-none transition-colors bg-white ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-gray-200 focus:border-[#F2B53D]"
          }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-gray-300 border-t-[#F2B53D] rounded-full animate-spin" />
          </div>
        )}
        {error && !isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
            {error}
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-slideUp">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="px-3 py-2 text-[11px] text-gray-700 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
            >
              <span className="font-medium">
                {suggestion.display_name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;