export const uploadRecipeFromWeb = async (url: string) => {
  const response = await fetch("http://192.168.28.91:3000/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json(); // return saved recipe or message
};
