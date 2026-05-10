import { supabase } from "@/integrations/supabase/client";

const buildStorageObjectUrl = (bucket: string, filePath: string) => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const encodedPath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/storage/v1/object/authenticated/${bucket}/${encodedPath}`;
};

export const fetchStorageBlob = async (bucket: string, filePath: string) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("Sesija je istekla. Prijavi se ponovno.");
  }

  const response = await fetch(buildStorageObjectUrl(bucket, filePath), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Datoteka nije dostupna.");
  }

  return response.blob();
};

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Pregled datoteke nije dostupan."));
    };
    reader.onerror = () => reject(new Error("Pregled datoteke nije dostupan."));
    reader.readAsDataURL(blob);
  });

export const downloadStorageFile = async (bucket: string, filePath: string, fileName: string) => {
  const blob = await fetchStorageBlob(bucket, filePath);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
