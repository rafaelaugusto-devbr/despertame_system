const CollapseIcon = ({ collapsed = false }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Seta aponta para direita quando fechado, esquerda quando aberto */}
      <polyline points={collapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
    </svg>
  );

  export default CollapseIcon;
  