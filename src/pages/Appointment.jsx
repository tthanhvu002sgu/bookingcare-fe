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
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [slotTime, setSlotTime] = useState("");

  const token = localStorage.getItem("access_token");

  // Hàm lấy danh sách các slot và thông tin bác sĩ
  const getAvailableSlots = async () => {
    try {
      const doctorId = docId.replace("doc", "");

      const [responseSlot, responseDocInfo] = await Promise.all([
        fetch(`http://localhost:8083/schedules/doctor?id=${doctorId}`),
        fetch(`http://localhost:8083/user/${doctorId}`),
      ]);

      if (!responseSlot.ok || !responseDocInfo.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await responseSlot.json();
      const doctorData = await responseDocInfo.json();
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

  const groupedSlots = docSlots.reduce((acc, item) => {
    const date = item.working_date;
    if (!acc[date]) {
      acc[date] = { date, slots: [] };
    }
    acc[date].slots.push(item);
    return acc;
  }, {});

  const groupedSlotsArray = Object.values(groupedSlots);

  return (
    <div>
      {doctorInfo || docSlots.length > 0 ? (
        <div>
          {/* Hiển thị thông tin bác sĩ */}
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
                  {doctorInfo.clinic_Id.description}
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

          {/* Hiển thị lựa chọn thời gian khám */}
          <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 mb-4">
            <p className="mb-4">Booking Slot</p>
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
            {groupedSlotsArray.length > 0 &&
              groupedSlotsArray[slotIndex]?.slots.length > 0 && (
                <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 mb-8">
                  {groupedSlotsArray[slotIndex].slots.map((slot, idx) => (
                    <p
                      key={idx}
                      onClick={() => {
                        setSlotTime(slot.start_time);
                        setSelectedSlotIndex(idx);
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
            <Link
              onClick={async () => {
                const selectedSlot =
                  groupedSlotsArray[slotIndex]?.slots[selectedSlotIndex];
                if (selectedSlot) {
                  const selectedDate = new Date(selectedSlot.working_date);
                  const [hours, minutes] = selectedSlot.start_time
                    .split(":")
                    .map(Number);
                  selectedDate.setHours(hours, minutes, 0, 0);
            
                  const patientResponse = await fetch(
                    "http://localhost:8083/api/auth/profile",
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
            
                  const patientData = await patientResponse.json();
                  const appointmentTimestamp = selectedDate.getTime();
            
                  const appointmentData = {
                    doctor: { userId: doctorInfo.user_Id },
                    patient: { userId: patientData }, // Đảm bảo patientData có userId
                    startTime: selectedSlot.start_time,
                    appointmentDate: appointmentTimestamp,
                  };
                  console.log(selectedSlot);
            
                  console.log(appointmentData);
            
                  try {
                    const response1 = await fetch(
                      "http://localhost:8083/appointment/add",
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(appointmentData),
                      }
                    );
                  } catch (error) {
                    console.error("Error creating appointment:", error);
                  }
                  await editIsBooked(selectedSlot.schedule_Id);
                }
              }}
              {...(selectedSlotIndex !== null
                ? { to: `/my-appointment` }
                : { onClick: () => alert("Please select a slot") })}
              className="mt-8 block text-center text-white bg-primary rounded-full py-2 w-full sm:w-48"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="h-80 w-full flex justify-center items-center">
          <p className="text-gray-500 text-lg">Loading doctor information...</p>
        </div>
      )}
    </div>
  );
};

export default Appointment;
