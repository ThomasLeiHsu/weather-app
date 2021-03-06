import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import WeatherCard from "./views/WeatherCard";
import WeatherSetting from "./views/WeatherSetting";
import { ThemeProvider } from "@emotion/react";
import { getMoment, findLocation } from "./utils/helper";
import useWeatherAPI from "./hooks/useWeatherAPI";

//授權碼
const AUTHORIZATTION_KEY = "CWB-1FE79B72-C9C2-4FDD-BD31-F7C60F0066A2";
//深淺色主題css
const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};
function App() {
  const [currentTheme, setCurrentTheme] = useState("light");
  const storageCityName = localStorage.getItem("cityName") || "臺北市";
  const [currentCity, setCurrentCity] = useState(storageCityName);
  const currentLocation = useMemo(() => findLocation(currentCity), [
    currentCity,
  ]);
  const { cityName, locationName, sunriseCityName } = currentLocation;
  //取得當前位置時間是早上或晚上？
  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName]);
  //使用客製化的hook useWeatherAPI
  const [weatherElement, fetchData] = useWeatherAPI({
    key: AUTHORIZATTION_KEY,
    locationName,
    cityName,
  });
  //useEffect 判斷當地時間更改主題背景色
  useEffect(() => {
    //根據moment決定主題色
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);
  //判斷出現哪個頁面
  const [currentPage, setCurrentPage] = useState("WeatherCard");
  //切換頁面
  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage);
  };
  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  };
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            cityName={cityName}
            moment={moment}
            fetchData={fetchData}
            weatherElement={weatherElement}
            handleCurrentPageChange={handleCurrentPageChange}
          ></WeatherCard>
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            cityName={cityName}
            handleCurrentPageChange={handleCurrentPageChange}
            handleCurrentCityChange={handleCurrentCityChange}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

// CSS in Js
const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default App;
