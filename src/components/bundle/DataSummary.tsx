
import { Card } from "@/components/ui/card";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

const DataSummary = ({ bundle }: { bundle: Bundle }) => {
  const columnNames = Object.keys(bundle.raw_data[0] || {});
  const rowCount = bundle.raw_data.length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Dataset Overview</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Number of Rows</h3>
            <p className="text-muted-foreground">{rowCount}</p>
          </div>
          <div>
            <h3 className="font-medium">Number of Columns</h3>
            <p className="text-muted-foreground">{columnNames.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Column Information</h2>
        <div className="grid gap-4">
          {columnNames.map((columnName) => (
            <div key={columnName} className="border-b pb-4 last:border-b-0">
              <h3 className="font-medium">{columnName}</h3>
              <p className="text-sm text-muted-foreground">
                Type: {typeof bundle.raw_data[0][columnName]}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DataSummary;
