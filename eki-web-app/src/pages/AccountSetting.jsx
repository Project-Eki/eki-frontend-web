import React, { useState, useRef } from 'react';
import logoImage from '../assets/logo.jpeg';

function AccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName: 'Pena',
    lastName: 'Eleanor',
    email: 'eleanor.pena@example.com',
    phone: '+1 (555) 123-4567',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
  });

  const fileInputRef = useRef(null);

  const handleEditPhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserData({ ...userData, profileImage: imageUrl });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-800">
      
    
      <nav className="w-full bg-white border-b border-gray-100 px-8 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <img src={logoImage} alt="Eki" className="h-10 w-auto" />
          
        
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-64 bg-white border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-black transition-colors">Home</a>
            <a href="#" className="hover:text-black transition-colors">Products</a>
            <a href="#" className="hover:text-black transition-colors">Services</a>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="text-gray-700 hover:text-[#125852]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <div className="relative">
              <img src={userData.profileImage} alt="User" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
      
        <aside className="w-64 border-r border-gray-100 py-6 px-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 bg-[#125852] text-white px-4 py-2.5 rounded-md text-sm font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              Account Settings
            </button>
            <button className="w-full flex items-center gap-3 text-gray-500 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Privacy Settings
            </button>
          </div>
          
          <button className="flex items-center gap-3 text-red-500 text-sm font-semibold px-4 py-2 hover:bg-red-50 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6-10V7a3 3 0 00-6 0v1" /></svg>
            Log Out
          </button>
        </aside>

       
        <main className="flex-1 bg-white p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Account Settings</h1>
            
            <div className="grid grid-cols-12 gap-8 items-start">
              
             
              <div className="col-span-12 md:col-span-6 space-y-6">
                
             
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center">
                  <div className="relative inline-block mb-2">
                    <img src={userData.profileImage} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-gray-50 shadow-sm" alt="profile" />
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <button onClick={handleEditPhotoClick} className="absolute bottom-0 right-0 bg-white border border-gray-200 p-1.5 rounded-full text-gray-400 hover:text-gray-600 shadow-sm transition-transform hover:scale-110">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-xs text-gray-400 font-medium">{userData.email}</p>
                </div>

              
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Account Details</h3>
                  <form className="space-y-5">
                    <div className="flex gap-4">
                   
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-600">First Name</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </span>
                          <input type="text" defaultValue={userData.firstName} className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
                        </div>
                      </div>
                    
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-600">Last Name</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </span>
                          <input type="text" defaultValue={userData.lastName} className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
                        </div>
                      </div>
                    </div>

                 
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        <input type="email" defaultValue={userData.email} className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
                      </div>
                    </div>

                 
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </span>
                        <input type="text" defaultValue={userData.phone} className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
                      </div>
                    </div>

                   
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" className="px-8 py-2.5 text-sm font-bold bg-[#E5E7EB] text-gray-700 rounded-xl hover:bg-gray-300 shadow-sm transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-8 py-2.5 text-sm font-bold bg-[#F1B434] text-white rounded-xl shadow-md hover:bg-[#d9a22e] transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>

        
              <div className="col-span-12 md:col-span-6 space-y-6">
                
              
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest">Your Role</h3>
                  <div className="border border-[#125852] border-opacity-20 rounded-lg p-4 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-md shadow-sm border border-gray-100">
                        <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Vendor</h4>
                        <p className="text-[10px] text-gray-400 font-medium">List products, manage inventory, and process payouts.</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#125852]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                </div>

              
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-widest">Identity Verification</h3>
                  <div className="bg-[#f0f9f9] border border-[#125852] border-opacity-10 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Verified</h4>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">Your account identity is fully secured.</p>
                      </div>
                    </div>
                  </div>
                </div>

              
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 min-h-[160px] flex flex-col justify-between">
                   <div>
                     <h3 className="text-xs font-bold text-gray-800 mb-5 uppercase tracking-widest">Linked Accounts</h3>
                     <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg">
                       <div className="flex items-center gap-3">
                         <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                         <span className="text-[12px] text-gray-700 font-semibold">Facebook (eleanor.pena)</span>
                       </div>
                       <button className="text-red-500 text-[10px] font-bold uppercase hover:underline">Unlink</button>
                     </div>
                   </div>
                   <button className="w-full flex items-center justify-center gap-2 bg-[#125852] text-white py-3 mt-6 rounded-md text-sm font-bold shadow-md hover:bg-[#0d423e] transition-all">
                     <span className="text-xl leading-none">+</span> Link New Account
                   </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

     
      <footer className="w-full font-sans shrink-0 border-t border-gray-100 bg-[#234E4D]">
        <div className="w-full text-white py-3 px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-wide">
            <div className="flex-shrink-0 font-bold italic opacity-90">Buy Smart. Sell Fast. Grow Together...</div>
            
            <div className="flex items-center gap-1 text-center">
              <span>© 2026 Vendor Portal. All rights reserved.</span>
              <span className="ml-2 font-bold uppercase">
                eki<span className="text-[5px] align-bottom font-normal ml-0.5">TM</span>
              </span>
            </div>

            <div className="flex items-center gap-6 font-medium">
              <a href="#" className="hover:opacity-70 transition-opacity">Support</a>
              <a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
              <span className="font-bold border-l border-white/20 pl-6 ml-2">Ijoema ltd</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AccountSettingsPage;