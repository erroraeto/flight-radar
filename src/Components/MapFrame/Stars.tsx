import React from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { RecursivePartial, IOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

export const Stars = React.memo(function Stars() {
  const options: RecursivePartial<IOptions> = React.useMemo(
    () => ({
      fullScreen: { enable: true },
      background: { color: { value: 'black' } },
      fpsLimit: 60,
      particles: {
        number: {
          value: 600,
          seed: 45,
        },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        size: { value: { min: 0.2, max: 1 } },
        opacity: { value: { min: 0.3, max: 0.8 } },
        move: { enable: true, speed: 0.1, direction: 'none', random: true },
        links: { enable: false },
      },
    }),
    [],
  );
  React.useEffect(() => {
    initParticlesEngine(loadSlim);
    console.log('init particles');
  }, []);

  return <Particles id="stars" options={options} />;
});
