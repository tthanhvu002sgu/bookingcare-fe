import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [doctorInfo, setDoctorInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null); // Chỉ mục của slot đã chọn
  const [slotTime, setSlotTime] = useState("");

  const getAvailableSlots = async () => {
    try {
      const doctorId = docId.replace("doc", "");
      console.log("Doctor ID:", doctorId);

      const responseslot = await fetch(
        `http://localhost:8083/schedules/doctor?id=${doctorId}`
      );
      const responsedocInfo = await fetch(
        `http://localhost:8083/user/${doctorId}`
      );

      if (!responseslot.ok || !responsedocInfo.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await responseslot.json();
      const doctorData = await responsedocInfo.json();

      setDocSlots(data);
      setDoctorInfo(doctorData);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const editIsBooked = async (slotId) => {
    try {
      const response = await fetch(
        `http://localhost:8083/schedules/editIsBooked/${slotId}`,
        {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      console.log(`Successfully updated slot ${slotId} to booked.`);
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  useEffect(() => {
    getAvailableSlots();
  }, [docId]);

  // Nhóm khung giờ theo ngày
  const groupedSlots = docSlots.reduce((acc, item) => {
    const date = item.working_date;
    if (!acc[date]) {
      acc[date] = {
        date,
        slots: [],
      };
    }
    acc[date].slots.push(item);
    return acc;
  }, {});

  // Chuyển đổi object thành mảng
  const groupedSlotsArray = Object.values(groupedSlots);

  return (
    <div>
      {doctorInfo || docSlots.length > 0 ? (
        <div>
          {/* Thông tin bác sĩ */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <img
                className="bg-primary w-full sm:max-w-72 rounded-lg"
                src={`../src/assets/${doctorInfo.image}`}
                alt={doctorInfo.fullName}
              />
            </div>
            <div className="flex-1 border border-gray-400 rounded-lg py-8 p-8 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
              <p className="flex items-center gap-2 text-xl font-medium text-gray-900">
                {doctorInfo.fullName}
                <img
                  className="w-5"
                  src={assets.verified_icon}
                  alt="Verified"
                />
              </p>
              <div className="flex items-center gap-3 text-sm mt-1 text-gray-600">
                <p>
                  {doctorInfo.degree} - {doctorInfo.role.name}
                </p>
                <button className="py-0.5 px-2 border text-xs rounded-full">
                  {doctorInfo.experience} years of experience
                </button>
              </div>
              <div>
                <p className="flex items-center font-medium text-xs text-gray-900 mt-3 gap-1">
                  About <img src={assets.info_icon} alt="Info" />
                </p>
                <p className="text-sm text-gray-500 max-w-[700px] mt-3">
                  {doctorInfo.clinic.description}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Phone: {doctorInfo.phone}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {doctorInfo.email}
                </p>
              </div>
            </div>
          </div>

          <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 mb-4">
            <p className="mb-4">Booking Slot</p>
            {/* Chọn ngày */}
            {groupedSlotsArray.length > 0 && (
              <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
                {groupedSlotsArray.map((group, index) => (
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                      slotIndex === index
                        ? "bg-primary text-white"
                        : "border border-gray-200"
                    }`}
                    key={index}
                  >
                    <p>{daysOfWeek[new Date(group.date).getDay()]}</p>
                    <p>
                      {new Date(group.date).getDate()}/
                      {new Date(group.date).getMonth() + 1}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {/* Chọn giờ */}
            {groupedSlotsArray.length > 0 &&
              groupedSlotsArray[slotIndex]?.slots.length > 0 && (
                <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 mb-8">
                  {groupedSlotsArray[slotIndex].slots.map((slot, idx) => (
                    <p
                      key={idx}
                      onClick={() => {
                        setSlotTime(slot.start_time);
                        setSelectedSlotIndex(idx); // Gán chỉ mục slot đã chọn
                      }}
                      className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                        idx === selectedSlotIndex
                          ? "bg-primary text-white"
                          : "border border-gray-200 text-gray-400"
                      }`}
                    >
                      {slot.start_time}
                    </p>
                  ))}
                </div>
              )}
            {/* Nút đặt lịch */}
            <Link
              onClick={async () => {
                if (slotTime && selectedSlotIndex !== null) {
                  const selectedDate = groupedSlotsArray[slotIndex].date; // Lấy ngày đã chọn
                  const formattedDate = new Date(selectedDate); // Chuyển đổi thành đối tượng Date
                  const day = formattedDate.getDate();
                  const month = formattedDate.getMonth() + 1; // Tháng bắt đầu từ 0
                  const year = formattedDate.getFullYear();

                  // Định dạng chuỗi ngày và giờ
                  const dateTime = `${day}/${month}/${year} ${slotTime}`;
                  console.log(`Booked an appointment for time: ${dateTime}`);

                  // Gọi API để đánh dấu lịch là đã đặt
                   const selectedSlotId = groupedSlotsArray[slotIndex].slots[selectedSlotIndex].schedule_Id;
                  

                  
                  
                  await editIsBooked(selectedSlotId); // Gọi hàm API
                } else {
                  alert("Please select a time before booking.");
                }
              }}
              className="bg-primary text-white font-light px-14 py-3 text-sm rounded-full my-6 mt-4"
              to={slotTime ? `/my-appointment` : "#"}
            >
              Book an appointment
            </Link>
          </div>
        </div>
      ) : (
        <p>Loading doctor information and available slots...</p>
      )}
    </div>
  );
};

export default Appointment;
