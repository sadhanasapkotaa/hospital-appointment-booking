"use client";
import React, { useState } from "react";
import { FiUsers, FiUserPlus, FiEdit3, FiTrash2, FiLogOut, FiSearch, FiFilter, FiEye, FiX } from "react-icons/fi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("patients");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  // Sample data - in real app, this would come from an API
  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe", email: "john@email.com", phone: "+1234567890", age: 35, gender: "Male", address: "123 Main St" },
    { id: 2, name: "Jane Smith", email: "jane@email.com", phone: "+1234567891", age: 28, gender: "Female", address: "456 Oak Ave" },
  ]);

  const [receptionists, setReceptionists] = useState([
    { id: 1, name: "Mary Wilson", email: "mary@hospital.com", phone: "+1234567892", department: "Front Desk", shift: "Morning" },
    { id: 2, name: "Lisa Johnson", email: "lisa@hospital.com", phone: "+1234567893", department: "Appointments", shift: "Evening" },
  ]);

  const [doctors, setDoctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah@hospital.com", phone: "+1234567894", specialty: "Cardiology", experience: "10 years" },
    { id: 2, name: "Dr. Michael Chen", email: "michael@hospital.com", phone: "+1234567895", specialty: "Dermatology", experience: "8 years" },
  ]);

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (type === "add") {
      // Initialize empty form data based on tab
      if (activeTab === "patients") {
        setFormData({ name: '', email: '', phone: '', age: '', gender: '', address: '' });
      } else if (activeTab === "receptionists") {
        setFormData({ name: '', email: '', phone: '', department: '', shift: '' });
      } else if (activeTab === "doctors") {
        setFormData({ name: '', email: '', phone: '', specialty: '', experience: '' });
      }
    } else if (type === "edit" && user) {
      setFormData({ ...user });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === "add") {
      // Generate new ID
      const newId = Math.max(...getCurrentUsers().map(u => u.id)) + 1;
      const newUser = { id: newId, ...formData };
      
      // Add to appropriate list
      if (activeTab === "patients") {
        setPatients(prev => [...prev, newUser]);
      } else if (activeTab === "receptionists") {
        setReceptionists(prev => [...prev, newUser]);
      } else if (activeTab === "doctors") {
        setDoctors(prev => [...prev, newUser]);
      }
    } else if (modalType === "edit") {
      // Update existing user
      if (activeTab === "patients") {
        setPatients(prev => prev.map(p => p.id === selectedUser.id ? { ...p, ...formData } : p));
      } else if (activeTab === "receptionists") {
        setReceptionists(prev => prev.map(r => r.id === selectedUser.id ? { ...r, ...formData } : r));
      } else if (activeTab === "doctors") {
        setDoctors(prev => prev.map(d => d.id === selectedUser.id ? { ...d, ...formData } : d));
      }
    }
    
    closeModal();
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (activeTab === "patients") {
        setPatients(prev => prev.filter(p => p.id !== userId));
      } else if (activeTab === "receptionists") {
        setReceptionists(prev => prev.filter(r => r.id !== userId));
      } else if (activeTab === "doctors") {
        setDoctors(prev => prev.filter(d => d.id !== userId));
      }
    }
  };

  const getCurrentUsers = () => {
    if (activeTab === "patients") return patients;
    if (activeTab === "receptionists") return receptionists;
    if (activeTab === "doctors") return doctors;
    return [];
  };

  const renderUserTable = (users, userType) => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              {userType === "patients" ? "Age" : userType === "receptionists" ? "Department" : "Specialty"}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                  {userType === "patients" ? user.age : userType === "receptionists" ? user.department : user.specialty}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => openModal("view", user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <FiEye size={16} />
                  </button>
                  <button 
                    onClick={() => openModal("edit", user)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Edit User"
                  >
                    <FiEdit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete User"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {modalType === "add" ? `Add New ${activeTab.slice(0, -1)}` : 
               modalType === "edit" ? `Edit ${activeTab.slice(0, -1)}` : 
               `${activeTab.slice(0, -1)} Details`}
            </h3>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-6">
            {modalType === "view" && selectedUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
                
                {activeTab === "patients" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <p className="text-gray-900">{selectedUser.age}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-gray-900">{selectedUser.gender}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{selectedUser.address}</p>
                    </div>
                  </>
                )}
                
                {activeTab === "receptionists" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <p className="text-gray-900">{selectedUser.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                      <p className="text-gray-900">{selectedUser.shift}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === "doctors" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                      <p className="text-gray-900">{selectedUser.specialty}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <p className="text-gray-900">{selectedUser.experience}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                {/* Patient-specific fields */}
                {activeTab === "patients" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Age"
                          min="1"
                          max="120"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full address"
                        rows={3}
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Receptionist-specific fields */}
                {activeTab === "receptionists" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Front Desk">Front Desk</option>
                        <option value="Appointments">Appointments</option>
                        <option value="Billing">Billing</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Medical Records">Medical Records</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift *
                      </label>
                      <select
                        name="shift"
                        value={formData.shift || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Shift</option>
                        <option value="Morning">Morning (7 AM - 3 PM)</option>
                        <option value="Evening">Evening (3 PM - 11 PM)</option>
                        <option value="Night">Night (11 PM - 7 AM)</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* Doctor-specific fields */}
                {activeTab === "doctors" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty *
                      </label>
                      <select
                        name="specialty"
                        value={formData.specialty || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Specialty</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Gynecology">Gynecology</option>
                        <option value="Psychiatry">Psychiatry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience *
                      </label>
                      <select
                        name="experience"
                        value={formData.experience || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Experience</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="6-10 years">6-10 years</option>
                        <option value="11-15 years">11-15 years</option>
                        <option value="16-20 years">16-20 years</option>
                        <option value="20+ years">20+ years</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {modalType === "add" ? "Add" : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* View Mode Actions */}
          {modalType === "view" && (
            <div className="px-6 pb-6">
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => openModal("edit", selectedUser)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">❤</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HealthPal</span>
              <div className="text-xs text-gray-500">Admin Portal</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Welcome back</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <FiLogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage hospital staff and patients with ease</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <FiUsers className="mr-2" size={24} />
                  <span className="text-sm font-medium opacity-90">Total Patients</span>
                </div>
                <p className="text-3xl font-bold">{patients.length}</p>
                <p className="text-xs opacity-75 mt-1">Active patients in system</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FiUsers size={32} className="opacity-80" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <FiUsers className="mr-2" size={24} />
                  <span className="text-sm font-medium opacity-90">Receptionists</span>
                </div>
                <p className="text-3xl font-bold">{receptionists.length}</p>
                <p className="text-xs opacity-75 mt-1">Front desk staff</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FiUsers size={32} className="opacity-80" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <FiUsers className="mr-2" size={24} />
                  <span className="text-sm font-medium opacity-90">Doctors</span>
                </div>
                <p className="text-3xl font-bold">{doctors.length}</p>
                <p className="text-xs opacity-75 mt-1">Medical specialists</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FiUsers size={32} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-1">
            <div className="flex space-x-1">
              {["patients", "receptionists", "doctors"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 rounded-xl transition-all duration-300 capitalize font-medium ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">Manage {activeTab}</h2>
                <p className="text-gray-600 mt-1">View, add, edit, and manage all {activeTab}</p>
              </div>
              <button
                onClick={() => openModal("add")}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <FiUserPlus size={18} />
                <span>Add {activeTab.slice(0, -1)}</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0 mb-8">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-400" size={16} />
                  <select className="bg-gray-50 px-4 py-3 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {activeTab === "patients" && renderUserTable(patients, "patients")}
              {activeTab === "receptionists" && renderUserTable(receptionists, "receptionists")}
              {activeTab === "doctors" && renderUserTable(doctors, "doctors")}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
