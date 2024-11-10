import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20">
      {/* left side */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 md:py-10">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-20 md:w-28" src={assets.group_profiles} alt="" />
          <p className="hidden sm:block">
            Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
          </p>
        </div>
        <a href="#speciality" className="flex items-center px-8 py-3 gap-2 bg-white rounded-full text-gray-600 text-sm hover:scale-105 transition-all duration-300">
          Book Appointment <img className="w-3" src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* right side */}
      <div className="md:w-[35%] flex justify-center">
        <img
          className="w-full h-auto max-w-md rounded-lg object-cover md:object-contain"
          src={assets.header_img}
          alt="Header"
        />
      </div>
    </div>
  );
};

export default Header;
