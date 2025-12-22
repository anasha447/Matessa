// This points to your Spring Boot server
const API_BASE_URL = "http://localhost:8080"; 

export const getImageUrl = (imageName) => {
  if (!imageName) return "https://placehold.co/400?text=No+Image";
  
  // This constructs the link to your Controller's GET method
  // GET /api/public/images/{fileName}
  return `${API_BASE_URL}/api/public/images/${imageName}`;
};