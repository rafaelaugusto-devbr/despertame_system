import React, { useEffect } from 'react';

const Rapchat = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.rapchat.io/rapchat.min.js";
    script.async = true;
    document.body.appendChild(script );

    window.RAPCHAT_CONFIG = { "id": "clw93z0cf000008l3420j1v5w" };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default Rapchat;
