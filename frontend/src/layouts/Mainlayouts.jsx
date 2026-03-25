import { Outlet } from "react-router-dom";


function MainLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Outlet />
    </div>
  );
}