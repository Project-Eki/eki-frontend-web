import React, { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; 
import logoImage from '../assets/logo.jpeg';
import { validateAccountData } from '../utils/validationUtils'; 
import { getBuyerProfile, updateBuyerProfile } from '../services/authService'; 

function AccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '', 
    profileImage: null,
    profileImageFile: null, 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [linkedSocials, setLinkedSocials] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const availableSocials = [
    { name: 'WhatsApp', color: '#25D366' },
    { name: 'Instagram', color: '#E4405F' },
    { name: 'LinkedIn', color: '#0A66C2' },
    { name: 'Facebook', color: '#1877F2' },
    { name: 'Twitter / X', color: '#000000' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getBuyerProfile();
        // Mapping backend snake_case to frontend camelCase
        setUserData({
          firstName: res.first_name || '',
          lastName: res.last_name || '',
          email: res.email || '',
          phone: res.phone_number || '',
          profileImage: res.profile_picture || null,
          profileImageFile: null
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          console.error("Unauthorized: Check your token in localStorage");
        }
      }
    };
    loadProfile();
  }, []);

  const handleLinkSocial = (social) => {
    if (!linkedSocials.find(s => s.name === social.name)) {
      setLinkedSocials([...linkedSocials, social]);
    }
    setIsDropdownOpen(false);
  };

  const handleUnlink = (name) => {
    setLinkedSocials(linkedSocials.filter(s => s.name !== name));
  };

  const handleEditPhotoClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUserData({ 
        ...userData, 
        profileImage: URL.createObjectURL(file), 
        profileImageFile: file 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAccountData(userData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await updateBuyerProfile(userData);
        alert("Changes saved successfully!");
      } catch (err) {
        // Handling the 401 or other backend errors
        const backendError = err.response?.data?.detail || err.response?.data?.message || "Failed to save changes";
        alert(backendError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handlePhoneChange = (value) => {
    setUserData({ ...userData, phone: value });
    if (errors.phone) setErrors({ ...errors, phone: null });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Navbar */}
      <nav className="h-16 w-full bg-white border-b border-gray-100 px-8 flex items-center justify-between fixed top-0 z-[60]">
        <div className="flex items-center gap-12">
          <img src={logoImage} alt="Logo" className="h-10 w-auto" />
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input type="text" placeholder="Search" className="w-64 bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200" />
          </div>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-black">Home</a>
          <a href="#" className="hover:text-black">Products</a>
          <a href="#" className="hover:text-black">Services</a>
          <div className="relative ml-4">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
               {userData.profileImage && <img src={userData.profileImage} alt="User" className="w-full h-full object-cover" />}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] border-r border-gray-100 bg-white z-50 flex flex-col justify-between py-8 px-4">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 bg-[#125852] text-white px-4 py-2.5 rounded-md text-sm font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            Account Settings
          </button>
          <button className="w-full flex items-center gap-3 text-gray-500 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Privacy Settings
          </button>
        </div>
        <button className="flex items-center gap-3 text-red-500 text-sm font-semibold px-4 py-4 hover:bg-red-50 rounded-md transition-colors border-t border-gray-50 mt-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6-10V7a3 3 0 00-6 0v1" /></svg>
          Sign out
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-24 pb-16 px-10 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Account Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center">
                <div className="relative inline-block mb-2">
                  <div className="w-20 h-20 rounded-full mx-auto bg-gray-100 border-2 border-gray-50 overflow-hidden flex items-center justify-center">
                    {userData.profileImage ? <img src={userData.profileImage} className="w-full h-full object-cover" alt="profile" /> : <span className="text-gray-300">Photo</span>}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <button onClick={handleEditPhotoClick} className="absolute bottom-0 right-0 bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </button>
                </div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {userData.firstName || userData.lastName ? `${userData.firstName} ${userData.lastName}` : "User Name"}
                </h2>
                <p className="text-xs text-gray-400 font-medium">{userData.email || "email@example.com"}</p>
              </div>

              {/* Form Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Account Details</h3>
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-600">First Name</label>
                      <input name="firstName" type="text" value={userData.firstName} onChange={handleChange} className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-50 focus:outline-none transition-all ${errors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} />
                      {errors.firstName && <p className="text-[10px] text-red-500 font-medium">{errors.firstName}</p>}
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-600">Last Name</label>
                      <input name="lastName" type="text" value={userData.lastName} onChange={handleChange} className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-50 focus:outline-none transition-all ${errors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} />
                      {errors.lastName && <p className="text-[10px] text-red-500 font-medium">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <input name="email" type="email" value={userData.email} onChange={handleChange} className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-gray-50 focus:outline-none transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <PhoneInput
                      country={'us'}
                      value={userData.phone}
                      onChange={handlePhoneChange}
                      inputClass={`!w-full !px-12 !py-5 !text-sm !border !rounded-lg !bg-gray-50 !focus:outline-none !transition-all ${errors.phone ? '!border-red-500 !ring-1 !ring-red-500' : '!border-gray-300'}`}
                      buttonClass={`!bg-gray-50 !border !rounded-l-lg ${errors.phone ? '!border-red-500' : '!border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => window.location.reload()} className="px-8 py-2.5 text-sm font-bold bg-[#E5E7EB] text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-8 py-2.5 text-sm font-bold bg-[#F1B434] text-white rounded-xl shadow-md hover:bg-[#D9A22E] disabled:opacity-50">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Cards (Role & Verification) */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest">Your Role</h3>
                <div className="border border-[#125852] border-opacity-20 rounded-lg p-4 flex items-center justify-between bg-gray-50/30">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-md shadow-sm border border-gray-100">
                      <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Vendor</h4>
                      <p className="text-[10px] text-gray-400 font-medium">List products and process payouts.</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[#125852]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              </div>

              {/* Identity Verification Card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest">Identity Verification</h3>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-50 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-800">Identity Status:</h4>
                      <span className="bg-[#125852] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic">Your identity has been successfully verified.</p>
                  </div>
                </div>
              </div>

              {/* Linked Accounts Card */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                <h3 className="text-xs font-bold text-gray-800 mb-5 uppercase tracking-widest">Linked Accounts</h3>
                <div className="space-y-3 mb-6">
                  {linkedSocials.map((social, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}></div>
                        <span className="text-[12px] text-gray-700 font-semibold">{social.name} Connected</span>
                      </div>
                      <button onClick={() => handleUnlink(social.name)} className="text-red-500 text-[10px] font-bold uppercase hover:underline">Unlink</button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-center gap-2 bg-[#125852] text-white py-3 rounded-md text-sm font-bold shadow-md hover:bg-[#0e443f]">
                    {isDropdownOpen ? '× Close Menu' : '+ Link New Account'}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full bg-white mt-2 border border-gray-200 rounded-lg shadow-xl z-[70] overflow-hidden">
                      {availableSocials.map((social) => (
                        <button key={social.name} onClick={() => handleLinkSocial(social)} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b last:border-none">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}></div>
                          {social.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountSettingsPage;