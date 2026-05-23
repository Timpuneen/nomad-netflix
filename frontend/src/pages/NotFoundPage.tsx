import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#e50914',
          margin: '0 0 20px 0',
          textShadow: '0 0 20px rgba(229, 9, 20, 0.5)'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#ffffff',
          margin: '0 0 20px 0'
        }}>
          Lost your way?
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#b3b3b3',
          margin: '0 0 40px 0',
          lineHeight: '1.6'
        }}>
          Sorry, we can't find that page. You'll find lots to explore on the home page.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: '#e50914',
            color: '#ffffff',
            padding: '15px 40px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f40612'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e50914'}
        >
          Netflix Home
        </button>
      </div>
    </div>
  );
}
