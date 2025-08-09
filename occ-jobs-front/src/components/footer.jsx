const Footer = () => {
  return (
 <footer
      style={{
        background: "linear-gradient(135deg, #74ABE2, #5563DE)",
        padding: "20px 0",
        marginTop: "40px",
        borderTop: "none",
        textAlign: "center",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.15)"
      }}
      className="footer"
    >
      <div
        style={{
          padding: "0 32px"
        }}
        className="container"
      >
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            letterSpacing: "0.5px",
            transition: "transform 0.3s ease"
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          📚 Datos obtenidos para fines educativos © 2025.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
