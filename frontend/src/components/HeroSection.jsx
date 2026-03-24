import { useState } from 'react'
import logo from '../assets/logo.png'
import karta from '../assets/karta.png'

export default function HeroSection() {
  const [kartaOpen, setKartaOpen] = useState(false)

  return (
    <>
      <div style={styles.hero}>
        <div style={styles.left}>
          <img src={logo} alt="Mälartåg logotyp" style={styles.logo} />
          <p style={styles.description}>
            Mälartåg trafikerar regionaltågstrafiken i Mälardalen — ett av Sveriges mest trafikerade
            pendlarnät med sträckor mellan bland annat Stockholm, Uppsala, Västerås, Eskilstuna och Örebro.
          </p>
          <p style={styles.description}>
            Det här systemet samlar automatiskt in realtidsdata från Trafikverkets öppna API och
            analyserar punktligheten — hur ofta tågen är i tid, hur långa förseningarna är och
            vilka sträckor som drabbas mest.
          </p>
          <button style={styles.kartaBtn} onClick={() => setKartaOpen(true)}>
            Visa linjekartan
          </button>
        </div>
        <div style={styles.right}>
          <img
            src={karta}
            alt="Mälartåg linjekarta"
            style={styles.kartaPreview}
            onClick={() => setKartaOpen(true)}
          />
        </div>
      </div>

      {kartaOpen && (
        <div style={styles.overlay} onClick={() => setKartaOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setKartaOpen(false)}>✕</button>
            <img src={karta} alt="Mälartåg linjekarta" style={styles.kartaFull} />
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  hero: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
  },
  left: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  logo: {
    height: '48px',
    objectFit: 'contain',
    objectPosition: 'left',
  },
  description: {
    fontSize: '0.9rem',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  kartaBtn: {
    alignSelf: 'flex-start',
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    border: '1px solid #1a5c38',
    background: '#f0fdf4',
    color: '#1a5c38',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  right: {
    flex: '0 0 auto',
  },
  kartaPreview: {
    height: '180px',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
    transition: 'opacity 0.15s',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    border: 'none',
    background: '#f3f4f6',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#374151',
  },
  kartaFull: {
    maxWidth: '80vw',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '8px',
  },
}
