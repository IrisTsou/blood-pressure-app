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

function prepareThresholdLines(thresholds) {
  const thresholdGroups = new Map();
  const thresholdItems = [
    {
      value: thresholds.highSystolic,
      label: "收縮壓偏高",
      labelStroke: "#c2410c",
      stroke: "#c2410c",
      strokeDasharray: "6 6",
    },
    {
      value: thresholds.highDiastolic,
      label: "舒張壓偏高",
      labelStroke: "#c2410c",
      stroke: "#c2410c",
      strokeDasharray: "3 6",
    },
    {
      value: thresholds.lowSystolic,
      label: "收縮壓偏低",
      labelStroke: "#2563eb",
      stroke: "#2563eb",
      strokeDasharray: "6 6",
    },
    {
      value: thresholds.lowDiastolic,
      label: "舒張壓偏低",
      labelStroke: "#2563eb",
      stroke: "#2563eb",
      strokeDasharray: "3 6",
    },
  ];

  for (const item of thresholdItems) {
    const currentGroup = thresholdGroups.get(item.value) ?? {
      value: item.value,
      labels: [],
      stroke: item.stroke,
      strokeDasharray: item.strokeDasharray,
    };

    currentGroup.labels.push({
      text: item.label,
      stroke: item.labelStroke,
    });
    thresholdGroups.set(item.value, currentGroup);
  }

  return Array.from(thresholdGroups.values()).map((group) => ({
    ...group,
  }));
}

function ThresholdLineLabel({ viewBox, labels }) {
  const lineHeight = 16;
  const x = viewBox.x + viewBox.width + 10;
  const y = viewBox.y - ((labels.length - 1) * lineHeight) / 2;

  return (
    <text x={x} y={y} fontSize={13} fontWeight={700}>
      {labels.map((label, index) => (
        <tspan key={label.text} x={x} dy={index === 0 ? 0 : lineHeight} fill={label.stroke}>
          {label.text}
        </tspan>
      ))}
    </text>
  );
}

function TrendChart({ records, notificationSettings }) {
  const chartData = prepareChartData(records);
  const thresholds = normalizeBloodPressureThresholds(notificationSettings);
  const thresholdLines = prepareThresholdLines(thresholds);

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
          <LineChart data={chartData} margin={{ top: 16, right: 80, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#d9e2ec" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#52606d", fontSize: 14 }} />
            <YAxis
              domain={["dataMin - 10", "dataMax + 10"]}
              tick={{ fill: "#52606d", fontSize: 14 }}
              width={44}
            />
            <Tooltip />
            <Legend />
            {thresholdLines.map((line) => (
              <ReferenceLine
                key={`${line.value}-${line.labels.map((label) => label.text).join("-")}`}
                y={line.value}
                label={{
                  content: (props) => (
                    <ThresholdLineLabel
                      {...props}
                      labels={line.labels}
                    />
                  ),
                }}
                stroke={line.stroke}
                strokeDasharray={line.strokeDasharray}
              />
            ))}
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
