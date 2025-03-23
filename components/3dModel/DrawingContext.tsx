import React, { createContext, useContext, useState } from "react";

interface DrawingContextType {
  color: string;
  lineWidth: number;
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [color, setColor] = useState("#FF0000");
  const [lineWidth, setLineWidth] = useState(2);

  return (
    <DrawingContext.Provider
      value={{ color, lineWidth, setColor, setLineWidth }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

export const useDrawingContext = () => {
  const context = useContext(DrawingContext);
  if (context === undefined) {
    throw new Error("useDrawingContext must be used within a DrawingProvider");
  }
  return context;
};
