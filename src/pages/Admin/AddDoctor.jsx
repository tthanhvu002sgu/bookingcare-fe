import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('')
  const [fees, setFees] = useState('')
  const [address, setAddress] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')

  const {backendUrl, aToken} = useContext(AdminContext)
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try{
      if(!docImg){
        return toast.error('Please upload doctor image')
      }
      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees',Number(fees))
      formData.append('address', address)
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      
      const {data} = await axios.post(backendUrl + 'api/admin/add-doctor', formData, {
        headers: {
          'Authorization': 'Bearer ' + aToken
        }
      })
      if(data.success){
        toast.success('Doctor added successfully')
        setName('')
        setEmail('')
        setPassword('')
        setExperience('')
        setFees('')
        setAddress('')
        setAbout('')
        setSpeciality('General physician')
        setDegree('')
        setDocImg(false)
      } else{
        toast.error(data.message)
      }

    } catch(e){
        toast.error(`${e.response.data.message}`)
    }
  }
  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="bg-white px-8 py-8 rounded w-full max-w-4xl  max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
            />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Name</p>
              <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-3 py-2" type="text" placeholder="Name" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-3 py-2" type="email" placeholder="Email" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Password</p>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded px-3 py-2" type="password" placeholder="Password" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="border rounded px-3 py-2" name="" id="">
                <option value="1 Year">1 Year</option>
                <option value="2 Year">1 Year</option>
                <option value="3 Year">1 Year</option>
                <option value="4 Year">1 Year</option>
                <option value="5 Year">1 Year</option>
                <option value="6 Year">1 Year</option>
                <option value="7 Year">1 Year</option>
                <option value="8 Year">1 Year</option>
                <option value="9 Year">1 Year</option>
                <option value="10 Year">1 Year</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Fees</p>
              <input value={fees} onChange={(e) => setFees(e.target.value)} className="border rounded px-3 py-2" type="number" placeholder="Fees" required />
            </div>
          </div>
          <div className="w-full lg:flex-1 flex-col gap-1">
            <div className="flex-1 flex flex-col gap-1">
              <p>Speciality</p>
              <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="border rounded px-3 py-2" name="" id="">
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Education</p>
              <input value={degree} onChange={(e) => setDegree(e.target.value)} className="border rounded px-3 py-2" type="text" placeholder="Education" required />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Address</p>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded px-3 py-2" type="text" placeholder="Address" required />
            </div>
          </div>
        </div>

        <div>
          <p className="mt-4 mb-2">About Doctor</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
           className="w-full px-4 pt-2 border rounded"
            placeholder="write about doctor"
            rows={5}
            name=""
            id=""
          ></textarea>
        </div>
        <button type="submit" className="bg-primary px-10 py-3 mt-4 text-white rounded-full">Add Doctor</button>
      </div>
    </form>
  );
};

export default AddDoctor;
