import logo from '../assets/AEA.jpg';

export default function Logo({ size = 40, showText = true }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logo}
        alt="Logo AEA"
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-white/50"
      />
      {showText && (
        <div className="leading-tight">
          <p className="font-bold text-white">AEA</p>
          <p className="text-[11px] text-blue-100">Espace Membre</p>
        </div>
      )}
    </div>
  );
}
