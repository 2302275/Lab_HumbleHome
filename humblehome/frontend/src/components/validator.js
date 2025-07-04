import toast from "react-hot-toast";

export function validateUsername(username) {
    const regex = /^[a-zA-Z0-9]+$/;
    if (!username) {
        return "Username is required.";
    }
    if (!regex.test(username)) {
        return "Username can only contain letters and numbers.";
        // should we perhaps phrase this differently? like "Username cannot contain special characters or spaces."
    }
    return ""; // No error
}

export function validateUsernameOrEmail(input) {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!input) {
    return "Username or email is required.";
  }

  if (!usernameRegex.test(input) && !emailRegex.test(input)) {
    return "Invalid Username or email.";
  }

  return ""; // Valid
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        return "Email is required.";
    }
    
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }
    
    return ""; 
}

// Still in development
export function searchbar(input) {
  const searchRegex = /^[a-zA-Z0-9\s]+$/;

  if (!input) {
    return "Search input is required.";
  }

  if (!searchRegex.test(input)) {
    return "Search input can only contain letters, numbers, and spaces.";
  }

  return ""; // Valid
}

// Check for file MIME type
export function validateImageTypeAndSize(file){
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 3 * 1024 * 1024; // 3MB limit (idk what the limit is so just anyhow bomb)
    
    if (!file) {
        toast.error("Please select an image file to upload.");
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG, JPG or PNG image.");
        return false;
    }
    
    // Check for file size
    if (file.size > maxSize) {
        alert("Image must be smaller than 3MB.");
        toast.error("File size exceeds the maximum limit of 3MB.");
        return false;
    }
    
    return true; // Valid
}