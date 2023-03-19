import ReactApexChart from "react-apexcharts";
import { useState } from "react";
function CircularApexChart({ lecture, tutorial, practical }) {
    const [state, setState] = useState({
        series: [lecture * 7.14, tutorial * 7.14, practical * 7.14],

        options: {
            chart: {
                height: 390,
                type: "radialBar",
            },

            plotOptions: {
                radialBar: {
                    offsetY: 0,
                    startAngle: 0,
                    endAngle: 270,
                    hollow: {
                        margin: 5,
                        size: "30%",
                        background: "transparent",
                        image: undefined,
                    },

                    dataLabels: {
                        name: {
                            show: false,
                        },
                        value: {
                            show: false,
                        },
                    },
                },
            },

            colors: ["#1ab7ea", "#0084ff", "#39539E"],
            labels: ["Lecture", "Tutorial", "Practical"],

            legend: {
                show: true,
                floating: true,
                fontSize: "16px",
                position: "left",
                offsetX: 160,

                offsetY: 15,
                labels: {
                    useSeriesColors: true,
                },
                markers: {
                    size: 0,
                },
                formatter: function (seriesName, opts) {
                    return (
                        seriesName +
                        ":  " +
                        opts.w.globals.series[opts.seriesIndex] / 7.14
                    );
                },
                itemMargin: {
                    vertical: 3,
                },
            },

            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            show: false,
                        },
                    },
                },
            ],
        },
    });

    return (
        <div id="chart">
            <ReactApexChart
                options={state.options}
                series={state.series}
                type="radialBar"
                height={390}
            />
        </div>
    );
}

export default CircularApexChart;
