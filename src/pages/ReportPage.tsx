import React, { useState } from "react";
import {
  Card,
  Select,
  Typography,
  Space,
  Form,
  Button,
  message,
  Input,
} from "antd";
import ChartReport from "../components/ChartReport";
import { useParams } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

// mock numerical fields
const mockNumericalFields = [
  { id: "users", label: "Users" },
  { id: "submissions", label: "Submissions" },
  { id: "views", label: "Views" },
];

// mock chart data
const mockChartData: Record<string, { labels: string[]; values: number[] }> = {
  users: {
    labels: ["18-25", "26-35", "36-50", "51+"],
    values: [2, 5, 12, 9],
  },
  submissions: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    values: [39, 45, 63, 24, 56],
  },
  views: {
    labels: ["<100", "100-500", "500-1000", ">1000"],
    values: [10, 7, 5, 3],
  },
};

export default function ReportPage() {
  const { formId } = useParams();
  const [selectedField, setSelectedField] = useState("users");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [showChart, setShowChart] = useState(false);

  const handleFieldChange = (value: string) => {
    setSelectedField(value);
    setShowChart(false);
  };

  const handleChartTypeChange = (value: "bar" | "pie") => {
    setChartType(value);
    setShowChart(false);
  };

  const handleGenerate = () => {
    setShowChart(true);
    message.success("Chart generated!");
  };

  return (
    <div>
      <Card className="mb-8 shadow-md" title="Report Generator">
        <p className="mb-4 text-gray-500">
          Select a numerical field and chart type to visualize your data. Export
          your chart as PNG or PDF.
        </p>
        <Form layout="inline" className="mb-4 gap-y-4">
          <Form.Item label="Form ID">
            <Input value={formId} disabled />
          </Form.Item>
          <Form.Item label="Numerical Field">
            <Select
              value={selectedField}
              onChange={handleFieldChange}
              style={{ minWidth: 180 }}
            >
              {mockNumericalFields.map((field) => (
                <Option key={field.id} value={field.id}>
                  {field.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chart Type">
            <Select
              value={chartType}
              onChange={handleChartTypeChange}
              style={{ minWidth: 120 }}
            >
              <Option value="bar">Bar Chart</Option>
              <Option value="pie">Pie Chart</Option>
            </Select>
          </Form.Item>
          <Form.Item className="w-full">
            <Button type="primary" onClick={handleGenerate}>
              Generate
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {showChart && (
        <ChartReport
          numericalFields={mockNumericalFields}
          chartType={chartType}
          setChartType={setChartType}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          data={mockChartData[selectedField]}
        />
      )}
    </div>
  );
}
