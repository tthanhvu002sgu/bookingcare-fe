import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";




const TopDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Fetch danh sách bác sĩ từ API
        const response = await fetch("http://localhost:8083/user/doctor/experience");
        const data = await response.json();
        setDoctors(data); // Lưu danh sách bác sĩ vào state
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bác sĩ:", error);
      }
    };
    fetchDoctors(); // Gọi hàm fetchDoctors khi component được render lần đầu
  },[]); // useEffect này chỉ chạy 1 lần khi component được render lần đầu

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.map((doctor, index) => {
          return (
            <div
              onClick={() => navigate(`/appointment/doc${doctor.user_Id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              <img className="bg-blue-50" src={ `src/assets/${doctor.image}`} alt="" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-600">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{doctor.fullName}</p>
                <p className="text-gray-600 text-sm"> {doctor.specialization.description} </p>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick = {() => {navigate('/doctors'); scrollTo(0,0)}} className="bg-blue-50 text-gray-600 text-sm rounded-full px-12 py-3 mt-10 font-medium">
        More
      </button>
    </div>
  );
};

export default TopDoctors;
