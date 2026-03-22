import React from 'react';
import { Outlet } from 'react-router-dom';
import BankerDashboard from '../features/BankerView/BankerDashboard';

export default function BankerApp() {
  return (
    <div className="h-screen">
      <BankerDashboard />
      <Outlet />
    </div>
  );
}
