import React from "react";
import styled from "@emotion/styled";
import dayjs from "dayjs";
import { ReactComponent as RainIcon } from "../images/rain.svg";
import { ReactComponent as AirFlowIcon } from "../images/airFlow.svg";
import { ReactComponent as RefreshIcon } from "../images/refresh.svg";
import { ReactComponent as LoadingIcon } from "../images/loading.svg";
import WeatherIcon from "../conponents/WeatherIcon";
function WeatherCard({ fetchData, moment, weatherElement }) {
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
  return (
    <div>
      <WeatherCardWrapper>
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
      </WeatherCardWrapper>
    </div>
  );
}

const WeatherCardWrapper = styled.div`
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
export default WeatherCard;
