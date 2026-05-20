import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  count?: number;
  marginTop?: string;
  marginBottom?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px',
  borderRadius = '8px',
  className = '',
  count = 1,
  marginTop = '0',
  marginBottom = '0'
}) => {
  const skeletons = Array(count).fill(0);

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={className}
          style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonLoading 1.5s infinite',
            marginTop: index === 0 ? marginTop : '0',
            marginBottom: index === skeletons.length - 1 ? marginBottom : '12px'
          }}
        />
      ))}
      <style>{`
        @keyframes skeletonLoading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
};

export default Skeleton;