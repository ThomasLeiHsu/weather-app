import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { ReactComponent as DayCloudyIcon } from "./images/day-cloudy.svg";
import { ReactComponent as RainIcon } from "./images/rain.svg";
import { ReactComponent as AirFlowIcon } from "./images/airFlow.svg";
import { ReactComponent as RefreshIcon } from "./images/refresh.svg";
import { ReactComponent as LoadingIcon } from "./images/loading.svg";
import { ThemeProvider } from "@emotion/react";
import WeatherIcon from "./conponents/WeatherIcon";
import { getMoment } from "./utils/helper";
import dayjs from "dayjs";

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
  //解構賦值
  const {
    locationName,
    description,
    windspeed,
    tempreature,
    rainPossibility,
    observationTime,
    comfortability,
    weatherCode,
    isLoding,
  } = weatherElement;
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
        <WeatherCard>
          <Location>{locationName}</Location>
          <Description>
            {description} {comfortability}
          </Description>
          <CurrentWeather>
            <Tempreature>
              {Math.round(tempreature)}
              <Celsius>°C</Celsius>
            </Tempreature>
            <WeatherIcon weatherCode={weatherCode} moment={moment} />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />
            {windspeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />
            {rainPossibility}%
          </Rain>
          <Refresh onClick={fetchData} isLoding={isLoding}>
            最後觀測時間 ：
            {new Intl.DateTimeFormat("zh-Tw", {
              hour: "numeric",
              minute: "numeric",
            }).format(dayjs(observationTime))}
            {isLoding ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
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
const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: 0 1px 3px #999999;
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`;
//location
const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;
//description
const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;
//currentWeather
const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;
//temperature
const Tempreature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;
const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;
const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  svg {
    width: 15px;
    height: 15px;
    margin-left: 10px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoding }) => (isLoding ? "1.5s" : "0s")};
  }
`;
//修改conponent的css
const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`;

export default App;
