'use client';

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div 
        className="w-full h-full"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(50, 50, 50, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)
          `,
          animation: 'gradientShift 20s ease-in-out infinite'
        }}
      />
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
