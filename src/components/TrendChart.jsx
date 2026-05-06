import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { normalizeBloodPressureThresholds } from "../utils/bloodPressureStatus";

function prepareChartData(records) {
  return [...records]
    .sort((firstRecord, secondRecord) =>
      `${firstRecord.date} ${firstRecord.time}`.localeCompare(
        `${secondRecord.date} ${secondRecord.time}`
      )
    )
    .map((record) => ({
      label: `${record.date.slice(5)} ${record.time}`,
      systolic: record.systolic,
      diastolic: record.diastolic,
    }));
}

function TrendChart({ records, notificationSettings }) {
  const chartData = prepareChartData(records);
  const thresholds = normalizeBloodPressureThresholds(notificationSettings);

  if (chartData.length < 2) {
    return (
      <section className="chart-panel">
        <h2>血壓趨勢</h2>
        <p className="empty-message">至少需要兩筆紀錄，才能畫出折線圖。</p>
      </section>
    );
  }

  return (
    <section className="chart-panel">
      <h2>血壓趨勢</h2>
      <div className="chart-wrapper" aria-label="收縮壓與舒張壓折線圖">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#d9e2ec" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#52606d", fontSize: 14 }} />
            <YAxis
              domain={["dataMin - 10", "dataMax + 10"]}
              tick={{ fill: "#52606d", fontSize: 14 }}
              width={44}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine
              y={thresholds.highSystolic}
              label="收縮壓偏高"
              stroke="#c2410c"
              strokeDasharray="6 6"
            />
            <ReferenceLine
              y={thresholds.highDiastolic}
              label="舒張壓偏高"
              stroke="#c2410c"
              strokeDasharray="3 6"
            />
            <ReferenceLine
              y={thresholds.lowSystolic}
              label="收縮壓偏低"
              stroke="#2563eb"
              strokeDasharray="6 6"
            />
            <ReferenceLine
              y={thresholds.lowDiastolic}
              label="舒張壓偏低"
              stroke="#2563eb"
              strokeDasharray="3 6"
            />
            <Line
              type="monotone"
              dataKey="systolic"
              name="收縮壓"
              stroke="#c2410c"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              name="舒張壓"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TrendChart;
