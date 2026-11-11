const PARTICLES = [
  { left: '6%', size: 3, delay: '0s', duration: '19s' },
  { left: '14%', size: 2, delay: '6s', duration: '24s' },
  { left: '23%', size: 4, delay: '2.5s', duration: '21s' },
  { left: '32%', size: 2, delay: '9s', duration: '27s' },
  { left: '41%', size: 3, delay: '4s', duration: '23s' },
  { left: '52%', size: 2, delay: '11s', duration: '29s' },
  { left: '61%', size: 3, delay: '1.5s', duration: '20s' },
  { left: '70%', size: 2, delay: '7.5s', duration: '26s' },
  { left: '79%', size: 4, delay: '3s', duration: '22s' },
  { left: '88%', size: 2, delay: '10s', duration: '28s' },
  { left: '95%', size: 3, delay: '5s', duration: '25s' },
]

/**
 * Dekorasi background: orb glow, grid futuristik, dan partikel halus.
 * Semua animasi hanya memakai transform/opacity dan otomatis mati
 * saat pengguna mengaktifkan "prefers-reduced-motion".
 */
export default function Background() {
  return (
    <div className="bgDecor" aria-hidden="true">
      <div className="bgOrb bgOrb1" />
      <div className="bgOrb bgOrb2" />
      <div className="bgOrb bgOrb3" />
      <div className="bgGrid" />
      <div className="bgParticles">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="bgParticle"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </div>
  )
}
