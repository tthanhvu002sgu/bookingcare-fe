import { useEffect, useState } from "react";

const MyAppointment = () => {
  const [appointment, setAppointment] = useState([]); // Đảm bảo kiểu dữ liệu là một mảng
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // State để hiển thị thông báo thành công

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchAppointments(token);
    } else {
      console.log("No token found");
    }
  }, []);

  const fetchAppointments = async (token) => {
    try {
      const response = await fetch("http://localhost:8083/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("No data returned from API.");
      }

      const userIdValue = JSON.parse(responseText);
      console.log("User ID:", userIdValue);

      const appointResponse = await fetch("http://localhost:8083/appointment/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userIdValue }),
      });

      if (!appointResponse.ok) {
        throw new Error(`Failed to fetch appointments. Status: ${appointResponse.status}`);
      }

      const appointments = await appointResponse.json();
      console.log("Appointments:", appointments);
      setAppointment(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !selectedAppointmentId) return;

    try {
      const response = await fetch(
        `http://localhost:8083/appointment/editIsStatus/${selectedAppointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel appointment. Status: ${response.status}`);
      }

      // Cập nhật lại danh sách sau khi xóa thành công
      setAppointment((prevAppointments) =>
        prevAppointments.filter((item) => item.appointment_Id !== selectedAppointmentId)
      );

      // Hiển thị thông báo thành công
      setSuccessMessage("Appointment canceled successfully!");
      setShowModal(false);

      // Xóa thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My Appointment</p>
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-300 rounded">
          {successMessage}
        </div>
      )}
      <div>
        {appointment && Array.isArray(appointment) && appointment.length > 0 ? (
          appointment.map((item, index) => {
            const appointmentDate = new Date(item.appointment_Date);
            const formattedDate = `${appointmentDate.getDate()}/${appointmentDate.getMonth() + 1}/${appointmentDate.getFullYear()}`;

            const formattedStartTime = () => {
              if (item.start_time) {
                const [hours, minutes] = item.start_time.split(':');
                const date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
                const hour = date.getHours() % 12 || 12;
                return `${hour}:${minutes} ${ampm}`;
              }
              return 'N/A';
            };

            return (
              <div
                key={index}
                className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              >
                <div>
                  {item.doctor && item.doctor.image ? (
                    <img className="w-32 bg-indigo-50" src={`src/assets/${item.doctor.image}`} alt="" />
                  ) : (
                    <div className="w-32 bg-gray-200" /> // Placeholder if no image
                  )}
                </div>
                <div className="flex-1 text-sm text-zinc-600">
                  <p className="text-neutral-800 font-semibold">{item.doctor ? item.doctor.fullName : 'Unknown Doctor'}</p>
                  <p>{item.doctor.specialization.description || 'Unknown Speciality'}</p>
                  <p className="mt-1 font-medium text-neutral-700">Address:</p>
                  <p className="text-xs">{item.doctor ? item.doctor.address : 'No address available'}</p>
                  <p className="text-xs mt-1">
                    <span className="text-sm text-neutral-700 font-medium">
                      Date & Time:{" "}
                    </span>
                    {formattedDate || 'N/A'} | {formattedStartTime() || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-200">
                    Pay Online
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(item.appointment_Id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-200"
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No appointments available</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold mb-4">Are you sure you want to cancel this appointment?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={confirmCancel}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointment;
