// Uploaded files backend (localhost:3001/uploads/...) se serve hoti hain
const BACKEND_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

export const getS3Url = (key) => {
  if (!key) return null;
  if (key.startsWith("http")) return key;

  const path = key.startsWith("/") ? key : `/${key}`;
  return `${BACKEND_URL}${path}`;
};

export default getS3Url;