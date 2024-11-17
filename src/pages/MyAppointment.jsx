import { useEffect, useState } from "react";

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

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

      const appointResponse = await fetch(
        "http://localhost:8083/appointment/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userIdValue }),
        }
      );

      if (!appointResponse.ok) {
        throw new Error(
          `Failed to fetch appointments. Status: ${appointResponse.status}`
        );
      }

      const appointments = await appointResponse.json();
      console.log("Appointments:", appointments);
      setAppointments(appointments);
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

      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (item) => item.appointment_Id !== selectedAppointmentId
        )
      );

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

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointment
      </p>
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
    {item.doctor.specialization.description || "Unknown Specialty"}
  </p>

  <div className="mt-2">
    <p className="font-medium text-neutral-700">
      <span className="text-neutral-900">Status: </span>
      {item.status ? item.status.name : "No status available"}
    </p>
    <p className="font-medium text-neutral-700">
      <span className="text-neutral-900">Price: </span>
      {item.doctor ? item.doctor.booking_Fee : "Price unavailable"}
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
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-200"
                  >
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
