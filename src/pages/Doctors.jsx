import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Doctors = () => {
  // Lấy chuyên khoa từ URL (dùng useParams để lấy tham số từ đường dẫn)
  const { speciality } = useParams();

  // State để lưu danh sách bác sĩ
  const [doctors, setDoctors] = useState([]);
  // State để lưu danh sách chuyên khoa
  const [specialities, setSpecialities] = useState([]);
  // State để lưu danh sách bác sĩ đã lọc theo chuyên khoa
  const [filterDoc, setFilterDoc] = useState([]);

  // Khai báo navigate để điều hướng người dùng tới các trang khác
  const navigate = useNavigate();

  // useEffect để lấy danh sách bác sĩ từ API khi component được render lần đầu hoặc speciality thay đổi
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Fetch danh sách bác sĩ từ API
        const response = await fetch("http://localhost:8083/user/doctorAll");
        const data = await response.json();
        setDoctors(data); // Lưu danh sách bác sĩ vào state
        console.log(data);
        // Áp dụng bộ lọc bác sĩ theo chuyên khoa từ URL nếu có
        if (speciality) {
          setFilterDoc(data.filter((doctor) => doctor.specialization.name === speciality)); // Lọc bác sĩ theo chuyên khoa
        } else {
          setFilterDoc(data); // Nếu không có chuyên khoa thì hiển thị tất cả bác sĩ
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bác sĩ:", error);
      }
    };
    fetchDoctors(); // Gọi hàm fetchDoctors khi component được render lần đầu
  }, [speciality]); // useEffect sẽ chạy lại khi speciality thay đổi

  // useEffect để lấy danh sách chuyên khoa từ API
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        // Fetch danh sách chuyên khoa từ API
        const response = await fetch("http://localhost:8083/specialization");
        const data = await response.json();
        setSpecialities(data); // Lưu danh sách chuyên khoa vào state
        
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu chuyên khoa:", error);
      }
    };
    fetchSpecialities(); // Gọi hàm fetchSpecialities khi component được render lần đầu
  }, []); // useEffect này chỉ chạy 1 lần khi component được render lần đầu

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors by speciality.</p>
      <div className="flex flex-col items-start sm:flex-row gap-5 mt-5">
        {/* Hiển thị danh sách chuyên khoa lấy từ API */}
        <div className="w-[15%] flex flex-col gap-3 text-sm text-gray-600">
          <p
            onClick={() => navigate("/doctors")} // Điều hướng đến trang danh sách tất cả bác sĩ khi click vào nút "All Doctors"
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              !speciality ? "bg-blue-200" : "" // Nếu không có chuyên khoa trong URL, tô màu nền
            }`}
          >Tất cả bác sĩ</p>
          {specialities.map((spec) => (
            <p
              key={spec.specialization_Id} // Sử dụng _id của chuyên khoa làm key để tránh trùng lặp
              onClick={() =>
                navigate(`/doctors/${spec.name}`) // Điều hướng đến trang bác sĩ của chuyên khoa khi click vào chuyên khoa
              }
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
                speciality === spec.name ? "bg-blue-200" : "" // Nếu chuyên khoa hiện tại trùng với chuyên khoa trong URL, tô màu nền
              }`}
            >
              {spec.name} {/* Hiển thị tên chuyên khoa */}
            </p>
          ))}
        </div>
        
        {/* Hiển thị danh sách bác sĩ đã lọc */}
        <div className="w-[80%] grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.length > 0 ? (
            // Nếu có bác sĩ, lặp qua và hiển thị danh sách bác sĩ
            filterDoc.map((item, index) => (
              <div
                onClick={() => navigate(`/appointment/doc${item.user_Id}`)} // Điều hướng tới trang đặt lịch khám khi click vào bác sĩ
                className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                key={index}
              >
                {console.log(item)}
                <img
                  className="bg-blue-50 w-full h-45 object-cover"
                  src={`/src/assets/${item.image}`}
                  alt={item.name} // Hiển thị hình ảnh bác sĩ
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-center text-green-600">
                    <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                    <p>Available</p>
                  </div>
                  <p className="text-gray-900 text-lg font-medium">{item.fullName}</p>
                  <p className="text-gray-600 text-sm">{item.specialization.description}</p> {/* Hiển thị tên bác sĩ và chuyên khoa */}
                </div>
              </div>
            ))
          ) : (
            // Nếu không có bác sĩ nào, hiển thị thông báo
            <p className="text-gray-600 text-center">No doctors found for this speciality.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
