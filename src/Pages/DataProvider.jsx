// DataProvider.js
import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useMgectxt = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);

  const handleData = (newData) => {
    setData(newData);
  };

  return (
    <DataContext.Provider value={{ data, handleData }}>
      {children}
    </DataContext.Provider>
  );
};