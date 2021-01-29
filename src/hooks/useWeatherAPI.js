import { useState, useEffect, useCallback } from "react";
//funciotn s
const fetchWeatherData = ({ loactionName, key }) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${key}&locationName=${loactionName}`
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
const fetchWeatherForcast = ({ cityName, key }) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${key}&locationName${cityName}`
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
const useWeatherAPI = ({ loactionName, cityName, key }) => {
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

  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoding: true,
    }));
    const [currentWeather, weatherForcast] = await Promise.all([
      fetchWeatherData({ loactionName, key }),
      fetchWeatherForcast({ cityName, key }),
    ]);
    setWeatherElement({
      ...currentWeather,
      ...weatherForcast,
      isLoding: false,
    });
  }, [loactionName, cityName, key]);
  //useEffect 取得API資料
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};
export default useWeatherAPI;
