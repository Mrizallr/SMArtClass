import { supabase } from "./supabase";

export const uploadImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`; // subfolder opsional

  const { error } = await supabase.storage
    .from("illustrations") // gunakan bucket kamu
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from("illustrations").getPublicUrl(filePath);
  return data?.publicUrl || null;
};
