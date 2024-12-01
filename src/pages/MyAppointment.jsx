import { useEffect, useState, useCallback } from "react";

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1); // Lưu trữ trang hiện tại (mặc định là trang 1)
  const [pageSize] = useState(3); // Lưu số lượng bản ghi hiển thị trên mỗi trang (mặc định là 5)
  const [totalPages, setTotalPages] = useState(0); // Lưu tổng số trang (mặc định là 0)

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchAppointments(token);
    } else {
      console.log("No token found");
    }
  }, [page]);

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
      
      const skip = (page - 1) * pageSize; // Tính số bản ghi cần bỏ qua dựa trên trang hiện tại và số bản ghi mỗi trang
      const appointmentResponse = await fetch(
        `http://localhost:8083/appointment/?page=${skip}&size=${pageSize}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userIdValue }),
        }
      ); // Gửi yêu cầu tới API để lấy dữ liệu với các tham số `skip` và `pageSize`

      const data = await appointmentResponse.json();
      if (response.status === 200) {
        const countAppointments = await fetch(
          `http://localhost:8083/appointment/count`,{
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userIdValue }),
          });
        const dataCount = await countAppointments.json();
        
        // Nếu phản hồi từ API thành công (status code 200)
        
        setAppointments(data); // Cập nhật danh sách lịch hẹn
        setTotalPages(Math.ceil(dataCount / pageSize));
        
      } else {
        toast.error(data.message); // Hiển thị thông báo lỗi nếu có
      }
    
    
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
        throw new Error(
          `Failed to cancel appointment. Status: ${response.status}`
        );
      }

      // Cập nhật state để xóa cuộc hẹn đã hủy
      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (item) => item.appointment_Id !== selectedAppointmentId
        )
      );

      // Lưu trạng thái đã hủy vào localStorage để duy trì trạng thái sau reload
      const updatedAppointments = appointments.filter(
        (item) => item.appointment_Id !== selectedAppointmentId
      );
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));

      setSuccessMessage("Appointment canceled successfully!");
      setShowModal(false);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setError("Error canceling appointment.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const confirmPayment = async (appointmentId) => {
    localStorage.setItem("selectedAppointmentId", appointmentId);
    setSelectedAppointmentId(appointmentId);

    const token = localStorage.getItem("access_token");
    if (!token || !appointmentId) return;

    try {
      const response = await fetch(
        `http://localhost:8083/paymentvnpay/vnpay/${appointmentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to initiate payment. Status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.status === "00" && result.url) {
        window.location.href = result.url;
      } else {
        setError("Failed to get payment URL.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Error initiating payment.");
    }

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchAppointments(token);
    } else {
      console.log("No token found");
    }

    const storedAppointmentId = localStorage.getItem("selectedAppointmentId");

    const urlParams = new URLSearchParams(window.location.search);
    const vnpResponseCode = urlParams.get("vnp_ResponseCode");
    const vnpTxnRef = urlParams.get("vnp_TxnRef");

    if (vnpResponseCode && vnpTxnRef && storedAppointmentId) {
      paymentCallback(storedAppointmentId);
    }
  }, []);

  const paymentCallback = async (appointmentId) => {
    const token = localStorage.getItem("access_token");
    if (!token || !appointmentId) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const vnpResponseCode = urlParams.get("vnp_ResponseCode");
      const vnpTxnRef = urlParams.get("vnp_TxnRef");

      if (vnpResponseCode === "00" && vnpTxnRef) {
        const response = await fetch(
          `http://localhost:8083/paymentvnpay/callback/${appointmentId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to process payment. Status: ${response.status}`
          );
        }
        setSuccessMessage("Payment processed successfully!");
        // Thông báo thành công
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Error processing payment.");
    }

    // Reset thông báo sau 3 giây
    setTimeout(() => {
      setSuccessMessage("");
      setError("");
    }, 3000);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      // Nếu ô tìm kiếm trống, hiển thị tất cả cuộc hẹn đã lưu
      setAppointments(appointments);
      
    } else {
      const filtered = appointments.filter(
        // Lọc danh sách cuộc hẹn dựa trên điều kiện
        (item) =>
          item.doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setAppointments(filtered); // Cập nhật danh sách đã lọc vào state
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage); 
    }
  };

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointment
      </p>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by patient or doctor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
      {successMessage && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-300 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}
      <div>
        {appointments &&
        Array.isArray(appointments) &&
        appointments.length > 0 ? (
          appointments.map((item, index) => {
            const appointmentDate = new Date(item.appointment_Date);
            const formattedDate = `${appointmentDate.getDate()}/${
              appointmentDate.getMonth() + 1
            }/${appointmentDate.getFullYear()}`;

            const formattedStartTime = () => {
              if (item.start_time) {
                const [hours, minutes] = item.start_time.split(":");
                const date = new Date();
                date.setHours(hours);
                date.setMinutes(minutes);
                const ampm = date.getHours() >= 12 ? "PM" : "AM";
                const hour = date.getHours() % 12 || 12;
                return `${hour}:${minutes} ${ampm}`;
              }
              return "N/A";
            };

            const isCanceled = 
            item.status && 
            item.status.name === "Canceled" || 
            item.payment && 
            item.payment.payment_method === "ONLINE";
        

            return (
              <div
                key={index}
                className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              >
                <div>
                  {item.doctor && item.doctor.image ? (
                    <img
                      className="w-32 bg-indigo-50"
                      src={`src/assets/${item.doctor.image}`}
                      alt=""
                    />
                  ) : (
                    <div className="w-32 bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 text-sm text-zinc-600">
                  <p className="text-neutral-800 font-semibold text-lg">
                    {item.doctor ? item.doctor.fullName : "Unknown Doctor"}
                  </p>
                  <p className="text-neutral-600 italic">
                    {item.doctor.specialization.description ||
                      "Unknown Specialty"}
                  </p>

                  <div className="mt-2">
                    <p className="font-medium text-neutral-700">
                      <span className="text-neutral-900">Status: </span>
                      {item.status ? item.status.name : "No status available"}
                    </p>
                    <p className="font-medium text-neutral-700">
                      <span className="text-neutral-900">Price: </span>
                      {item.doctor
                        ? item.doctor.booking_Fee
                        : "Price unavailable"}
                    </p>
                    <p className="font-medium text-neutral-700">
                      <span className="text-neutral-900">Pay: </span>
                      {item.payment
                        ? item.payment.payment_Date !== "NULL"
                          ? `Paid - ${item.payment.payment_method}`
                          : `Unpaid - CASH`
                        : `Unpaid - CASH`}
                    </p>
                  </div>

                  <p className="text-xs mt-4 text-neutral-600">
                    <span className="text-sm text-neutral-800 font-medium">
                      Date & Time:{" "}
                    </span>
                    {formattedDate || "N/A"} | {formattedStartTime() || "N/A"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => confirmPayment(item.appointment_Id)}
                    className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-200 ${
                      isCanceled ? "bg-gray-300 cursor-not-allowed" : ""
                    }`}
                    disabled={isCanceled}
                  >
                    Pay Online
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(item.appointment_Id)}
                    className={`text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-200 ${
                      isCanceled ? "bg-gray-300 cursor-not-allowed" : ""
                    }`}
                    disabled={isCanceled}
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
      
      <div className="flex justify-center items-center gap-4 mt-4">
        {/* Nút chuyển về trang trước */}
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === 1} // Vô hiệu hóa nút nếu đang ở trang đầu tiên
          onClick={() => handlePageChange(page - 1)} // Giảm số trang hiện tại
        >
          Previous
        </button>
        {/* Hiển thị thông tin trang hiện tại */}
        <p>
          Page {page} of {totalPages}{" "}
          {/* Hiển thị số trang hiện tại và tổng số trang */}
        </p>
        {/* Nút chuyển sang trang tiếp theo */}
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === totalPages} // Vô hiệu hóa nút nếu đang ở trang cuối
          onClick={() => handlePageChange(page + 1)} // Tăng số trang hiện tại
        >
          Next
        </button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg">
            <h3 className="text-lg font-medium">Cancel Appointment</h3>
            <div className="mt-4 flex justify-between">
              <button
                onClick={confirmCancel}
                className="bg-red-500 text-white px-4 py-2 rounded m-2"
              >
                Yes, Cancel
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded m-2"
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointment;
