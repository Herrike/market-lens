import Highcharts from "highcharts";
import { isFreeTierSymbol, SYMBOL_NAMES } from "@/utils/free-tier-symbols";
import type { HistoricalPrice } from "@/hooks/useStockHistory";

export function createStockChartOptions(
  selectedStock: string,
  historicalData: { data: HistoricalPrice[] },
): Highcharts.Options {
  // Transform historical data for Highcharts
  const chartData = historicalData.data
    .map((item: HistoricalPrice) => [new Date(item.date).getTime(), item.price])
    .reverse(); // Reverse to show oldest to newest

  // Determine display name
  const displayName = isFreeTierSymbol(selectedStock)
    ? `${SYMBOL_NAMES[selectedStock]} (${selectedStock})`
    : selectedStock;

  return {
    accessibility: {
      enabled: false, // Disable accessibility module to remove warning
    },
    title: {
      text: `${displayName} Price History`,
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    subtitle: {
      text: "15-Day Historical Price Data",
      style: {
        fontSize: "14px",
        color: "#666",
      },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
    },
    yAxis: {
      title: {
        text: "Price ($)",
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: "line",
        name: `${selectedStock} Price`,
        data: chartData,
        color: "#4f46e5", // Indigo for the price line
        lineWidth: 2,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 4,
            },
          },
        },
      },
    ],
    tooltip: {
      formatter: function () {
        // In Highcharts tooltip context, x and y are guaranteed to be numbers for line charts
        const timestamp = this.x;
        const price = this.y;
        return `<b>${selectedStock}</b><br/>
                ${Highcharts.dateFormat("%B %e, %Y", timestamp)}<br/>
                ${price ? "Price: $" + price.toFixed(2) : ""}`;
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            title: {
              style: {
                fontSize: "16px",
              },
            },
            subtitle: {
              style: {
                fontSize: "12px",
              },
            },
          },
        },
      ],
    },
  };
}
