import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SpecialityMenu = () => {
  // State để lưu danh sách chuyên khoa
  const [specialities, setSpecialities] = useState([]);
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center gap-4 py-16 text-gray-800" id="speciality">
      <h1 className="text-3xl font-medium">Find by Speciality</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors, schedule
        your appointment hassle-free here
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialities.map((spec) => (
          <div
            key={spec.specialization_Id}
            onClick={() => navigate(`/doctors/${spec.name}`)} // Điều hướng đến trang bác sĩ của chuyên khoa khi click vào chuyên khoa
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
          >
            <img className="w-16 sm:w-24 mb-2" src={`src/assets/${spec.image}`} alt={spec.name} />
            <p>{spec.description}</p> {/* Hiển thị mô tả chuyên khoa */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
