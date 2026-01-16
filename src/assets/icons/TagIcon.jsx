const TagIcon = ({ size = 22, color = 'currentColor' }) => (
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
      <path d="M20 12l-8 8-10-10V2h8l10 10z" />
      <path d="M7 7h.01" />
    </svg>
  );
  
  export default TagIcon;
  