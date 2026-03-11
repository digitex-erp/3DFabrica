import { SHA256 } from "crypto-js";

interface FabricMetadata {
  id: string;
  hash: string;
  name: string;
  timestamp: number;
  ecoImpact: {
    paperSaved: number; // in kg
  };
}

export const generateFabricHash = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result;
      const hash = SHA256(buffer as string).toString();
      resolve(hash);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const calculateEcoImpact = (fileCount: number) => {
  // Average paper saved per fabric sample (in kg)
  const paperPerSample = 0.3;
  return fileCount * paperPerSample;
};

export const processUpload = async (file: File): Promise<FabricMetadata> => {
  const hash = await generateFabricHash(file);

  return {
    id: crypto.randomUUID(),
    hash,
    name: file.name,
    timestamp: Date.now(),
    ecoImpact: {
      paperSaved: calculateEcoImpact(1),
    },
  };
};
