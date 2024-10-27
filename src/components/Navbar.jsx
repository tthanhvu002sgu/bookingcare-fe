import { NavLink, useNavigate } from "react-router-dom";
import "../index.css";
import { assets } from "../assets/assets";
import axios from "../api/axios";


const Navbar = () => {
  const navigate = useNavigate();

  const accessToken = localStorage.getItem('access_token');

  const handleLogout = async () => {
    try {
 
      const response = await axios.post('/api/auth/logout'); 

      if (response.status === 200) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userData');
        navigate('/login');
      } else {
        console.error('Logout failed:', response.data);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        src={assets.logo}
        alt="logo"
        className="w-44 cursor-pointer h-14 object-contain"
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">HOME</li>
          <hr className="border-none hidden outline-none h-0.5 bg-primary w-3/5 m-auto" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL DOCTORS</li>
          <hr className="border-none hidden outline-none h-0.5 bg-primary w-3/5 m-auto" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
          <hr className="border-none hidden outline-none h-0.5 bg-primary w-3/5 m-auto" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
          <hr className="border-none hidden outline-none h-0.5 bg-primary w-3/5 m-auto" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-4">
        {accessToken  ? (
          <div className="flex items-center gap-2 group relative">
            <img
              src={assets.profile_pic}
              className="w-6 rounded-full cursor-pointer"
              alt=""
            />
            <img
              src={assets.dropdown_icon}
              className="w-3 cursor-pointer"
              alt=""
            />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-200 rounded flex flex-col gap-4 p-4">
                <p onClick={() => navigate("/my-profile")} className="hover:text-black cursor-pointer">My Profile</p>
                <p onClick={() => navigate("/my-appointment")} className="hover:text-black cursor-pointer">My Appointment</p>
                <p onClick={() => handleLogout()} className="hover:text-black cursor-pointer">Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block "
          >
            Create Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
