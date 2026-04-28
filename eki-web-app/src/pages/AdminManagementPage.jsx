import React, { useState, useEffect } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Vendormanagement/VendorFooter";
import api from "../services/api";

function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "operations",
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get("/accounts/admin/users/", {
        params: { role: "admin" },
      });
      let users = response.data?.data || response.data;
      if (users?.results) users = users.results;
      setAdmins(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
      setErrorMessage("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current admin profile to check if super admin
  const fetchCurrentAdmin = async () => {
    try {
      // Try to get current user info from token or a simple endpoint
      // If you have a /me or /profile endpoint, use that instead
      const response = await api.get("/accounts/admin/profile/");
      setCurrentAdmin(response.data?.data || response.data);
    } catch (err) {
      console.error("Failed to fetch current admin:", err);
      // If you can't fetch, check localStorage for role
      const userRole =
        localStorage.getItem("userRole") || localStorage.getItem("user_role");
      if (userRole?.toLowerCase() === "superadmin") {
        setCurrentAdmin({ is_superuser: true });
      }
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchCurrentAdmin();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim())
      errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!editingAdmin) {
      if (!formData.password) errors.password = "Password is required";
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Passwords do not match";
      }
      if (formData.password && formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingAdmin) {
        await api.patch(`/accounts/admin/admins/${editingAdmin.id}/update/`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          department: formData.department,
        });
        setSuccessMessage("Admin updated successfully");
      } else {
        await api.post("/accounts/admin/admins/create/", {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          confirm_password: formData.confirm_password,
          role: "admin",
        });
        setSuccessMessage("Admin created successfully");
      }

      resetForm();
      setShowModal(false);
      fetchAdmins();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save admin:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to save admin user",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (admin) => {
    if (!admin || !admin.id) {
      setErrorMessage("Admin user not found.");
      return;
    }

    setEditingAdmin(admin);
    setFormData({
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      email: admin.email || "",
      phone_number: admin.phone_number || "",
      department: admin.department || "operations",
      password: "",
      confirm_password: "",
    });
    setShowModal(true);
  };

  const handleDeactivate = async (adminId) => {
    if (adminId === currentAdmin?.id) {
      setErrorMessage("You cannot deactivate your own account.");
      return;
    }

    const admin = admins.find((a) => a.id === adminId);
    if (!admin.is_active) {
      setErrorMessage("This admin is already deactivated.");
      return;
    }

    if (
      !window.confirm(
        `Deactivate ${admin.first_name} ${admin.last_name}? They won't be able to log in.`,
      )
    )
      return;

    setActionLoading(adminId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.delete(`/accounts/admin/admins/${adminId}/delete/`, {
        data: { permanent: false },
      });
      setSuccessMessage(
        `${admin.first_name} ${admin.last_name} has been deactivated`,
      );
      await fetchAdmins();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to deactivate admin:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to deactivate admin",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (adminId) => {
    const admin = admins.find((a) => a.id === adminId);

    if (
      !window.confirm(
        `Reactivate ${admin.first_name} ${admin.last_name}? They will be able to log in again.`,
      )
    )
      return;

    setActionLoading(adminId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.patch(`/accounts/admin/admins/${adminId}/update/`, {
        is_active: true,
      });
      setSuccessMessage(
        `${admin.first_name} ${admin.last_name} has been reactivated`,
      );
      await fetchAdmins();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to reactivate admin:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to reactivate admin",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (adminId) => {
    if (adminId === currentAdmin?.id) {
      setErrorMessage("You cannot delete your own account.");
      return;
    }

    const admin = admins.find((a) => a.id === adminId);

    if (
      !window.confirm(
        `PERMANENTLY DELETE ${admin.first_name} ${admin.last_name}?\n\nThis action CANNOT be undone.`,
      )
    )
      return;

    setActionLoading(adminId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.delete(`/accounts/admin/admins/${adminId}/delete/`, {
        data: { permanent: true },
      });
      setSuccessMessage(
        `${admin.first_name} ${admin.last_name} has been permanently deleted`,
      );
      await fetchAdmins();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete admin:", err);
      if (err.response?.status === 404) {
        setErrorMessage(
          "Admin user not found. It may have already been deleted.",
        );
        await fetchAdmins();
      } else {
        setErrorMessage(
          err.response?.data?.message || "Failed to delete admin",
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      department: "operations",
      password: "",
      confirm_password: "",
    });
    setEditingAdmin(null);
    setFormErrors({});
  };

  const isSuperAdmin = currentAdmin?.is_superuser === true;

  if (!isSuperAdmin) {
    return (
      <div className="flex h-screen bg-[#ecece7]">
        <Sidebar
          mobileOpen={sidebarMobileOpen}
          onClose={() => setSidebarMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Navbar3 onMenuClick={() => setSidebarMobileOpen(true)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Access Denied
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Only Super Admins can manage other admin users.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#ecece7]">
      <Sidebar
        mobileOpen={sidebarMobileOpen}
        onClose={() => setSidebarMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar3 onMenuClick={() => setSidebarMobileOpen(true)} />

        <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-bold text-[#1A1A1A] mb-1">
                  Admin Management
                </h1>
                <p className="text-sm text-slate-500">
                  Create and manage administrator accounts
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-[#EFB034] text-white text-sm font-medium rounded-lg hover:bg-[#d4992a] transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Admin
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Phone
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Department
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600">
                        Joined
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          Loading admins...
                        </td>
                      </tr>
                    ) : admins.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No admin users found
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr
                          key={admin.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-emerald-600">
                                  {admin.first_name?.[0]}
                                  {admin.last_name?.[0]}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-slate-800">
                                {admin.first_name} {admin.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {admin.phone_number || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                              {admin.department || "Operations"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${admin.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {admin.is_active ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {new Date(admin.date_joined).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(admin)}
                                disabled={actionLoading === admin.id}
                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                title="Edit Admin"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>

                              {admin.is_active ? (
                                <button
                                  onClick={() => handleDeactivate(admin.id)}
                                  disabled={
                                    actionLoading === admin.id ||
                                    admin.id === currentAdmin?.id
                                  }
                                  className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                                  title="Deactivate Admin"
                                >
                                  {actionLoading === admin.id ? (
                                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                      />
                                    </svg>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivate(admin.id)}
                                  disabled={actionLoading === admin.id}
                                  className="p-1.5 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                  title="Reactivate Admin"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                              )}

                              <button
                                onClick={() => handlePermanentDelete(admin.id)}
                                disabled={actionLoading === admin.id}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Permanently Delete Admin"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingAdmin ? "Edit Admin" : "Add New Admin"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852] ${formErrors.first_name ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.first_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852] ${formErrors.last_name ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.last_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingAdmin}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852] ${formErrors.email ? "border-red-500" : "border-slate-200"} ${editingAdmin ? "bg-slate-50 text-slate-500" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                >
                  <option value="operations">Operations</option>
                  <option value="compliance">Compliance & Verification</option>
                  <option value="support">Customer Support</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {!editingAdmin && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852] ${formErrors.password ? "border-red-500" : "border-slate-200"}`}
                    />
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirm_password: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852] ${formErrors.confirm_password ? "border-red-500" : "border-slate-200"}`}
                    />
                    {formErrors.confirm_password && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.confirm_password}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#EFB034] hover:bg-[#d4992a] disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingAdmin
                      ? "Update Admin"
                      : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagementPage;
