// File: src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded shadow p-6 hover:bg-gray-100"
        >
          Manage Users
        </Link>
        <Link
          to="/admin/restaurants"
          className="bg-white rounded shadow p-6 hover:bg-gray-100"
        >
          Manage Restaurants
        </Link>
        <Link
          to="/admin/riders"
          className="bg-white rounded shadow p-6 hover:bg-gray-100"
        >
          Manage Riders
        </Link>
        <Link
          to="/admin/map"
          className="bg-white rounded shadow p-6 hover:bg-gray-100"
        >
          View Map
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
