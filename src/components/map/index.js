import { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import Select from "react-select";
import "echarts/lib/chart/map";

import states from "../../assets/js/states.json";

import "./styles.css";

const chartOption = {
  title: {
    text: "USA Estimates",
    subtext: "Data from Eric TECH",
    sublink: "https://eric.clst.org/tech/usgeojson/",
  },
  tooltip: {
    trigger: "item",
    showDelay: 0,
    transitionDuration: 0.2,
    formatter: function (params) {
      var value = (params.value + "").split(".");
      value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,");
      return params.seriesName + "<br/>" + params.name + ": " + value;
    },
  },
  visualMap: {
    left: "right",
    min: 0,
    max: 10000,
    inRange: {
      color: [
        "#313695",
        "#4575b4",
        "#74add1",
        "#abd9e9",
        "#e0f3f8",
        "#ffffbf",
        "#fee090",
        "#fdae61",
        "#f46d43",
        "#d73027",
        "#a50026",
      ],
    },
    text: ["High", "Low"],
    calculable: true,
  },
  toolbox: {
    show: true,
    left: "right",
    top: "top",
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {},
    },
  },
  series: [
    {
      name: "USA Estimates",
      mapType: "filteredState",
      type: "map",
      zoom: 4,
      roam: true,
      nameProperty: "NAME",
      label: {
        show: true,
      },
      emphasis: {
        label: {
          show: true,
        },
      },
    },
  ],
};

export const Map = ({}) => {
  const [state, setState] = useState(null);
  const [counties, setCounties] = useState([]);
  const [county, setCounty] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef && state) {
      mapRef.current.getEchartsInstance().showLoading();
      fetch(`/geo_data/${state.value}.json`)
        .then((json) => json.json())
        .then((usaJson) => {
          setCounties(usaJson.features);
          echarts.registerMap("filteredState", usaJson);
          mapRef.current.getEchartsInstance().hideLoading();
        });
    }
  }, [state]);

  useEffect(() => {
    if (mapRef && county) {
      const countyInfo = counties.find(
        (item) => item.properties.COUNTY === county.value
      );
      console.log(countyInfo);
      const centerCoordinate = countyInfo.geometry.coordinates[0].reduce(
        (res, cur, index) => {
          if (index === 0) {
            return [cur, cur];
          }
          let [[maxX, maxY], [minX, minY]] = res;
          if (maxX < cur[0]) {
            maxX = cur[0];
          }
          if (maxY < cur[1]) {
            maxY = cur[1];
          }
          if (minX > cur[0]) {
            minX = cur[0];
          }
          if (minY > cur[1]) {
            minY = cur[1];
          }
          return [
            [maxX, maxY],
            [minX, minY],
          ];
        },
        null
      );

      mapRef.current.getEchartsInstance().setOption({
        series: [
          {
            name: "USA Estimates",
            mapType: "filteredState",
            type: "map",
            zoom: 4,
            center: [
              (centerCoordinate[0][0] + centerCoordinate[1][0]) / 2,
              (centerCoordinate[0][1] + centerCoordinate[1][1]) / 2,
            ],
            roam: true,
            nameProperty: "NAME",
            label: {
              show: true,
            },
            emphasis: {
              label: {
                show: true,
              },
            },
            data: counties.map((item) => ({
              name: item.properties.NAME,
              value: Math.random() * 10000,
            })),
          },
        ],
      });
    }
  }, [county]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>State:</span>
          <div style={{ width: "200px" }}>
            <Select options={states} onChange={(e) => setState(e)} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span>County:</span>
          <div style={{ width: "200px" }}>
            <Select
              options={counties.map((county) => ({
                label: county.properties.NAME,
                value: county.properties.COUNTY,
              }))}
              onChange={(e) => setCounty(e)}
              style={{ width: "200px" }}
            />
          </div>
        </div>
      </div>
      <ReactEcharts
        ref={mapRef}
        option={chartOption}
        onChartReady={() => {
          console.log("Chart Ready");
        }}
        style={{ flex: 1 }}
      />
    </div>
  );
};
