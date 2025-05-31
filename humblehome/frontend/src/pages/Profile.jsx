import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile({user, setUser}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullname: '', phonenumber: '', address: '' });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if(user) {
      setFormData({
        fullname: user.full_name || '',
        phonenumber: user.phone_number || '', 
        address: user.address || ''
      });

      setImageUrl(`http://localhost:5000/profile-image/${user.profile_pic}`);
    }
  }, [user]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch("http://localhost:5000/update-profile", {
      method:"PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("Profile updated!");
      const updatedUser = {...user, full_name:formData.fullname, phone_number:formData.phonenumber, address:formData.address}
      setUser(updatedUser)
    }
  }

  const handleImageUpload = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch("http://localhost:5000/upload-profile-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });

    const data = await response.json()
    if (response.ok) {
      setImageUrl(`http://localhost:5000/profile-image/${data.filename}`);
      setUser({...user, profile_image: data.filename})
      console.log(data);
      alert("Image Uploaded!");
    }else {
      alert(data.error || 'failed to upload');
    }
  }

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="w-5/6 mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>

      {imageUrl && (
        <div className="my-4">
          <img src={imageUrl} alt="Profile" className="h-32 w-32 object-cover rounded-full" />
        </div>
      )}

      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      <button
        onClick={handleImageUpload}
        className="mt-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Upload Profile Image
      </button>

      <form className="space-y-4" onSubmit={handleUpdate}>
        <input
                type="hidden"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={user.id}
                name = 'id'
            />
            <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.fullname}
                name = 'fullname'
                onChange={handleChange}
            />
            <input
                type="text"
                name = 'phonenumber'
                placeholder="Phone number"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.phonenumber}
                onChange={handleChange}
            />

            <button
                type="submit"
                className={`w-full py-2 rounded-md text-white font-semibold transition bg-orange-500 hover:bg-orange-600
                `}
            >
                Update Profile
            </button>
        </form>
    </div>
  );
}

export default Profile