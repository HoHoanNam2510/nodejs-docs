interface Row {
  line: string;
  explanation: string;
}

interface Props {
  rows: Row[];
}

export default function LineTable({ rows }: Props) {
  return (
    <table className="line-table">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td>{row.line}</td>
            <td>{row.explanation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
