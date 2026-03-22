import React, { useState } from "react";
import Sidebar from "../components/Vendormanagement/Sidebar";
import Navbar from "../components/Vendormanagement/Navbar";
import ServiceForm from "../components/Vendormanagement/ServiceForm";

import { Plus, Search, Filter, Briefcase, X } from 'lucide-react';

const ServiceManagement = () => {
  //State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* 3. Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Content */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your professional offerings, schedules, and service availability.</p>
              </div>
              {/* 4. Link the button to open the modal */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all active:scale-95 font-medium"
              >
                <Plus size={20} /> Create New Service
              </button>
            </div>

            {/* Content Placeholder */}
            <div className="bg-white border border-gray-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-teal-600">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Services Yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">
                Get started by listing your first service, such as a hotel room or flight route.
              </p>
            </div>
          </div>
        </main>
      </div>
      {/* 5. THE MODAL LOGIC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* The Form with Conditional Logic */}
            <div className="p-2">
               <ServiceForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;