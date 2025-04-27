import { useState, useEffect } from "react";
import dog from '../../assets/dog.jpg';

const UserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(dog);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    pet_name: "",
    contact_number: "",
    sex: "",
    breed: "",
    age: ""
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user_id = localStorage.getItem("user_id");

      if (!user_id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://testdockerbackend.azurewebsites.net/api/user/user-details?user_id=${user_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setUserDetails(data);
        setFormData({
          name: data.name,
          pet_name: data.pet_name,
          contact_number: data.contact_number,
          sex: data.pet_info.sex,
          breed: data.pet_info.breed,
          age: data.pet_info.age,
        });

        if (data.file_path) {
          setProfilePicture(data.file_path);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadProfilePicture = async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    try {
      const response = await fetch('https://testdockerbackend.azurewebsites.net/api/user/upload-profile-picture', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setProfilePicture(result.file_url); // Update profile picture
      } else {
        throw new Error(result.error || "Failed to upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
    }
  };

  const handleSave = async () => {
    const user_id = localStorage.getItem("user_id");
  
    if (!user_id) {
      setError("User not logged in");
      return;
    }
  
    try {
      if (selectedFile) {
        await uploadProfilePicture(user_id, selectedFile);
      }
  
      const response = await fetch(`https://testdockerbackend.azurewebsites.net/api/user/user-details?user_id=${user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          ...formData,
        }),
        mode: "cors", // Ensure CORS mode is explicitly set
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
  
      setUserDetails(data);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userDetails) {
    return <div>No user details available.</div>;
  }

  const { name, pet_name, contact_number, pet_info } = userDetails;
  const { sex, breed, age } = pet_info;

  return (
    <div>
      <main className="w-full p-8 h-screen bg-very-bright-pastel-orange">
        <h2 className="text-2xl font-semibold mb-6 mt-20">My Profile</h2>
        <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={profilePicture}
              alt="User Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-xl font-semibold"
                  />
                ) : (
                  name
                )}
              </h3>
              <p className="text-gray-500">
                {isEditing ? (
                  <input
                    type="text"
                    name="pet_name"
                    value={formData.pet_name}
                    onChange={handleChange}
                    className="text-lg"
                  />
                ) : (
                  pet_name
                )}
                's Owner
              </p>
            </div>
            <button
              onClick={handleEditToggle}
              className="ml-auto text-blue-500 hover:underline"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Pet Name</p>
              {isEditing ? (
                <input
                  type="text"
                  name="pet_name"
                  value={formData.pet_name}
                  onChange={handleChange}
                  className="text-lg"
                />
              ) : (
                <p className="text-lg">{pet_name}</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Age</p>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="text-lg"
                />
              ) : (
                <p className="text-lg">{age} Years Old</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Sex</p>
              {isEditing ? (
                <input
                  type="text"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="text-lg"
                />
              ) : (
                <p className="text-lg">{sex}</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Dog Breed</p>
              {isEditing ? (
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="text-lg"
                />
              ) : (
                <p className="text-lg">{breed}</p>
              )}
            </div>
          </div>
          {isEditing && (
            <button
              onClick={handleSave}
              className="text-blue-500 hover:underline mt-4"
            >
              Save
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDetails;
