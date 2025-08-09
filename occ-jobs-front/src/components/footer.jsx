const footer = () => {
  return (
    <footer style={Styles.Container} className="footer">
      <div style={Styles.Text} className="container">
        <p className="text-muted">Datos extraidos con fines educativos © 2025.</p>
      </div>
    </footer>
  );
}

export default footer;

const Styles = StyleSheet.create ({
    Container: {
        backgroundColor: "#f8f9fa",
        padding: "20px 0",
        marginTop: "40px",
        borderTop: "1px solid #e7e7e7",
        textAlign: "center",
    },
    Text: {
        padding: '0 32px'
    },
})