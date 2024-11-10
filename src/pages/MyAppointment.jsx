import { useEffect,useState } from "react";
const MyAppointment = () => {
  const [appointment, setAppointment] = useState({});
  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("access_token"); // Sử dụng getItem để lấy giá trị từ localStorage
    if (token) {
      // Thực hiện yêu cầu API với token
      fetchAppointments(token);
    } else {
      console.log("No token found");
    }
  }, []);

  const fetchAppointments = async (token) => {
    const response = await fetch("http://localhost:8083/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header Authorization
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        // Kiểm tra xem phản hồi từ API có thành công không
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Kiểm tra nếu phản hồi có nội dung JSON hợp lệ
        return response.text(); // Chúng ta sẽ dùng text() để kiểm tra có dữ liệu không
      })
      .then((responseText) => {
        // Kiểm tra xem có dữ liệu JSON không
        if (!responseText) {
          throw new Error("No data returned from API.");
        }
        
        // Nếu có dữ liệu, chúng ta sẽ phân tích JSON
        const userIdValue = JSON.parse(responseText); // Giả sử responseText là số hoặc chứa số.
        
        
        const appoint = fetch("http://localhost:8083/appointment/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header Authorization
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify({ userId : userIdValue }), // Gửi ID của người dùng trong body yêu cầu
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to fetch appointments. Status: ${response.status}`
              );
            }
            return response.json(); // Chuyển đổi dữ liệu trả về thành JSON
          })
          .then((appointments) => {
            // Sửa lại tên biến từ userId thành appointments
            console.log("Lịch hẹn của người dùng:", appointments);
            setAppointment(appointments);
          })
          .catch((error) => {
            console.error("Lỗi khi gửi yêu cầu:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
      });
      
  };


  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointment
      </p>
      <div>
        {appointment && Array.isArray(appointment) && appointment.length > 0 ? (
          appointment.map((item, index) => {
            // Convert timestamp to readable date format
            const appointmentDate = new Date(item.appointment_Date);
            const formattedDate = `${appointmentDate.getDate()}/${appointmentDate.getMonth() + 1}/${appointmentDate.getFullYear()}`;
  
            // Convert start_time to readable format
            const formattedStartTime = () => {
              if (item.start_time) {
                const [hours, minutes] = item.start_time.split(':');
                const date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
                const hour = date.getHours() % 12 || 12; // Chuyển giờ 24h thành 12h
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
                  <p className="">{item.doctor.specialization.description || 'Unknown Speciality'}</p>
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
                  <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-200">
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
    </div>
  );
  
  
  
};

export default MyAppointment;
