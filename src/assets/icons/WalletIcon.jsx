const WalletIcon = ({ size = 22, color = 'currentColor' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H7a2 2 0 0 0-2 2v6a2 2 0 0 1-2-2V7z" />
      <path d="M21 11v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h14" />
      <path d="M17 15h.01" />
    </svg>
  );
  
  export default WalletIcon;
  