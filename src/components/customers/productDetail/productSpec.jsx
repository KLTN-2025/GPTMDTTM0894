export default function ProductSpec({specs}) {
  if (!specs || specs.length === 0) {
    return (
      <section className="container specs" id="specs">
        <h2>Thông số kỹ thuật</h2>
        <p className="text-center">Chưa có thông số kỹ thuật</p>
      </section>
    );
  }
  return (
    <section className="container specs" id="specs">
      <h2>Thông số kỹ thuật</h2>
      <table>
        <tbody>
          {specs.map((spec, index) => (
            <tr key={index}>
              <th>{spec.spec_name}</th>
              <td>{spec.spec_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
