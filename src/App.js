import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import WeatherCard from "./views/WeatherCard";
import { ThemeProvider } from "@emotion/react";
import { getMoment } from "./utils/helper";

//授權碼
const AUTHORIZATTION_KEY = "CWB-1FE79B72-C9C2-4FDD-BD31-F7C60F0066A2";
const LOCATION_NAME = "臺北";
const LOCATION_NAME_FORCAST = "臺北市";
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
//funciotn s
const fetchWeatherData = () => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATTION_KEY}&locationName=${LOCATION_NAME}`
  )
    .then((response) => response.json())
    .then((data) => {
      //抓到資料
      const locationData = data.records.location[0];
      //過濾資料 用reduce & include
      const weatherElements = locationData.weatherElement.reduce(
        (neededElement, item) => {
          if (["WDSD", "TEMP"].includes(item.elementName)) {
            neededElement[item.elementName] = item.elementValue;
          }
          return neededElement;
        },
        {}
      );
      // return data
      return {
        locationName: locationData.locationName,
        windspeed: weatherElements.WDSD,
        tempreature: weatherElements.TEMP,
        observationTime: locationData.time.obsTime,
        isLoding: false,
      };
    });
};
const fetchWeatherForcast = () => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATTION_KEY}&locationName${LOCATION_NAME_FORCAST}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};
function App() {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [weatherElement, setWeatherElement] = useState({
    locationName: "",
    description: "",
    windspeed: 0,
    tempreature: 0,
    rainPossibility: 0,
    observationTime: new Date(),
    weatherCode: 0,
    comfortability: "",
    isLoding: true,
  });
  //取得當前位置時間是早上或晚上？
  const moment = useMemo(() => getMoment(LOCATION_NAME_FORCAST), []);

  const fetchData = async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoding: true,
    }));
    const [currentWeather, weatherForcast] = await Promise.all([
      fetchWeatherData(),
      fetchWeatherForcast(),
    ]);
    setWeatherElement({
      ...currentWeather,
      ...weatherForcast,
      isLoding: false,
    });
  };
  //useEffect 取得API資料
  useEffect(() => {
    fetchData();
  }, []);
  //useEffect 判斷當地時間更改主題背景色
  useEffect(() => {
    //根據moment決定主題色
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard
          moment={moment}
          fetchData={fetchData}
          weatherElement={weatherElement}
        ></WeatherCard>
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
